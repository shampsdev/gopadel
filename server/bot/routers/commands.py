import logging
import os
from pathlib import Path

from aiogram import Router
from aiogram.exceptions import TelegramNetworkError
from aiogram.filters import Command
from aiogram.types import (
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

router = Router()
logger = logging.getLogger(__name__)

# Кешируем путь к файлу
VIDEO_PATH = Path(os.path.dirname(__file__)) / ".." / "assets" / "gopadel-hello.mp4"
WELCOME_TEXT = """Добро пожаловать в GoPadel Miniapp!

Падел начинается с людей. 
Здесь ты найдешь игры и турниры, партнеров для игры и друзей, мотивацию и энергию становиться лучше! 

Присоединяйся к турнирам, записывайся на тренировки и играй с удовольствием! 🎾"""

APP_LINK = "https://t.me/gopadel_league_bot/app"


@router.message(Command("start"))
async def start_command(message: Message):
    try:
        welcome_video = FSInputFile(VIDEO_PATH)

        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="Присоединиться к нам!", url=APP_LINK)]
            ]
        )

        await message.answer_video(
            video=welcome_video,
            caption=WELCOME_TEXT,
            reply_markup=keyboard,
        )
    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети Telegram: {e}")
        try:
            keyboard = InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="Присоединиться к нам!", url=APP_LINK)]
                ]
            )
            await message.answer(
                text=WELCOME_TEXT,
                reply_markup=keyboard,
            )
        except Exception as text_err:
            logger.error(f"Не удалось отправить даже текстовое сообщение: {text_err}")
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке приветствия: {e}")


@router.message()
async def handle_all_other_messages(message: Message):
    """Обработчик всех остальных сообщений (не /start)"""
    await message.answer("Я тебя не понимаю")
