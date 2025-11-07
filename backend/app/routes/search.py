from fastapi import APIRouter, FastAPI, UploadFile, File, HTTPException, Path
from fastapi.responses import FileResponse
import os
import typing
from services.q_client import QdrantConnector
from core import config

router = APIRouter()
connector = QdrantConnector(collection_name=config.name_collention)

@router.get("/search")
async def search(text) -> dict:
    try:
        results = connector.query(text=text, limit=3)
        return {"results": [result.payload for result in results]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

