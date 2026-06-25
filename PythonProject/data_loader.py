import os
from google import genai
from google.genai import types
from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
from dotenv import load_dotenv

load_dotenv()

# ─── AUTO-RETRY CONFIGURATION FOR THE GOOGLE CLIENT ───
retry_policy = types.HttpRetryOptions(
    initial_delay=1.0,
    attempts=5,
    exp_base=2,
    http_status_codes=[429, 500, 502, 503, 504]
)

client = genai.Client(
    http_options=types.HttpOptions(
        retry_options=retry_policy,
        timeout=60 * 1000
    )
)

# FIXED: Swapped to the mainline, fully developer API key-supported model
EMBED_MODEL = "gemini-embedding-001"
EMBED_DIM = 768  # Target clamped dimensionality dimensions

splitter = SentenceSplitter(chunk_size=1000, chunk_overlap=200)


# ─── DYNAMIC FILE PATH INGESTION ENGINE ───
def load_and_chunk_pdf(file_path: str):
    """
    Accepts any custom absolute or relative file path string
    passed down from your main application router layout.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Target document file path not found: {file_path}")

    docs = PDFReader().load_data(file=file_path)
    texts = [doc.text for doc in docs if getattr(doc, "text", None)]
    chunks = []
    for t in texts:
        chunks.extend(splitter.split_text(t))
    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Calls Gemini's dense vector mapping endpoints cleanly.
    """
    # FIXED: Added explicit output_dimensionality parameter configuration to clamp matrix mapping bounds to 768
    response = client.models.embed_content(
        model=EMBED_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(output_dimensionality=768)
    )
    # Safely extract the inner coordinate floats list array out of the response map
    return [item.values for item in response.embeddings]