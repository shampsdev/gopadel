from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.payments import configure_yookassa


from config import settings
from api.deps import SessionDep

configure_yookassa()

app = FastAPI(
    docs_url=None if settings.DEBUG else "/docs",
    redoc_url=None if settings.DEBUG else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root(db: SessionDep):
    return {"message": "Hello World"}
