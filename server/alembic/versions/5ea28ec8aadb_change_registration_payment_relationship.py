"""change_registration_payment_relationship

Revision ID: 5ea28ec8aadb
Revises: f35be6fe7c22
Create Date: 2025-06-04 23:05:29.160793

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = "5ea28ec8aadb"
down_revision: Union[str, None] = "f35be6fe7c22"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - change Registration:Payment from 1:1 to 1:M."""

    # 1. Add registration_id column to payments table
    op.add_column("payments", sa.Column("registration_id", sa.Uuid(), nullable=True))

    # 2. Add foreign key constraint for registration_id
    op.create_foreign_key(
        "fk_payments_registration_id",
        "payments",
        "registrations",
        ["registration_id"],
        ["id"],
    )

    # 3. Migrate existing data: copy payment_id from registrations to registration_id in payments
    op.execute(
        text(
            """
        UPDATE payments 
        SET registration_id = (
            SELECT id 
            FROM registrations 
            WHERE registrations.payment_id = payments.id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM registrations 
            WHERE registrations.payment_id = payments.id
        )
    """
        )
    )

    # 4. Drop the foreign key constraint on payment_id in registrations
    op.drop_constraint(
        op.f("registrations_payment_id_fkey"), "registrations", type_="foreignkey"
    )

    # 5. Drop the payment_id column from registrations
    op.drop_column("registrations", "payment_id")


def downgrade() -> None:
    """Downgrade schema - revert to 1:1 relationship."""

    # 1. Add back payment_id column to registrations
    op.add_column(
        "registrations",
        sa.Column("payment_id", sa.UUID(), autoincrement=False, nullable=True),
    )

    # 2. Add back foreign key constraint
    op.create_foreign_key(
        op.f("registrations_payment_id_fkey"),
        "registrations",
        "payments",
        ["payment_id"],
        ["id"],
    )

    # 3. Migrate data back: set payment_id in registrations from latest payment
    op.execute(
        text(
            """
        UPDATE registrations 
        SET payment_id = (
            SELECT id 
            FROM payments 
            WHERE payments.registration_id = registrations.id
            ORDER BY payments.date DESC
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 
            FROM payments 
            WHERE payments.registration_id = registrations.id
        )
    """
        )
    )

    # 4. Drop foreign key constraint for registration_id in payments
    op.drop_constraint("fk_payments_registration_id", "payments", type_="foreignkey")

    # 5. Drop registration_id column from payments
    op.drop_column("payments", "registration_id")
