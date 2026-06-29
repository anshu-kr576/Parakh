# 🤖 AI Service Key Response Schemas

This document defines the JSON response structures returned by the **Python FastAPI AI Service** back to the **Express.js API Gateway** for the three critical milestones of the evaluation pipeline.

---

## 📄 1. Question Paper Parser Response

### Endpoint: `POST /ai/parse-question-paper`
* **Purpose:** Returns the list of parsed questions extracted from the exam paper PDF/Image.
* **Response Payload:**

```json
{
  "exam_id": "exam_abc123",
  "total_questions": 5,
  "questions": [
    {
      "question_no": 1,
      "question_text": "Explain the OSI model with a diagram.",
      "marks": 10,
      "page_no": 1,
      "type": "descriptive",
      "has_diagram_expected": true
    }
  ]
}
```

### 📋 Field Explanations
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `exam_id` | String | Unique identifier of the target examination session. |
| `total_questions` | Integer | Total count of questions parsed from the document. |
| `questions` | Array | List of extracted question objects. |
| `questions[].question_no` | Integer/String | Sequential identifier or label of the question. |
| `questions[].question_text` | String | Extracted text content of the question. |
| `questions[].marks` | Integer/Float | Assigned mark weightage for the question. |
| `questions[].page_no` | Integer | Page index in the question paper document where this question was located. |
| `questions[].type` | String | Nature of the question (e.g., `"descriptive"`, `"mcq"`, `"numerical"`). |
| `questions[].has_diagram_expected` | Boolean | Flag indicating whether the question instructions prompt a drawing/diagram answer. |

---

## 🧮 2. Rubric Generator Response

### Endpoint: `POST /ai/generate-rubric`
* **Purpose:** Returns structural points of marking criteria compiled by AI from the teacher's specifications.
* **Response Payload:**

```json
{
  "exam_id": "exam_abc123",
  "rubrics": [
    {
      "question_no": 1,
      "total_marks": 10,
      "criteria": [
        { "id": "c1", "description": "Correct number of layers mentioned", "marks": 2 },
        { "id": "c2", "description": "Each layer's function explained", "marks": 4 },
        { "id": "c3", "description": "Accurate diagram with labels", "marks": 4 }
      ]
    }
  ]
}
```

### 📋 Field Explanations
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `exam_id` | String | Unique identifier of the target examination session. |
| `rubrics` | Array | Mapped list of marking instructions grouped by question. |
| `rubrics[].question_no` | Integer/String | Identifier matching the question parser schema. |
| `rubrics[].total_marks` | Integer/Float | Total weightage allocated to this question. |
| `rubrics[].criteria` | Array | List of distinct grading requirements to look for in the answer. |
| `rubrics[].criteria[].id` | String | Alphanumeric tag representing the criteria point (e.g. `"c1"`, `"c2"`). |
| `rubrics[].criteria[].description` | String | Detailed grading instruction mapping user requirements. |
| `rubrics[].criteria[].marks` | Integer/Float | Score weight allocated exclusively to this criteria item. |

---

## 📝 3. Student Answer Evaluation Response

### Endpoint: `POST /ai/evaluate-answers`
* **Purpose:** Returns comprehensive grading marks, diagram analysis details, and rubrics checkpoint validations for a student's answer sheet.
* **Response Payload:**

```json
{
  "exam_id": "exam_abc123",
  "student_id": "stu_xyz456",
  "total_marks_obtained": 34,
  "total_marks_possible": 50,
  "evaluated_answers": [
    {
      "question_no": 1,
      "extracted_text": "The OSI model has 7 layers...",
      "diagram_found": true,
      "diagram_description": "Student drew a vertical stack with 7 labeled boxes",
      "marks_obtained": 8,
      "marks_possible": 10,
      "criteria_results": [
        { "id": "c1", "satisfied": true,  "marks_awarded": 2, "reason": "Correctly named all 7 layers" },
        { "id": "c2", "satisfied": true,  "marks_awarded": 4, "reason": "Functions explained clearly" },
        { "id": "c3", "satisfied": false, "marks_awarded": 2, "reason": "Diagram missing data link layer label" }
      ],
      "missing_concepts": ["Data link layer detail", "Physical layer examples"],
      "ai_confidence": "high"
    }
  ]
}
```

### 📋 Field Explanations
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `exam_id` | String | Unique identifier of the target examination session. |
| `student_id` | String | Unique reference identifier of the student. |
| `total_marks_obtained` | Integer/Float | Overall aggregated score awarded to this student for the booklet. |
| `total_marks_possible` | Integer/Float | Max obtainable cumulative points in this exam paper. |
| `evaluated_answers` | Array | Question-by-question subjective grading sheets. |
| `evaluated_answers[].question_no` | Integer/String | Matching question number index. |
| `evaluated_answers[].extracted_text` | String | Cleaned OCR transcription of handwritten response sections. |
| `evaluated_answers[].diagram_found` | Boolean | True if a sketch/drawing was extracted and analyzed in this answer. |
| `evaluated_answers[].diagram_description`| String | Descriptive summary of the layout, structure, and text annotations in the student's drawing. |
| `evaluated_answers[].marks_obtained` | Integer/Float | Sum score awarded for this single answer. |
| `evaluated_answers[].marks_possible` | Integer/Float | Max marks achievable on this question. |
| `evaluated_answers[].criteria_results` | Array | Mapped evaluations matching individual rubric points. |
| `evaluated_answers[].criteria_results[].id` | String | ID corresponding to the criteria defined in Rubric Generation. |
| `evaluated_answers[].criteria_results[].satisfied`| Boolean | True if the student response satisfied this criteria block. |
| `evaluated_answers[].criteria_results[].marks_awarded` | Integer/Float | Score awarded for this specific criterion checkpoint. |
| `evaluated_answers[].criteria_results[].reason` | String | Detail path explaining the reasoning behind the specific point mark allocation. |
| `evaluated_answers[].missing_concepts` | Array | List of core vocabulary or subtopics identified as absent from the answer. |
| `evaluated_answers[].ai_confidence` | String | AI grading reliability rating (e.g., `"high"`, `"medium"`, `"low"`). |
