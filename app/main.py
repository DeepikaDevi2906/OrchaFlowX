from fastapi import FastAPI

from api.routes import router
from db.database import Base, engine
import db.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Switchboard",
    version="1.0.0"
)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Switchboard is running 🚀"}