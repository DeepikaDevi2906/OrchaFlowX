from fastapi import FastAPI
from prometheus_client import make_asgi_app

from api.routes import router
from db.database import Base, engine
import db.models
from fastapi import Response
from observability import metrics
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Switchboard",
    version="1.0.0"
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(router)

print("\nRegistered Routes:")
for route in app.routes:
    if hasattr(route, "path"):
        print(route.path)

@app.get("/")
def root():
    return {"message": "Switchboard is running "}

@app.get("/metrics")
def metrics():

    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )