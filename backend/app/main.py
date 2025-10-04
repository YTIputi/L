from fastapi import FastAPI
from .routes import s3_routes

app = FastAPI(title="S3 FastAPI Demo")

@app.get("/")
def root():
    return {"message": "Backend is running"}

app.include_router(s3_routes.router)
