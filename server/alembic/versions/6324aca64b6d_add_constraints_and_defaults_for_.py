"""add constraints and defaults for tournaments, loyalty, payments

Revision ID: 6324aca64b6d
Revises: 8509cf73583a
Create Date: 2025-05-23 18:10:20.924312

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6324aca64b6d"
down_revision: Union[str, None] = "8509cf73583a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Tournaments: rank_min and rank_max between 0 and 7, price >= 0
    op.create_check_constraint(
        "ck_tournaments_rank_min", "tournaments", "rank_min >= 0 AND rank_min <= 7"
    )
    op.create_check_constraint(
        "ck_tournaments_rank_max", "tournaments", "rank_max >= 0 AND rank_max <= 7"
    )
    op.create_check_constraint("ck_tournaments_price", "tournaments", "price >= 0")

    # Loyalty: discount between 0 and 100
    op.create_check_constraint(
        "ck_loyalties_discount", "loyalties", "discount >= 0 AND discount <= 100"
    )

    # Payments: status in allowed, amount >= 0
    op.create_check_constraint(
        "ck_payments_status",
        "payments",
        "status IN ('pending', 'waiting_for_capture', 'succeeded', 'canceled')",
    )
    op.create_check_constraint("ck_payments_amount", "payments", "amount >= 0")

    # Set default for UUID PKs (if not already set)
    op.alter_column("payments", "id", server_default=sa.text("gen_random_uuid()"))
    op.alter_column("registrations", "id", server_default=sa.text("gen_random_uuid()"))
    op.alter_column("users", "id", server_default=sa.text("gen_random_uuid()"))
    op.alter_column("admin_users", "id", server_default=sa.text("gen_random_uuid()"))
    # Tournament already has server_default

    # Set default for timestamps (now())
    op.alter_column("tournaments", "start_time", server_default=sa.text("now()"))
    op.alter_column("registrations", "date", server_default=sa.text("now()"))
    op.alter_column("payments", "date", server_default=sa.text("now()"))
    op.alter_column("waitlists", "date", server_default=sa.text("now()"))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("ck_tournaments_rank_min", "tournaments", type_="check")
    op.drop_constraint("ck_tournaments_rank_max", "tournaments", type_="check")
    op.drop_constraint("ck_tournaments_price", "tournaments", type_="check")
    op.drop_constraint("ck_loyalties_discount", "loyalties", type_="check")
    op.drop_constraint("ck_payments_status", "payments", type_="check")
    op.drop_constraint("ck_payments_amount", "payments", type_="check")

    op.alter_column("payments", "id", server_default=None)
    op.alter_column("registrations", "id", server_default=None)
    op.alter_column("users", "id", server_default=None)
    op.alter_column("admin_users", "id", server_default=None)

    op.alter_column("tournaments", "start_time", server_default=None)
    op.alter_column("registrations", "date", server_default=None)
    op.alter_column("payments", "date", server_default=None)
    op.alter_column("waitlists", "date", server_default=None)
