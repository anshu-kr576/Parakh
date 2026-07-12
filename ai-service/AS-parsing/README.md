# Answer Sheet Parsing API

A FastAPI service that parses and evaluates student answer sheets using the Gemini API.


# Prerequisites

Before running the API, ensure the following are installed / obtained:

* Python 3.12 or later
* Git
* A valid Gemini API key


# Clone the Repository

From the project root, navigate to the API directory:

```bash
cd ai-service/AS-parsing

```


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


# Install Dependencies

```bash
pip install -r requirements.txt

```


# Configure the Gemini API Key

The application loads environment variables from a local `.env` file.

1. Copy the example environment file:

### Linux / macOS

```bash
cp .env.example .env

```

### Windows (PowerShell)

```powershell
Copy-Item .env.example .env

```

2. Open the newly created `.env` file and replace the placeholder value with your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here

```

3. Save the file and start the application.

> **Note**
> * Do **not** commit your `.env` file to version control.
> * The `.env.example` file serves as a template and should be committed to the repository, while the actual `.env` file should remain local.


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


# API Endpoints

## 1. Health Check

* **URL:** `/`
* **Method:** `GET`
* **Description:** Basic verification that the API service is active.
* **Response:**
```json
{
  "messege": "api is running"
}

```



## 2. Evaluate Answer Sheet

* **URL:** `/ai/evaluate-answers`
* **Method:** `POST`
* **Description:** Processes a student's answer sheet PDF alongside the corresponding question paper JSON structure.

### Request Format (`multipart/form-data`)

The endpoint accepts two files:

| Field | Type | Description |
| --- | --- | --- |
| `answer_pdf` | PDF File (`application/pdf`) | Student answer sheet PDF |
| `question_json` | JSON File (`application/json`) | Reference question paper schema |


# Testing the API

You can use your own question JSON and answer sheet PDF, or you can use sample test files available in:

```text
doc/test PDFs/

```

```text
doc/Architectural docs/

```

You can execute requests using these files through the Swagger UI available at:

```text
http://127.0.0.1:8000/docs

```

# API Input Expected Schema (`question_json`)

The uploaded `question_json` file must follow the exact structure of the updated `QuestionPaper` Pydantic model. Unknown fields are forbidden (`extra="forbid"`). Complex layout structures, question variants, sections, multiple-choice options, matching data arrays, and sub-questions are specified as follows:

```json
{
  "paperMetadata": {
    "title": "String (Optional, null if undetected)",
    "subject": "String (Optional, null if undetected)",
    "examType": "String (Optional, null if undetected)",
    "duration": "String (Optional, null if undetected)",
    "totalMarks": 100,
    "instructions": {
      "en": ["List of strings in English (Optional)"],
      "hi": ["List of strings in Hindi (Optional)"]
    }
  },
  "parsingStatus": {
    "success": true,
    "paperClarity": "String ('clear' | 'partially_clear' | 'unclear')",
    "confidence": 0.95,
    "errors": ["List of processing errors (Optional)"],
    "warnings": ["List of processing warnings (Optional)"]
  },
  "sections": [
    {
      "sectionId": "String - Section identifier (e.g., 'SECTION_A')",
      "sectionChoices": [
        {
          "targetNodes": ["List of affected question IDs inside this section (Optional)"],
          "detailedDescription": "String (Optional)",
          "summary": "String (Optional)"
        }
      ],
      "sectionInstructions": {
        "en": "String - English instructions for the section (Optional)",
        "hi": "String - Hindi instructions for the section (Optional)"
      },
      "questions": [
        {
          "id": "String - Unique question identifier (e.g., 'Q1')",
          "type": "String - Type of question (e.g., 'mcq', 'subjective', 'matching')",
          "text": {
            "en": "String (Optional)",
            "hi": "String (Optional)"
          },
          "options": [
            {
              "optionId": "String (e.g., 'A')",
              "text": { "en": "Option A text", "hi": "" }
            }
          ],
          "matchData": {
            "matchFrom": [
              { "en": "Column I Item 1", "hi": "" }
            ],
            "matchTo": [
              { "en": "Column II Item A", "hi": "" }
            ]
          },
          "marks": "String - Maximum marks or 'infer from children and choice description'",
          "attachments": [
            {
              "type": "String (e.g., image, table, graph)",
              "description": "String (Optional)"
            }
          ],
          "rubric": ["List of grading rules/steps (Required)"],
          "choiceInformation": {
            "detailedDescription": "String (Optional)",
            "summary": "String (Optional)"
          },
          "children": [
            {
              "id": "String - Sub-question ID (e.g., 'Q1.a')",
              "type": "String - Sub-question type",
              "text": { "en": "Sub-question text" },
              "options": null,
              "matchData": null,
              "marks": "2",
              "attachments": [],
              "rubric": ["Full marks if statement matches"],
              "choiceInformation": null,
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "globalChoices": [
    {
      "targetNodes": ["List of global Question IDs affected by this choice rule (Optional)"],
      "detailedDescription": "String (Optional)",
      "summary": "String (Optional)"
    }
  ]
}

```


# API Response Format

The API returns a JSON object containing the AI-generated evaluation of the submitted answer sheet matching the `EvaluationOutput` Pydantic model.

## General JSON Structure

```json
{
  "studentMetadata": {
    "name": "String - Student name (Required)",
    "rollNumber": "String - Roll number (Required)",
    "examCode": "String - Subject/Exam code (Required)",
    "subject": "String - Subject name (Required)"
  },
  "parsingStatus": {
    "success": "Boolean - true if extraction is mostly reliable",
    "paperClarity": "String - 'clear' | 'partially_clear' | 'unclear'",
    "overallConfidence": "Number - Score from 0.0 to 1.0",
    "errors": ["Array of Strings - Critical parsing error messages (Required)"],
    "warnings": ["Array of Strings - Non-critical parsing warning messages (Required)"]
  },
  "answerBlocks": [
    {
      "id": "String - Unique hierarchical identifier matching question structure (e.g., 'Q1', 'Q1.a')",
      "sourcePages": ["Array of Numbers - 1-based page indices where the answer is found"],
      "attemptStatus": "String - 'attempted' | 'partial' | 'crossed_out' | 'uncertain'",
      "confidence": "Number - Extraction confidence for this block from 0.0 to 1.0",
      "errors": ["Array of Strings - Specific errors in parsing this answer block (Required)"],
      "warnings": ["Array of Strings - Specific warnings in parsing this answer block (Required)"],
      "issues": ["Array of Strings - Discrepancies or notes (Required)"],
      "answerSummary": "String - Concise semantic summary of what the student wrote",
      "satisfies": ["Array of Strings - Rubric criteria/points met by the student's answer (Required)"],
      "missing": ["Array of Strings - Rubric criteria/points missing or weak in the student's answer (Required)"],
      "earnedMarks": {
        "value": "Number - Marks awarded (must not exceed max marks in question structure)",
        "reason": "String - Short explanation for the awarded or docked marks"
      },
      "children": ["Recursive Array - Sub-question answers following the same block structure"]
    }
  ],
  "invalidAnswers": ["Array of Strings - IDs of redundant attempts from optional question conflicts (Required)"],
  "attemptSummary": {
    "totalAnswerBlocks": "Number - Total count of valid answer nodes extracted (excluding invalidAnswers)",
    "attemptedQuestionIds": ["Array of Strings - Flat list of valid identified question IDs (excluding invalidAnswers)"]
  }
}

```


## Field Definitions

### 1. `studentMetadata`

General information about the student found on the answer sheet. Values are empty strings if undetected.

* **`name`**: Student name.
* **`rollNumber`**: Student roll number.
* **`examCode`**: Subject/exam code (e.g., `"086"`).
* **`subject`**: Subject name (e.g., `"SCIENCE"`).

### 2. `parsingStatus`

Global quality status of the scanned paper and transcription:

* **`success`**: `true` if extraction is mostly reliable; `false` if major extraction failures exist.
* **`paperClarity`**: Overall answer sheet readability rating. Allowed values: `"clear"`, `"partially_clear"`, `"unclear"`.
* **`overallConfidence`**: Score from `0.0` (impossible) to `1.0` (highly reliable) representing overall extraction certainty.
* **`errors`**: Critical failures affecting extraction (e.g., `["Page 3 unreadable"]`). If none, defaults to `[]`.
* **`warnings`**: Non-critical issues (e.g., `["handwriting_unclear", "page tilted"]`). If none, defaults to `[]`.

### 3. `answerBlocks`

A recursive structure mirroring the question paper hierarchy, housing the student's responses, criteria mapping, and awarded marks:

* **`id`**: Matches the question hierarchy exactly (e.g., `Q1`, `Q1.a`). If the identifier is completely unidentifiable, it is assigned `UNMAPPED_1`, `UNMAPPED_2`, etc.
* **`sourcePages`**: Page numbers (1-indexed) where the answer appears (e.g., `[2]` or `[2, 3]`).
* **`attemptStatus`**: Observed state of the answer attempt. Allowed values:
* `"attempted"`: Answer clearly written.
* `"partial"`: Answer started but incomplete.
* `"crossed_out"`: Answer intentionally cancelled.
* `"uncertain"`: Attempt presence unclear.


* **`confidence`**: Score from `0.0` to `1.0` representing extraction confidence for this specific answer block.
* **`errors`**: Localized block parsing errors. If none, defaults to `[]`.
* **`warnings`**: Localized block parsing warnings. If none, defaults to `[]`.
* **`issues`**: Short descriptions of answer extraction or interpretation problems (e.g., `["Answer partially cut near page edge"]`). If none, defaults to `[]`.
* **`answerSummary`**: Concise semantic understanding of what the student wrote.
* **`satisfies`**: List of answer components/grading criteria successfully covered. If none, defaults to `[]`.
* **`missing`**: List of missing, incomplete, or weak rubric components. If none, defaults to `[]`.
* **`earnedMarks`**:
* **`value`**: Numerical score awarded. Never exceeds maximum marks defined in the question paper schema.
* **`reason`**: Short explanation explaining why marks were awarded or docked.


* **`children`**: Recursive list of sub-answers matching the `AnswerBlock` structure. If none, defaults to `[]` (never `null`).

### 4. `invalidAnswers`

Contains IDs of redundant or excess answers resulting from optional/choice question conflicts. Valid answers are excluded from this array.

### 5. `attemptSummary`

Summary data of the student's complete attempt profile:

* **`totalAnswerBlocks`**: Total number of valid answer nodes extracted (excluding `invalidAnswers`).
* **`attemptedQuestionIds`**: Flat list containing IDs of valid identified answers only (excluding `invalidAnswers`).