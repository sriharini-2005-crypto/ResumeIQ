# ResumeIQ — AI-Powered Resume Intelligence

ResumeIQ is a web application that analyzes resumes using AI and presents the extracted information in a structured dashboard. It helps users understand their technical skills, education, experience, projects, certifications, strengths, and areas for improvement.

## 1. Features

- Upload a resume in PDF format.
- Extract text from the uploaded resume.
- Analyze resume content using the Google Gemini API.
- Identify technical skills, education, experience, projects, and certifications.
- Display resume strengths and suggested improvements.
- Generate a resume score and overall feedback.
- View the analysis through an interactive dashboard.

## 2. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend tooling | Vite |
| Styling | CSS |
| Backend | Python, FastAPI |
| AI model | Google Gemini |
| AI integration | Google Gen AI Python SDK |
| Resume extraction | PDF extraction libraries used by the backend |
| API testing | FastAPI Swagger UI |

Update the resume extraction entry with the exact library used in `extractor.py`, such as PyMuPDF or pypdf.

## 3. Project Structure

```text
ResumeIQ/
├── src/
│   ├── App.jsx
│   └── App.css
├── public/
├── backend/
│   ├── main.py
│   ├── analyzer.py
│   ├── extractor.py
│   ├── requirements.txt
│   └── .env.example
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

## 4. Prerequisites

Install the following before running the project:

- Python 3.10 or a compatible version
- Node.js and npm
- A Google Gemini API key
- Git (optional, for version control)

## 5. Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/sriharini-2005-crypto/ResumeIQ
cd ResumeIQ
```

Alternatively, open the existing project directory if it is already downloaded.

### Step 2: Set up the backend

Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

### Step 3: Configure environment variables

Create a `.env` file inside the `backend` directory.

```env
GEMINI_API_KEY=gemini_api_key
```

Replace the placeholder with your own API key. Never commit the `.env` file to GitHub.

### Step 4: Start the backend server

```bash
uvicorn main:app --reload
```

The backend should be available at:

- API base URL: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

### Step 5: Set up the frontend

Open a second terminal:

```bash
cd ResumeIQ
npm install
```

Create a frontend `.env` file for local development if the application uses a configurable API URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## 6. AI Models, APIs, and Services

**Google Gemini API**

ResumeIQ uses the Google Gemini API to analyze extracted resume text and generate structured feedback.

The model name is configured in `backend/analyzer.py`. Update this README to match the model that successfully works with your API key.

**FastAPI**

FastAPI provides the backend endpoints for resume extraction and AI analysis. Its Swagger UI can be used to test API requests.

**React and Vite**

React builds the user interface, while Vite provides the frontend development server and production build tooling.

## 7. Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `GEMINI_API_KEY` | Authenticates requests to the Gemini API | Yes |
| `VITE_API_BASE_URL` | Configures the frontend's backend API URL | Yes, if used by the application |

No actual API key or other secret values should be included in this README.

For deployment, configure the Gemini key in the backend hosting provider's environment settings and the frontend API URL in the frontend hosting provider's settings.

## 8. Testing the Main Features

1. Start the FastAPI backend and React frontend.
2. Open the ResumeIQ application in a browser.
3. Upload a valid PDF resume.
4. Verify that the application extracts the resume text.
5. Run the AI analysis.
6. Check the dashboard for the professional summary, technical skills, education, experience, projects, certifications, strengths, improvement suggestions, and resume score.
7. Upload another resume to check whether the displayed information updates correctly.
8. Open `http://127.0.0.1:8000/docs` to test the backend endpoints independently.

### Expected Result

For a readable and supported resume, the application should extract the text, send it to the backend for analysis, and display the returned results on the dashboard.

## 9. Known Limitations

- Analysis quality depends on the readability and completeness of the uploaded resume.
- Scanned PDFs may require OCR support if the current extraction implementation cannot read their text.
- Gemini API rate limits, quota exhaustion, or temporary service errors can interrupt analysis.
- Large resumes may require text-length limits or additional processing.
- The resume score is an AI-generated assessment and should not be treated as an objective or guaranteed hiring score.
- Resume history and user accounts are not available unless a database and authentication system are implemented.
- The application does not guarantee employment, ATS selection, or interview shortlisting.

Update this section to reflect the limitations that actually apply to the final implementation.

## 10. Future Enhancements

- Resume-to-job-description matching.
- ATS keyword analysis.
- Downloadable PDF analysis reports.
- Resume history and user authentication.
- Support for additional document formats.
- Improved handling of scanned resumes.

