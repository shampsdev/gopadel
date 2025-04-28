from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.payments import configure_yookassa

from api.routes.main import api_router
from config import settings
from api.deps import SessionDep

configure_yookassa()

app = FastAPI(
    docs_url="/api/v1/docs" if settings.DEBUG else None,
    redoc_url="/api/v1/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root(db: SessionDep):
    return {"message": "Hello World"}
