from datetime import datetime
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

from config import settings
from db.models.payment import Payment
from db.models.tournament import Tournament
from repositories import payment_repository
from sqlalchemy.orm import Session
from yookassa import Configuration
from yookassa import Payment as YooKassaPayment


def configure_yookassa():
    Configuration.account_id = settings.SHOP_ID
    Configuration.secret_key = settings.SHOP_SECRET


def create_invoice(
    db: Session,
    tournament: Tournament,
    discount: int,
    return_url: str,
    registration_id: UUID,
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
    # Configure YooKassa before creating payment
    configure_yookassa()

    # Create payment data
    payment_data = {
        "amount": {"value": f"{final_price}.00", "currency": "RUB"},
        "confirmation": {
            "type": "redirect",
            "return_url": return_url,
        },
        "capture": True,
        "description": f"Оплата турнира `{tournament.name}`",
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

    # Create payment record using repository
    payment = payment_repository.create_payment(
        db=db,
        payment_id=yoo_payment.id,
        amount=final_price,
        payment_link=yoo_payment.confirmation.confirmation_url,
        status=yoo_payment.status,
        registration_id=registration_id,
    )

    return payment


def create_widget_payment(
    db: Session,
    tournament: Tournament,
    discount: int,
    registration_id: UUID,
) -> Payment:

    final_price = round(tournament.price * (1 - discount / 100))

    """
    Create a payment for widget integration using YooKassa

    Args:
        db: Database session
        tournament: Tournament object
        discount: Discount percentage
        
    Returns:
        Payment object from database with payment details
    """
    # Configure YooKassa before creating payment
    configure_yookassa()

    # Create payment data for widget with SBP
    payment_data = {
        "amount": {"value": f"{final_price}.00", "currency": "RUB"},
        "capture": True,
        "description": f"GoPadel Tournament {tournament.name}",
        "confirmation": {"type": "embedded"},  # For widget integration
        "payment_method_types": ["sbp"],  # Allow only SBP payments
    }

    # Add receipt
    payment_data["receipt"] = {
        "customer": {"email": "client@gopadel.ru"},  # TODO: use real user email
        "items": [
            {
                "description": f"Участие в турнире {tournament.name}",
                "payment_subject": "service",  # Changed to service for tournament participation
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

    # Create payment record using repository
    payment = payment_repository.create_payment(
        db=db,
        payment_id=yoo_payment.id,
        amount=final_price,
        payment_link="",
        status=yoo_payment.status,
        confirmation_token=(
            yoo_payment.confirmation.confirmation_token
            if yoo_payment.confirmation
            else ""
        ),
        registration_id=registration_id,
    )

    return payment
