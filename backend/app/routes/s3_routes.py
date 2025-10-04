from fastapi import APIRouter, FastAPI, UploadFile, File, HTTPException, Path
from fastapi.responses import FileResponse
from backend.app.services.s3_client import S3Client
import os

router = APIRouter()
s3_client = S3Client()

user_books = []

@router.post("/upload/")
async def upload(file: UploadFile = File(...)):
    try:
        temp_path = os.path.join("/tmp", file.filename)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        s3_client.upload_file(temp_path, file.filename)
        os.remove(temp_path)
        return {"message": f"file '{file.filename}' uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{file_name}")
def download(file_name: str = Path(..., path=True)):
    try:
        temp_path = os.path.join("/tmp", file_name)
        s3_client.download_file(file_name, temp_path)
        return FileResponse(path=temp_path, filename=file_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/files")
def list_files():
    try:
        response = s3_client.s3.list_objects_v2(Bucket=s3_client.bucket_name)
        files = [obj['Key'] for obj in response.get('Contents', [])]
        return {"Bucket": s3_client.bucket_name, "files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/add_book/{file_name}")
async def add_book_get(file_name: str = Path(..., path=True)):
    try:
        s3_client.s3.head_object(Bucket=s3_client.bucket_name, Key=file_name)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Book '{file_name}' not found in bucket")

    if file_name not in user_books:
        user_books.append(file_name)
        return {"message": f"Book '{file_name}' added to user_books"}
    return {"message": f"Book '{file_name}' is already in user_books"}


@router.get("/user_books")
async def get_user_books():
    return {"user_books": user_books}

