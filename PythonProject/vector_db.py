import os
from pinecone import Pinecone, ServerlessSpec


class PineconeStorage:
    def __init__(self):
        # Initializes the Pinecone client automatically using PINECONE_API_KEY
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "rag-index")

        # Automatically spin up the index if it doesn't exist yet
        if self.index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=self.index_name,
                dimension=768,  # Matches text-embedding-004 dimensions
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )

        self.index = self.pc.Index(self.index_name)

    def upsert(self, ids: list, vectors: list, payloads: list):
        """Prepares and streams data packages cleanly into Pinecone storage."""
        # Pinecone expects data zipped as: (id, vector, metadata)
        data_packages = []
        for i in range(len(ids)):
            data_packages.append((ids[i], vectors[i], payloads[i]))

        # Write directly to the cloud index topology
        self.index.upsert(vectors=data_packages)

    def search(self, query_vector: list, top_k: int = 5) -> dict:
        """Queries the vector index space and extracts matching context blobs."""
        response = self.index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )

        contexts = []
        sources = []

        for match in response.get("matches", []):
            metadata = match.get("metadata", {})
            if "text" in metadata:
                contexts.append(metadata["text"])
            if "source" in metadata:
                sources.append(metadata["source"])

        return {"contexts": contexts, "sources": list(set(sources))}