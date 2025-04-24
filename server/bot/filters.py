from aiogram.filters import Filter
from aiogram.types import Message

from config import settings


class AdminFilter(Filter):
    async def __call__(self, message: Message) -> bool:
        if message.from_user is None:
            return False

        return message.from_user.id in settings.ADMINS_IDS
