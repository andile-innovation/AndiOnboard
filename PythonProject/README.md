Markdown# AndiOnboard Backend Ecosystem Core

Welcome to the **AndiOnboard Backend API**. This system serves as the foundational data management and intelligence processing layer for the AndiOnboard platform. It coordinates candidate profile data parsing, executes vector index lookups through Pinecone, interfaces with Gemini AI reasoning engines to generate tailored career roadmaps, and manages operational support tickets.

---

## 🛠️ Tech Stack & Architecture Matrix

* **Package Manager & Workflow:** `uv` (Fast Python dependency installer)
* **Framework:** FastAPI (Python 3.12)
* **Database ORM:** SQLAlchemy with PostgreSQL
* **Vector Search Engine:** Pinecone DB (Retrieval-Augmented Generation / RAG)
* **AI Engine:** Google Gemini API
* **Security:** OAuth2 (JWT Bearer Token Validation Layer)

---

## 🚀 Quick Start & Installation

#### 1. Install `uv` (If you haven't already)
```bash
pip install uv
2. Create and Sync the EnvironmentRun this in your root folder. uv will automatically read your pyproject.toml and uv.lock files to spin up a local virtual environment and sync down your precise module versions:Bashuv sync
3. Configure Environment ParametersCreate a .env file in the root project folder and supply your secret connectivity credentials:Code snippetDATABASE_URL=postgresql://postgres:secret@localhost:5432/andionboard
WT_SECRET_KEY=your_super_secret_jwt_handshake_key_matrix
PINECONE_API_KEY=your_pinecone_vector_index_key
GEMINI_API_KEY=your_google_gemini_llm_intelligence_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
4. Initialize Database SchemaRun database migrations and schema initialization scripts safely inside the virtual environment sandbox:Bashuv run python vector_db.py
5. Fire Up the Development ServerLaunch the underlying Uvicorn framework engine:Bashuv run uvicorn main:app --reload
💡 Tip: The API will spin up locally at http://127.0.0.1:8000. You can explore the interactive API specification map natively at http://127.0.0.1:8000/docs.🗺️ Core API Endpoint Registry🔐 Authentication LayerPOST /api/auth/login - Validates administrator security credentials. Returns a cryptographically signed bearer JWT token payload string.🎯 Candidate Metrics EnginePOST /api/generate-roadmap - Accepts multipart form data (name, target role, and background profile .pdf binary file). Extracts context tokens, triggers RAG vector retrieval, structures the gap analysis roadmap, and logs an internal telemetry row tracker automatically.🎫 Operational Telemetry & FeedbackPOST /api/tickets - Public endpoint allowing candidate nodes or web inquires to log platform reviews, general support tickets, or operations feedback.🛡️ Administrative Control Space (Secure Layer)⚠️ Note: All endpoints below strictly require a valid header signature: Authorization: Bearer <admin_token>GET /api/admin/tickets - Retrieves the entire collection of active and resolved operational items from storage.PATCH /api/admin/tickets/{ticket_id}/status - Updates a target row status attribute parameter (Open $\leftrightarrow$ Resolved).📁 Project Directory StructurePlaintextPythonProject/
├── Docker/                 # Environment deployment files
├── main.py                 # Application root entry, CORS configurations, and routers
├── model.py                # Database entity schemas and model structures
├── vector_db.py            # Pinecone and RAG database interaction layer
├── pyproject.toml          # Explicit project configuration and package definitions
├── uv.lock                 # Strict dependency version tree lockfile
├── .env                    # Production environmental parameters layout (secret)
└── README.md               # Main repository documentation layer
Designed and maintained by the Andile Centres of Excellence (COE) Group.
