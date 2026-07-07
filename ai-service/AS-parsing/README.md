# Answer Sheet Parsing API

A FastAPI service that parses and evaluates student answer sheets using the Gemini API.

---

# Prerequisites

Before running the API, ensure the following are installed:

* Python 3.12 or later
* Git
* A valid Gemini API key

---

# Clone the Repository

From the project root, navigate to the API directory:

```bash
cd ai-service/AS-parsing
```

---

# Create a Virtual Environment

### Linux / macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

### Windows (PowerShell)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Configure the Gemini API Key

The application expects the Gemini API key to be available as the following environment variable:

```text
GEMINI_API_KEY
```

Verify that the variable is available before starting the server.

### Linux / macOS

```bash
echo $GEMINI_API_KEY
```

### Windows (PowerShell)

```powershell
echo $env:GEMINI_API_KEY
```

If the command prints your API key, the environment variable has been configured correctly.

---

# Run the Development Server

Using FastAPI CLI:

```bash
fastapi dev app.py
```

or using Uvicorn:

```bash
uvicorn app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# API Endpoint

## Evaluate Answer Sheet

**POST**

```text
/ai/evaluate-answers
```

### Request

Send a `multipart/form-data` request containing:

| Field           | Type      | Description                |
| --------------- | --------- | -------------------------- |
| `answer_sheet`  | PDF File  | Student answer sheet PDF   |
| `question_json` | JSON File | Parsed question paper JSON |

### Response

Returns a JSON object containing the AI-generated evaluation of the submitted answer sheet.

---

# Testing the API

Sample test files are available in:

```text
doc/test PDFs/
```

You can use these files through the Swagger UI available at:

```text
http://127.0.0.1:8000/docs
```

---

# Common Issues

## `GEMINI_API_KEY` is not set

Ensure the environment variable exists and is accessible from the terminal in which you start the server.

Verify with:

### Linux / macOS

```bash
echo $GEMINI_API_KEY
```

### Windows (PowerShell)

```powershell
echo $env:GEMINI_API_KEY
```

---

## Missing Python Packages

Reinstall the project dependencies:

```bash
pip install -r requirements.txt
```

---

## Port 8000 Already in Use

Start the server on another port:

```bash
fastapi dev app.py --port 8001
```

or

```bash
uvicorn app:app --reload --port 8001
```

---

# Development Notes

* Do not hardcode API keys in the source code.
* The Gemini API key must be available as the `GEMINI_API_KEY` environment variable before starting the server.
* Docker support will be added in a future update to simplify project setup and deployment.

