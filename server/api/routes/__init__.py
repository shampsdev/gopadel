from api.routes import (
    admin,
    admin_auth,
    admin_clubs,
    admin_loyalty,
    admin_payments,
    admin_tournaments,
    admin_users,
    auth,
    registration,
    tournaments,
    users,
    waitlist,
    webhook,
)
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    tournaments.router, prefix="/tournaments", tags=["tournaments"]
)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(
    registration.router, prefix="/registration", tags=["registration"]
)
api_router.include_router(waitlist.router, prefix="/waitlist", tags=["waitlist"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin"])
api_router.include_router(admin_users.router, prefix="/admin/users", tags=["admin"])
api_router.include_router(
    admin_tournaments.router, prefix="/admin/tournaments", tags=["admin"]
)
api_router.include_router(admin_clubs.router, prefix="/admin/clubs", tags=["admin"])
api_router.include_router(admin_loyalty.router, prefix="/admin/loyalty", tags=["admin"])
api_router.include_router(
    admin_payments.router, prefix="/admin/payments", tags=["admin"]
)
api_router.include_router(webhook.router, prefix="/yookassa_webhook", tags=["webhook"])
