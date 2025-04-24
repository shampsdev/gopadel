from yookassa import Configuration

from config import settings


def configure_yookassa():
    Configuration.account_id = settings.SHOP_ID
    Configuration.secret_key = settings.SHOP_SECRET
