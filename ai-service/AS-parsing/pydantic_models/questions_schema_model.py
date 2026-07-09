from typing import List

from pydantic import BaseModel, Field

# Common Models
class LocalizedText(BaseModel):
    en: str = ""
    hi: str = ""


class Attachment(BaseModel):
    type: str = Field(
        description="Type of attachment such as image, table, graph, equation, diagram, etc."
    )
    description: str = ""


class ChoiceInformation(BaseModel):
    detailedDescription: str = ""
    summary: str = ""


class GlobalChoice(BaseModel):
    targetNodes: List[str] = Field(default_factory=list)
    detailedDescription: str = ""
    summary: str = ""

# Recursive Question Model
class Question(BaseModel):
    id: str

    text: LocalizedText

    marks: str = Field(
        description="Maximum marks or 'infer from children and choice description'."
    )

    attachments: List[Attachment] = Field(default_factory=list)

    rubric: List[str] = Field(
        default_factory=list,
        description="Marking rubric for this question."
    )

    choiceInformation: ChoiceInformation | None = None

    children: List["Question"] = Field(default_factory=list)


Question.model_rebuild()

# Metadata
class Instructions(BaseModel):
    en: List[str] = Field(default_factory=list)
    hi: List[str] = Field(default_factory=list)


class PaperMetadata(BaseModel):
    title: str = ""
    subject: str = ""
    examType: str = ""
    duration: str = ""
    totalMarks: int

    instructions: Instructions = Field(default_factory=Instructions)

# Parsing Status
class ParsingStatus(BaseModel):
    success: bool

    paperClarity: str = Field(
        description="clear | partially_clear | unclear"
    )

    confidence: float = Field(
        ge=0,
        le=1
    )

    errors: List[str] = Field(default_factory=list)

    warnings: List[str] = Field(default_factory=list)

# Root Model
class QuestionPaper(BaseModel):
    paperMetadata: PaperMetadata

    parsingStatus: ParsingStatus

    questions: List[Question] = Field(default_factory=list)

    globalChoices: List[GlobalChoice] = Field(default_factory=list)