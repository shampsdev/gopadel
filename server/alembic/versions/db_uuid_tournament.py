"""Use database UUID generation for tournaments

Revision ID: db_uuid_tournament
Revises: 4aa3a975fc09
Create Date: 2025-05-17 11:20:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "db_uuid_tournament"
down_revision: Union[str, None] = "4aa3a975fc09"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### Make sure uuid-ossp extension is available for gen_random_uuid() function ###
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # For new tournament records, use database-generated UUIDs
    op.alter_column(
        "tournaments",
        "id",
        server_default=sa.text("gen_random_uuid()"),
        existing_type=postgresql.UUID(),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Remove server_default, but keep the column
    op.alter_column(
        "tournaments",
        "id",
        server_default=None,
        existing_type=postgresql.UUID(),
        existing_nullable=False,
    )
    # Note: We don't drop the extension since other tables might use it
