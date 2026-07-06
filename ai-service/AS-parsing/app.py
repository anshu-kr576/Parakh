from fastapi import FastAPI, UploadFile, HTTPException
from google import genai
from prompt import evaluation_prompt

import os
import json

app = FastAPI()
client = genai.Client(api_key = os.getenv("GEMINI_API_KEY"))


@app.get('/')
def status():
    return {"messege": "api is running"};

# TODO:add more file validations and annotations (for better api docs)
@app.post('/ai/evaluate-answers')
async def evaluate(answer_pdf: UploadFile, question_json: UploadFile):

    # pdf check
    if answer_pdf.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Answer sheet must be a pdf"
        )
    
    # json check
    if question_json.content_type != "application/json":
        raise HTTPException(
            status_code= 400,
            detail="Question paper must be submitted as json file"
        )

    # upload answer sheet
    uploaded_answersheet = client.files.upload(
        file = answer_pdf.file,
        config = dict(mime_type='application/pdf')
    )

    # upload question json
    uploaded_questionJson = client.files.upload(
        file = question_json.file,
        config = dict(mime_type='application/json')
    )

    # make request to model
    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        store = False,
        input=[
            {
                "type": "document",
                "uri": uploaded_answersheet.uri,
                "mime_type": "application/pdf"
            },
            {
                "type":"document",
                "uri": uploaded_questionJson.uri,
                "mime_type":"application/json"
            },
            {"type": "text", "text": evaluation_prompt}
        ]
    )

    # make sure the files dont accumulate
    client.files.delete(name = uploaded_questionJson.name)
    client.files.delete(name = uploaded_answersheet.name)

    # TODO:handle curropted json from model using try except
    eval_json = json.loads(interaction.output_text)

    return eval_json

