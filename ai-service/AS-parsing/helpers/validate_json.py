from typing import Type
from pydantic import BaseModel, ValidationError
from fastapi import UploadFile

async def is_valid_json(file: UploadFile, model: Type[BaseModel])->bool:
    """Validate json schema against the pydanctic model"""
    file_bytes = await file.read()
    try:
        model.model_validate_json(file_bytes)
        return True
    except ValidationError as v:
        return False
    finally:
        await file.seek(0)