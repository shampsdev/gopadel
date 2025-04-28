import asyncio
import logging
import sys

from aiogram import Dispatcher
from aiogram.types import (
    BotCommand,
)

from bot.init_bot import bot
from bot.routers.admin import router as admin_router
from bot.routers.commands import router as command_router
from config import settings

dp = Dispatcher()


dp.include_router(admin_router)
dp.include_router(command_router)


async def main() -> None:
    await bot.set_my_commands(
        [BotCommand(command="start", description="Перезапустить бота")]
    )
    logger.info("AASJFAHIUSFHIUSFGHUOAOUHG")
    print("AASJFAHIUSFHIUSFGHUOAOUHG")
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    logger = logging.getLogger(__name__)
    if settings.DEBUG:
        logger.info(f"settings: {settings}")

    asyncio.run(main())
