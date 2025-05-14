"""default loyalty levels

Revision ID: 6e90e8d2b01e
Revises: 200c5a93cb67
Create Date: 2025-05-14 12:47:01.631362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e90e8d2b01e'
down_revision: Union[str, None] = '200c5a93cb67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    
    # Create loyalty levels
    op.bulk_insert(
        sa.table(
            "loyalties",
            sa.column("id", sa.Integer),
            sa.column("name", sa.String),
            sa.column("discount", sa.SmallInteger),
        ),
        [
            {"id": 1, "name": "Нету", "discount": 0},
            {"id": 2, "name": "GoPadel Active", "discount": 5},
            {"id": 3, "name": "GoPadel Friend", "discount": 10},
            {"id": 4, "name": "GoPadel Aksakal", "discount": 15},
            {"id": 5, "name": "Ambassador", "discount": 20},
        ],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM loyalties WHERE id IN (1, 2, 3, 4, 5)")
