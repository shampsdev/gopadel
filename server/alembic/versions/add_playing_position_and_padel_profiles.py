"""add playing position and padel profiles

Revision ID: f5d8e2a1b3c9
Revises: e3d016b74d6d
Create Date: 2024-01-15 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f5d8e2a1b3c9"
down_revision: Union[str, None] = "e3d016b74d6d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum type for playing position
    playing_position_enum = sa.Enum("right", "left", "both", name="playingposition")
    playing_position_enum.create(op.get_bind())

    # Add playing_position column
    op.add_column(
        "users", sa.Column("playing_position", playing_position_enum, nullable=True)
    )

    # Add padel_profiles column
    op.add_column("users", sa.Column("padel_profiles", sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Drop columns
    op.drop_column("users", "padel_profiles")
    op.drop_column("users", "playing_position")

    # Drop enum type
    playing_position_enum = sa.Enum("right", "left", "both", name="playingposition")
    playing_position_enum.drop(op.get_bind())
