"""add canceled_by_user to registration status enum

Revision ID: b48fe1e71060
Revises: 7e01fea4f4b4
Create Date: 2025-05-26 15:12:21.755512

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b48fe1e71060'
down_revision: Union[str, None] = '7e01fea4f4b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new enum value to existing registrationstatus enum
    op.execute("ALTER TYPE registrationstatus ADD VALUE 'CANCELED_BY_USER'")


def downgrade() -> None:
    """Downgrade schema."""
    # PostgreSQL doesn't support removing enum values directly
    # We would need to recreate the enum without the value
    # For now, we'll leave it as is since removing enum values is complex
    pass
