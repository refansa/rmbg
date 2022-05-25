from fastapi import FastAPI
from .routes import router as NoteRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)


@app.get("/", tags=["Root"])
async def read_root() -> dict:
    return {"message": "OK"}


app.include_router(NoteRouter, prefix="/api")
