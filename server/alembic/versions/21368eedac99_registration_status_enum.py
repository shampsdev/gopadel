"""registration status enum

Revision ID: 21368eedac99
Revises: add_desc_req_loy
Create Date: 2025-05-18 09:49:31.493949

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "21368eedac99"
down_revision: Union[str, None] = "add_desc_req_loy"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum type first
    registration_status = postgresql.ENUM(
        "PENDING", "ACTIVE", "CANCELED", name="registrationstatus"
    )
    registration_status.create(op.get_bind())

    # Convert existing values to match the enum values
    op.execute("UPDATE registrations SET status = 'PENDING' WHERE status = 'pending'")
    op.execute("UPDATE registrations SET status = 'ACTIVE' WHERE status = 'active'")
    op.execute("UPDATE registrations SET status = 'CANCELED' WHERE status = 'canceled'")

    # Then alter the column to use the enum
    op.alter_column(
        "registrations",
        "status",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.Enum("PENDING", "ACTIVE", "CANCELED", name="registrationstatus"),
        existing_nullable=False,
        postgresql_using="status::registrationstatus",
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Convert back to VARCHAR
    op.alter_column(
        "registrations",
        "status",
        existing_type=sa.Enum(
            "PENDING", "ACTIVE", "CANCELED", name="registrationstatus"
        ),
        type_=sa.VARCHAR(length=255),
        existing_nullable=False,
    )

    # Drop the enum type
    op.execute("DROP TYPE registrationstatus")
