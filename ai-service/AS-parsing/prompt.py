evaluation_prompt = '''
You are given:

1. A student's answer sheet PDF
2. A structured `questionStructure` JSON extracted from the question paper

The `questionStructure` hierarchy is authoritative and MUST be followed exactly.

The question structure may optionally contain rubrics.

Your task is:

Read and understand the student's answer sheet.

Perform semantic interpretation of answers rather than exact OCR transcription.

Extract answers into the EXACT JSON structure below.

Generate concise answer understanding summaries suitable for evaluation.

Determine what the student successfully covered and what appears missing.

Resolve optional-question conflicts and identify invalid attempts.

Return VALID JSON ONLY.

Do not give markdown code block.
Return only json as plain text

Never explain outside JSON.

---

RULES

GENERAL RULES

Extract ONLY student-written content.

Interpret answers semantically.

Do NOT preserve OCR text exactly.

Do NOT force character-level transcription.

Understand:

* equations
* formulas
* chemical structures
* diagrams
* flowcharts
* tables
* graphs
* mathematical expressions

Interpret visual content as meaning rather than literal symbols.

Example:

Wrong:

3/n4

Correct understanding:

3/4

if confidence strongly supports it.

Use semantic interpretation whenever handwriting ambiguity exists.

Do not hallucinate missing information.

Do not invent content unsupported by the answer sheet.

---

RUBRIC RULES

If rubrics exist inside questionStructure:

Use them while assigning marks and evaluating answer quality.

If rubrics do not exist:

Evaluate answers using normal academic expectations such as:

* correctness
* completeness
* clarity
* explanation quality
* organization
* relevance
* examples
* presentation quality
* logical structure
* bullet usage when appropriate
* answer length relative to marks

Do not rigidly depend on rubrics for satisfies or missing fields.

Use overall understanding of the answer.

---

QUESTION STRUCTURE RULES

`questionStructure` is authoritative.

Only create IDs that exist inside questionStructure.

Never invent hierarchy.

Student bullets:

i.
ii.
iii.
1.
2.
•
-

inside answers are content only.

Do NOT convert them into hierarchy unless hierarchy exists in questionStructure.

---

PARENT–CHILD RULES

RULE 1:

Parent nodes are organizational containers.

If content exists entirely inside children:

"answerSummary":""

---

RULE 2:

Do not duplicate content across parent and child.

Correct:

Q1.answerSummary=""

Q1.a.answerSummary="actual content"

---

RULE 3:

Parent summary exists only if shared content exists before child answers.

---

RULE 4:

children must always be:

[]

Never null.

---

RULE 5:

errors must always be:

[]

Never null.

---

RULE 6:

warnings must always be:

[]

Never null.

---

RULE 7:

If handwriting uncertainty exists:

Extract best semantic interpretation.

Add warning:

"handwriting_unclear"

---

RULE 8:

If answer spans multiple pages:

Include all page numbers.

Example:

[2,3]

---

RULE 9:

If question identifier missing:

Assign:

UNMAPPED_1

UNMAPPED_2

UNMAPPED_3

---

RULE 10:

Do not merge separated answer blocks unless continuity is strongly supported.

---

OPTIONAL QUESTION RULES

If a student attempts mutually exclusive optional questions:

Determine validity using choiceInformation and questionStructure rules.

Mark only excess or conflicting attempts as invalid.

Do not include invalid attempts in answerBlocks.

Store invalid answer IDs:

"invalidAnswers":[
"Q5.b",
"Q8.c"
]

---

ANSWER UNDERSTANDING RULES

For each answer node generate:

answerSummary

Concise semantic summary of what the student wrote.

Do not rewrite as ideal answer.

Do not add information absent in answer.

---

satisfies

List what the student successfully covered.

Examples:

[
"Defines operating system correctly",
"Lists key characteristics",
"Provides relevant example"
]

---

missing

List what appears absent or weak.

Examples:

[
"No explanation of memory management",
"Missing diagram",
"Limited explanation"
]

---

earnedMarks

Awarded marks must never exceed maximum marks defined in questionStructure.

If parent marks are:

"infer from children and choice description"

derive marks from child nodes.

Assign marks based on:

* rubrics if available
* otherwise typical academic evaluation expectations

Format:

{
"value":0,
"reason":""
}

Reason should briefly explain awarded or deducted marks.

---

CONFIDENCE RULES

confidence:

0 → impossible extraction

1 → highly reliable

Confidence reflects:

* handwriting certainty
* hierarchy certainty
* visual interpretation certainty
* semantic interpretation certainty

---

JSON FIELD DEFINITIONS

studentMetadata

General information about the student if present in the answer sheet.

Extract only explicitly visible information.

Do not infer missing values.

---

parsingStatus.success

true if extraction is mostly reliable.

false if major extraction failures exist.

---

paperClarity

Represents overall answer sheet readability.

Allowed values:

clear

partially_clear

unclear

---

overallConfidence

Represents overall extraction reliability.

Includes:

* handwriting readability
* page quality
* hierarchy certainty
* semantic interpretation certainty

Range:

0 → impossible extraction

1 → highly reliable extraction

---

errors

Critical failures affecting extraction.

Examples:

[
"Page 3 unreadable",
"Question numbering missing"
]

Must always exist.

Use [] if none.

---

warnings

Non-critical issues.

Examples:

[
"handwriting_unclear",
"page tilted",
"partial text overlap"
]

Must always exist.

Use [] if none.

---

id

Use question hierarchy from questionStructure.

Examples:

Q1

Q1.a

Q1.a.i

Q1.a.i.A

If question identifier unavailable:

UNMAPPED_1

UNMAPPED_2

---

sourcePages

Pages where answer appears.

Examples:

[2]

[2,3]

Must always exist.

---

attemptStatus

Represents the observed state of the answer attempt.

Allowed values:

attempted → answer clearly written

partial → answer started but incomplete

crossed_out → answer intentionally cancelled

uncertain → attempt presence unclear

---

confidence

Represents extraction confidence for this answer block.

Includes:

* handwriting certainty
* hierarchy certainty
* semantic interpretation certainty
* answer boundary certainty

Range:

0 → impossible extraction

1 → highly reliable extraction

---

issues

Short descriptions of answer extraction or interpretation problems.

Examples:

[
"Answer partially cut near page edge",
"Question number uncertain"
]

Must always exist.

Use [] if none.

---

answerSummary

A concise semantic understanding of what the student actually wrote.

Purpose:

Provide meaning of answer content.

Do NOT:

* rewrite as ideal answer
* improve answer quality
* add information
* create a textbook answer

Correct:

"Defines operating system and lists functions such as memory management and scheduling"

Wrong:

"An operating system is system software that manages computer resources..."

---

satisfies

List answer components that appear successfully covered.

Purpose:

Identify portions deserving marks.

Examples:

[
"Correct definition provided",
"Relevant example included",
"Diagram labeled correctly"
]

Do not copy directly from rubrics.

Use understanding of the answer.

---

missing

List likely missing, incomplete, or weak components based on:

- level of examination(refer question paper metadata)
- question expectations
- marks allocated
- rubric if available
- answer content

Do not invent deductions unsupported by answer context.

Avoid overly granular deductions.

Correct:

[
"Explanation incomplete",
"No example provided"
]

Wrong:

[
"Kernel architecture not discussed",
"Interrupt handling absent",
"Memory paging absent"
]

unless explicitly expected.

---

earnedMarks

Represents marks awarded for this answer.

Use rubrics if available.

Otherwise use normal academic evaluation principles.

Structure:

{
"value":0,
"reason":""
}

reason:

Short explanation only.

Correct:

"Definition correct but explanation incomplete"

Wrong:

"Student attempted the question in a reasonably good manner..."

---

children

Recursive hierarchy.

Unlimited nesting allowed.

Must always exist.

Use:

[]

Never null.

---

invalidAnswers

Contains IDs of redundant answers from optional question conflicts.

Examples:

[
"Q5.b",
"Q7.c"
]

Only include redundant attempts.

Do not include valid answers.

---

attemptSummary

Provides extraction summary.

totalAnswerBlocks

Total number of answer nodes extracted.

attemptedQuestionIds

Contains all identified valid question IDs.

Examples:

[
"Q1",
"Q2.a",
"Q5"
]

---

totalAnswerBlocks

Total number of valid answer nodes extracted.

Do not include invalidAnswers.

---

attemptedQuestionIds

Contains IDs of valid identified answers only.

Do not include invalidAnswers.

---

JSON STRUCTURE

{
"studentMetadata":{
"name":"",
"rollNumber":"",
"examCode":"",
"subject":""
},

"parsingStatus":{
"success":true,
"paperClarity":"clear",
"overallConfidence":0.95,
"errors":[],
"warnings":[]
},

"answerBlocks":[
{
"id":"Q1",

"sourcePages":[],

"attemptStatus":"attempted",

"confidence":0.95,

"errors":[],

"warnings":[],

"issues":[],

"answerSummary":"",

"satisfies":[],

"missing":[],

"earnedMarks":{
"value":0,
"reason":""
},

"children":[]
}
],

"invalidAnswers":[],

"attemptSummary":{
"totalAnswerBlocks":0,
"attemptedQuestionIds":[]
}
}

FINAL INSTRUCTION

Perform extraction in multiple passes.

Pass 1:

Identify answer regions, question identifiers, optional choices, page continuations and visual content.

Pass 2:

Verify hierarchy, continuity, diagrams, equations and semantic interpretation.

Pass 3:

Apply rubric-based evaluation if available, otherwise normal academic evaluation.

Pass 4:

Construct final hierarchy.

Pass 5:

Validate JSON consistency.

Student answers may appear non-linearly.

Preserve logical question order according to questionStructure.

Return VALID JSON ONLY.


'''