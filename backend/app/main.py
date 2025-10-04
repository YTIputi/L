from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import s3_routes

app = FastAPI(title="S3 FastAPI Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "Backend is running"}

app.include_router(s3_routes.router)
