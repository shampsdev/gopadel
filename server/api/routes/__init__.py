from api.routes import admin, admin_auth, auth, tournaments
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    tournaments.router, prefix="/tournaments", tags=["tournaments"]
)
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin_auth"])
