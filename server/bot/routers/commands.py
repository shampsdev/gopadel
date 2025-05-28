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
IMAGE_PATH = Path(os.path.dirname(__file__)) / ".." / "assets" / "welcome.jpg"
WELCOME_TEXT = "Добро пожаловать!\nЭто первая в России лига по падел для предпринимателей от предпринимателей!"
APP_LINK = "https://t.me/gopadel_league_bot/app"


@router.message()
async def msg(message: Message):
    try:
        welcome_image = FSInputFile(IMAGE_PATH)

        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="Начать игру!", url=APP_LINK)]]
        )

        await message.answer_photo(
            photo=welcome_image,
            caption=WELCOME_TEXT,
            reply_markup=keyboard,
        )
    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети Telegram: {e}")
        try:
            await message.answer(
                text=WELCOME_TEXT,
                reply_markup=keyboard,
            )
        except Exception as text_err:
            logger.error(f"Не удалось отправить даже текстовое сообщение: {text_err}")
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке приветствия: {e}")


@router.message(Command("start"))
async def start_command(message: Message):
    try:
        welcome_image = FSInputFile(IMAGE_PATH)

        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="Начать игру!", url=APP_LINK)]]
        )

        await message.answer_photo(
            photo=welcome_image,
            caption=WELCOME_TEXT,
            reply_markup=keyboard,
        )
    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети Telegram: {e}")
        try:
            await message.answer(
                text=WELCOME_TEXT,
                reply_markup=keyboard,
            )
        except Exception as text_err:
            logger.error(f"Не удалось отправить даже текстовое сообщение: {text_err}")
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке приветствия: {e}")
