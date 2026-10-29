from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

app = FastAPI()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
