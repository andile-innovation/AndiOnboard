import os
from typing import List
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from pypdf import PdfReader
from llama_index.core.node_parser import SentenceSplitter
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── GOOGLE AI STUDIO CLIENT SETUP WITH RETRIES ───
gemini_key = os.environ.get("GEMINI_API_KEY")
if not gemini_key:
    gemini_key = "YOUR_FALLBACK_KEY_HERE"

retry_policy = types.HttpRetryOptions(
    initial_delay=1.0,
    attempts=5,
    exp_base=2,
    http_status_codes=[429, 500, 502, 503, 504]
)

client = genai.Client(
    api_key=gemini_key,
    http_options=types.HttpOptions(
        api_version="v1",
        retry_options=retry_policy,
        timeout=60 * 1000
    )
)

# ─── PINECONE CLIENT LAZY INITIALIZATION ───
EMBED_MODEL = "gemini-embedding-001"
INDEX_NAME = "rag-index"
splitter = SentenceSplitter(chunk_size=1000, chunk_overlap=200)


def get_pinecone_index():
    api_key = os.environ.get("PINECONE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PINECONE_API_KEY environment variable is not set."
        )

    try:
        pc = Pinecone(api_key=api_key)
        active_indexes = [idx.name for idx in pc.list_indexes()]

        if INDEX_NAME not in active_indexes:
            print(f"Creating a fresh serverless index footprint: {INDEX_NAME}...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        return pc.Index(INDEX_NAME)
    except Exception as e:
        print(f"PINECONE ENGINE CONNECTION CRASH: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Vector database infrastructure connection failure: {str(e)}"
        )


# ─── CORE PROCESSING LOGIC ───
def load_and_chunk_pdf(path: str):
    reader = PdfReader(path)
    chunks = []
    for page in reader.pages:
        text = page.extract_text()
        if text and isinstance(text, str) and text.strip():
            chunks.extend(splitter.split_text(text))
    return chunks


def parse_in_memory_pdf(file: UploadFile) -> str:
    """Safely extracts all text strings directly from an incoming multipart upload file."""
    try:
        reader = PdfReader(file.file)
        full_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
        return "\n".join(full_text)
    except Exception as parse_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to read skills PDF content: {str(parse_err)}"
        )


def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.models.embed_content(
        model=EMBED_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(output_dimensionality=768)
    )
    return [item.values for item in response.embeddings]


# ─── 1. THE INGESTION PIPELINE ───
@app.post("/api/ingest")
async def ingest_document(file_path: str):
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target document file path not found: {file_path}"
        )

    print(f"Starting extraction for: {file_path}")
    try:
        chunks = load_and_chunk_pdf(file_path)
        if not chunks:
            return {"status": "error", "message": "No text chunks could be extracted from this PDF."}

        print(f"Extracted {len(chunks)} chunks. Generating embeddings...")
        vectors = embed_texts(chunks)

        upsert_data = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            upsert_data.append({
                "id": f"chunk_{os.path.basename(file_path)}_{i}",
                "values": vector,
                "metadata": {"text": chunk}
            })

        print("Uploading vectors to Pinecone...")
        pinecone_index = get_pinecone_index()
        pinecone_index.upsert(vectors=upsert_data)
        return {"status": "success", "message": f"Successfully ingested {len(chunks)} chunks into Pinecone!"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL ERROR ENCOUNTERED DURING INGESTION: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ─── 2. THE GENERATION PIPELINE (MULTIPART FORM FILE DRIVEN) ───
@app.post("/api/generate-roadmap")
async def generate_rag_roadmap(
        name: str = Form(...),
        role: str = Form(...),
        file: UploadFile = File(...)
):
    try:
        print(f"Processing dynamic profile gap request for user: {name}")

        # Extract user profile text directly out of their uploaded skills attachment
        user_extracted_skills = parse_in_memory_pdf(file)
        if not user_extracted_skills.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded skills PDF seems to be empty or contains non-extractable text graphics."
            )

        user_context_query = f"Onboarding guide and skill metrics required for a {role}"

        query_vectors = embed_texts([user_context_query])
        query_vector = query_vectors[0]

        pinecone_index = get_pinecone_index()
        search_results = pinecone_index.query(
            vector=query_vector,
            top_k=3,
            include_metadata=True
        )

        retrieved_context = "\n".join([
            match['metadata']['text'] for match in search_results['matches']
            if 'metadata' in match and 'text' in match['metadata']
        ])

        # Core evaluation engine
        prompt = f"""
        You are AndiOnboard, an internal career progression assistant. 
        Your task is to run an objective Gap Analysis evaluating {name} against the company requirements for the role of {role}.

        Corporate Benchmark Data (Retrieved from internal framework documents):
        {retrieved_context}

        Employee's Uploaded Background Document (Extracted Text Content):
        {user_extracted_skills}

        Please synthesize this data and output a clean, encouraging, structured review containing the following exact sections:

        1. **Role Proximity Summary**: Provide an analytical evaluation summarizing how close or far the user is from transitioning into a {role} based on their current overlap. Give a rough conceptual baseline (e.g., "Highly Aligned", "Intermediate Proximity", or "Foundational Stage").

        2. **Verified Skill Matches**: List and briefly validate the technical competencies, frameworks, or methodologies the employee already possesses that map directly to the corporate benchmark guide.

        3. **The Core Skill Gap**: Clearly outline the vital skillsets, architectural paradigms, tools, or operational proficiencies defined in the corporate guide that the employee is currently missing.

        4. **Targeted Bridging Strategy Checklist**: Map out a clean, timeline-based milestone roadmap focusing purely on closing the gaps found in section 3.
        """

        llm_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        roadmap_text = llm_response.text
        if not roadmap_text or "503" in roadmap_text or "429" in roadmap_text:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Upstream AI service is temporarily unavailable."
            )

        return {
            "user_profile": {"name": name, "role": role},
            "generated_roadmap_text": roadmap_text
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL ERROR ENCOUNTERED DURING GENERATION: {str(e)}")
        err_msg = str(e).upper()
        if "503" in err_msg or "UNAVAILABLE" in err_msg or "429" in err_msg or "QUOTA" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The upstream AI server is temporarily overloaded."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )