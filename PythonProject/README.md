### AndiOnboard Backend Ecosystem Core
Welcome to the AndiOnboard Backend API. This system serves as the foundational data management and intelligence processing layer for the AndiOnboard platform. It coordinates profile data parsing, executes vector index lookups through Pinecone, interfaces with Gemini AI reasoning engines to generate career roadmaps, and manages operational telemetry support tickets.

### Tech Stack & Architecture Matrix
Package Manager & Workflow: uv (Fast Python dependency installer)

Framework: FastAPI (Python 3.12)

Database ORM: SQLAlchemy with PostgreSQL

Vector Search Engine: Pinecone DB (Retrieval-Augmented Generation / RAG)

AI Engine: Google Gemini API

Security: OAuth2 (JWT Bearer Token Validation Layer)

### 🚀 Quick Start & Installation

#### 1. Install `uv` (If you haven't already)

```bash
pip install uv

#### 2. Create and Sync the Environment
Run this in your root folder. uv will read your pyproject.toml and your uv.lock file to automatically spin up a virtual environment and lock down the exact module versions:

```Bash
uv sync



Configure Environment Parameters
Create a .env file in the root project folder and supply your secret keys:

```Code snippet
DATABASE_URL=postgresql://postgres:secret@localhost:5432/andionboard

WT_SECRET_KEY=your_super_secret_jwt_handshake_key_matrix

PINECONE_API_KEY=your_pinecone_vector_index_key

GEMINI_API_KEY=your_google_gemini_llm_intelligence_key

ADMIN_USERNAME=admin

ADMIN_PASSWORD=your_secure_admin_password

Initialize Database Schema

# Run database migrations / initialization scripts

```Bash

uv run python vector_db.py

#### Fire Up the Development Server

```Bash

uvicorn app.main:app --reload

The API engine will spin up locally at http://127.0.0.1:8000. You can explore the interactive API specification map natively at http://127.0.0.1:8000/docs.

### Core API Endpoint Registry
#### Authentication Layer
POST /api/auth/login - Validates administrator security credentials. Returns a cryptographically signed bearer JWT token payload string.

#### Candidate Metrics Engine
POST /api/generate-roadmap - Accepts multipart form data (name, target role, and background profile .pdf binary file). Extracts context tokens, triggers RAG vector retrieval, structures the gap analysis roadmap, and logs an internal telemetry row tracker automatically.

#### Operational Telemetry & Feedback
POST /api/tickets - Public endpoint allowing candidate nodes or web inquires to log platform reviews, general support tickets, or operations feedback.

 Administrative Control Space (Secure Layer)Note: All endpoints below strictly require a valid header signature: Authorization: Bearer <admin_token>GET /api/admin/tickets - Retrieves the entire collection of active and resolved operational items from storage.PATCH /api/admin/tickets/{ticket_id}/status - Updates a target row status attribute parameter (Open $\leftrightarrow$ Resolved).

### System Architecture Tree
### 📁 Project Directory Structure

```text

PythonProject/
├── Docker/                 # Environment deployment files
├── main.py                 # Application root entry, CORS configurations, and routers
├── model.py                # Database entity schemas and model structures
├── vector_db.py            # Pinecone and RAG database interaction layer
├── pyproject.toml          # Explicit project configuration and package definitions
├── uv.lock                 # Strict dependency version tree lockfile
├── .env                    # Production environmental parameters layout (secret)
└── README.md               # Main repository documentation layer
