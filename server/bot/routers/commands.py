from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

router = Router()


@router.message()
async def msg(message: Message):
    await message.answer("Привет!")


@router.message(Command("start"))
async def start_command(message: Message):
    await message.answer("Привет!")
