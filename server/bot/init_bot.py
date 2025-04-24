from aiogram import Bot
from aiogram.client.default import DefaultBotProperties

from config import settings

bot = Bot(
    token=settings.TG_API_TOKEN, default=DefaultBotProperties(parse_mode="Markdown")
)
