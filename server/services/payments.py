from yookassa import Configuration
from yookassa import Payment as YooKassaPayment
from uuid import uuid4
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from config import settings
from db.models.payment import Payment
from db.models.tournament import Tournament


def configure_yookassa():
    Configuration.account_id = settings.SHOP_ID
    Configuration.secret_key = settings.SHOP_SECRET


def create_invoice(
    db: Session,
    tournament: Tournament,
    discount: int,
    return_url: str,
) -> Payment:
    final_price = round(tournament.price * (1 - discount / 100))

    """
    Create a payment invoice using YooKassa

    Args:
        db: Database session
        amount: Payment amount in rubles
        description: Payment description
        email: User email for receipt
        return_url: URL to redirect after payment
        receipt_items: List of items for receipt (optional)

    Returns:
        Payment object from database with payment details
    """
    # Create payment data
    payment_data = {
        "amount": {"value": f"{final_price}.00", "currency": "RUB"},
        "confirmation": {
            "type": "redirect",
            "return_url": return_url,
        },
        "capture": True,
        "description": f"GoPadel Tournament {tournament.name}",
    }

    # Add receipt if items provided
    payment_data["receipt"] = {
        "customer": {"email": "TODO@aa.aa"},
        "items": [
            {
                "description": "GoPadel Tournament",
                "payment_subject": "commodity",
                "amount": {
                    "value": f"{final_price}.00",
                    "currency": "RUB",
                },
                "vat_code": 1,
                "quantity": 1,
                "measure": "piece",
                "payment_mode": "full_payment",
            }
        ],
    }

    # Create payment in YooKassa
    yoo_payment = YooKassaPayment.create(payment_data, uuid4())

    # Check if confirmation is available
    if yoo_payment.confirmation is None:
        raise ValueError("Payment confirmation URL is missing")

    # Create payment record in database
    payment = Payment(
        id=uuid4(),
        payment_id=yoo_payment.id,
        date=datetime.now(ZoneInfo("Europe/Moscow")),
        amount=final_price,
        payment_link=yoo_payment.confirmation.confirmation_url,
        status=yoo_payment.status,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment
