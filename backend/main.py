import os

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from analyzer import analyze_resume
from extractor import extract_text

app = FastAPI(
    title="ResumeIQ API",
    description="AI-Powered Resume Intelligence Platform",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://resumeiq-frontend-sweh.onrender.com",
]

frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    allowed_origins.append(frontend_env.strip().rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ResumeIQ API!",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "ResumeIQ"
    }


@app.post("/api/extract")
async def extract_document(file: UploadFile = File(...)):
    try:
        # Read at most 5 MB plus one byte to detect oversized uploads.
        file_bytes = await file.read(5 * 1024 * 1024 + 1)

        text = extract_text(
            filename=file.filename or "",
            file_bytes=file_bytes
        )

        return {
            "filename": file.filename,
            "character_count": len(text),
            "extracted_text": text
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    finally:
        await file.close()

class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=1, max_length=20000)


app = FastAPI(
    title="ResumeIQ API",
    description="AI-Powered Resume Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ResumeIQ API!",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "ResumeIQ"
    }


@app.post("/api/extract")
async def extract_document(file: UploadFile = File(...)):
    try:
        # Read at most 5 MB plus one byte to detect oversized uploads.
        file_bytes = await file.read(5 * 1024 * 1024 + 1)

        text = extract_text(
            filename=file.filename or "",
            file_bytes=file_bytes
        )

        return {
            "filename": file.filename,
            "character_count": len(text),
            "extracted_text": text
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    finally:
        await file.close()

class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=1, max_length=20000)



from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field
from analyzer import analyze_resume
from extractor import extract_text

app = FastAPI(
    title="ResumeIQ API",
    description="AI-Powered Resume Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ResumeIQ API!",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "ResumeIQ"
    }


@app.post("/api/extract")
async def extract_document(file: UploadFile = File(...)):
    try:
        # Read at most 5 MB plus one byte to detect oversized uploads.
        file_bytes = await file.read(5 * 1024 * 1024 + 1)

        text = extract_text(
            filename=file.filename or "",
            file_bytes=file_bytes
        )

        return {
            "filename": file.filename,
            "character_count": len(text),
            "extracted_text": text
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    finally:
        await file.close()

class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=1, max_length=20000)


@app.post("/api/analyze")
async def analyze_resume_endpoint(request: ResumeAnalysisRequest):
    try:
        analysis = analyze_resume(request.resume_text)
        return {"analysis": analysis}

    except Exception as error:
        print("Gemini analysis error:", repr(error))
        raise HTTPException(
            status_code=502,
            detail="Gemini analysis failed. Check the backend terminal for the actual error."
        )