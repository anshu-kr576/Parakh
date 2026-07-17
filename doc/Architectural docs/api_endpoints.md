# 🔌 API Endpoints Specification

This document provides a detailed specification for the REST API endpoints exposed by the **Express Gateway** and the internal **AI services** in the evaluation system.

---

## 🏛️ Gateway API Endpoints (Port 5000)

The frontend communicates exclusively with the Express gateway, which orchestrates database operations (Supabase) and forwards heavy AI logic to the microservices.

### 1. Exam & Question Paper Management (`/api/exams`)

#### 📄 A. Upload and Parse Question Paper
Submit a scanned question paper PDF to extract questions, marks, and rubrics.
*   **Method:** `POST`
*   **Route:** `/api/exams/upload-paper`
*   **Request Type:** `multipart/form-data`
*   **Request Parameters:**
    - `files` (File, required): The PDF question paper file (multiple files supported up to 15, key is `files`).
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Question paper uploaded and parsed successfully.",
      "filename": "sample_exam.pdf",
      "questionPaper": {
        "paperMetadata": {
          "title": "Unit Test 1",
          "subject": "Physics",
          "examType": "Theoretical",
          "duration": "2 hours",
          "totalMarks": 50,
          "instructions": {
            "en": ["Attempt all questions.", "Draw diagrams where necessary."]
          }
        },
        "parsingStatus": {
          "success": true,
          "paperClarity": "clear",
          "confidence": 0.95,
          "errors": [],
          "warnings": []
        },
        "sections": [
          {
            "sectionId": "A",
            "sectionChoices": [],
            "sectionInstructions": { "en": "Short Answer Questions" },
            "questions": [
              {
                "id": "Q1",
                "type": "Theory",
                "text": { "en": "State Newton's first law of motion." },
                "marks": "5",
                "rubric": [],
                "attachments": [],
                "options": [],
                "matchData": {},
                "choiceInformation": {},
                "children": []
              }
            ]
          }
        ],
        "globalChoices": []
      }
    }
    ```

#### 💾 B. Save/Generate Rubric to Database
Saves the reviewed and edited question paper JSON and its associated rubrics into Supabase.
*   **Method:** `POST`
*   **Route:** `/api/exams/generate-rubric`
*   **Request Type:** `application/json`
*   **Request Body:**
    ```json
    {
      "pdf_filename": "sample_exam.pdf",
      "parsed_data": { ...questionPaper JSON object... },
      "questionPaperId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" // Optional: Provide UUID to update existing, omit to create new
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Question paper and rubrics saved successfully.",
      "examPaperId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "createdAt": "2026-07-16T00:54:26Z"
    }
    ```

#### 📋 C. List Stored Exam Papers
Retrieve a list of all parsed and saved exam papers.
*   **Method:** `GET`
*   **Route:** `/api/exams/list`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "papers": [
        {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "pdf_filename": "sample_exam.pdf",
          "parsed_data": { ... },
          "created_at": "2026-07-16T00:54:26Z"
        }
      ]
    }
    ```

---

### 2. Student Answer Sheet Evaluation (`/api/evaluations`)

#### 📝 A. Upload & Evaluate Answer Sheet
Submits a student's answer sheet PDF, fetches the questions/rubrics from Supabase, sends them to the Python AI service for grading, and persists the evaluation.
*   **Method:** `POST`
*   **Route:** `/api/evaluations/upload-answers`
*   **Request Type:** `multipart/form-data`
*   **Request Parameters:**
    - `files` (File, required): The scanned handwritten student answer sheet PDF.
    - `question_paper_id` (Text, required): The UUID of the associated exam paper template from the `exam_papers` table.
    - `student_name` (Text, optional): Optional override name of the student.
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Answer sheet evaluated and stored successfully.",
      "evaluationId": "c59b2089-a292-4d0d-9b5d-16a7f05ad42c",
      "createdAt": "2026-07-16T00:58:12Z",
      "obtainedMarks": 38,
      "maxMarks": 50,
      "evaluationData": {
        "studentMetadata": {
          "name": "Jane Doe",
          "rollNumber": "PHYS-102",
          "examCode": "086",
          "subject": "Physics"
        },
        "parsingStatus": {
          "success": true,
          "paperClarity": "clear",
          "overallConfidence": 0.92,
          "errors": [],
          "warnings": []
        },
        "answerBlocks": [
          {
            "id": "Q1",
            "sourcePages": [1],
            "attemptStatus": "attempted",
            "confidence": 0.94,
            "errors": [],
            "warnings": [],
            "issues": [],
            "answerSummary": "Student states that an object remains at rest or in uniform motion unless acted upon by a net force.",
            "satisfies": ["Correctly states inertia property", "Correctly identifies force condition"],
            "missing": ["Missing specific mention of constant velocity vector"],
            "earnedMarks": {
              "value": 4.5,
              "reason": "Accurate definition, minor mathematical omission."
            },
            "children": []
          }
        ],
        "invalidAnswers": [],
        "attemptSummary": {
          "totalAnswerBlocks": 1,
          "attemptedQuestionIds": ["Q1"]
        }
      }
    }
    ```

#### 📊 B. Get Evaluations for an Exam Paper
Retrieve all grading results and marks records associated with a specific exam paper ID.
*   **Method:** `GET`
*   **Route:** `/api/evaluations/paper/:examPaperId`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "evaluations": [
        {
          "id": "c59b2089-a292-4d0d-9b5d-16a7f05ad42c",
          "studentName": "Jane Doe",
          "filename": "jane_doe_physics.pdf",
          "evaluationId": "c59b2089-a292-4d0d-9b5d-16a7f05ad42c",
          "evaluationData": { ... },
          "obtainedMarks": 38,
          "maxMarks": 50,
          "createdAt": "2026-07-16T00:58:12Z"
        }
      ]
    }
    ```

---

## 🤖 Internal Microservices API Endpoints

These endpoints are called internally by the Express gateway. They should not be exposed to the public internet directly.

### 1. `QP-parsing` AI Service (Port 3000)
Used to parse Question Papers.
*   **Method:** `POST`
*   **Route:** `/ai/parse-question-paper`
*   **Request Type:** `multipart/form-data`
*   **Request Parameters:**
    - `QP` (File array): Uploaded files.
*   **Response:** Raw question paper structure JSON (matches `question_paper_schema.md`).

### 2. `AS-parsing` AI Service (Port 8000)
Used to evaluate Answer Sheets.
*   **Method:** `POST`
*   **Route:** `/ai/evaluate-answers`
*   **Request Type:** `multipart/form-data`
*   **Request Parameters:**
    - `answer_pdf` (File): Student answer sheet PDF.
    - `question_json` (File): JSON database entry representing the question structure/rubric mapping.
*   **Response:** Raw evaluation result JSON (matches `answer_sheet_schema.md`).
