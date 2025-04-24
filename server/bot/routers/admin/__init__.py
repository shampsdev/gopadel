from aiogram import Router

from bot.middlewares import DatabaseMiddleware
from bot.filters import AdminFilter


router = Router()
router.message.filter(AdminFilter())
router.message.middleware(DatabaseMiddleware())
router.callback_query.middleware(DatabaseMiddleware())
