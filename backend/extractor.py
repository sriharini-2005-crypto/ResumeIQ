
from io import BytesIO
from pypdf import PdfReader


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def extract_text(filename: str, file_bytes: bytes) -> str:
    """Extract readable text from a PDF or TXT file."""

    if not file_bytes:
        raise ValueError("The uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("File size must not exceed 5 MB.")

    extension = filename.lower().rsplit(".", 1)[-1]

    if extension == "txt":
        try:
            text = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise ValueError(
                "Unable to read this text file. Please use UTF-8 encoding."
            )

    elif extension == "pdf":
        try:
            reader = PdfReader(BytesIO(file_bytes))

            if reader.is_encrypted:
                raise ValueError(
                    "Password-protected PDFs are not supported."
                )

            if len(reader.pages) > 50:
                raise ValueError(
                    "PDFs with more than 50 pages are not supported."
                )

            text = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )

        except ValueError:
            raise
        except Exception:
            raise ValueError(
                "Unable to read this PDF. Please upload a valid PDF."
            )

    else:
        raise ValueError(
            "Unsupported file type. Please upload a PDF or TXT file."
        )

    if not text.strip():
        raise ValueError(
            "No readable text found. Try a text-based PDF or TXT file."
        )

    return text.strip()
