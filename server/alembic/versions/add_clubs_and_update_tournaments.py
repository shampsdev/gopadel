"""Add clubs table and update tournaments

Revision ID: f3a4b1d9c8e7
Revises: 13c1e0f9326a
Create Date: 2024-01-01 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f3a4b1d9c8e7"
down_revision: Union[str, None] = "13c1e0f9326a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create clubs table
    op.create_table(
        "clubs",
        sa.Column(
            "id",
            postgresql.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # Add club_id column to tournaments
    op.add_column("tournaments", sa.Column("club_id", postgresql.UUID(), nullable=True))

    # Add tournament_type column to tournaments
    op.add_column(
        "tournaments",
        sa.Column("tournament_type", sa.String(length=100), nullable=True),
    )

    # Create a default club for existing tournaments
    op.execute(
        """
        INSERT INTO clubs (name, address) 
        VALUES ('Временный клуб', 'Адрес будет обновлен')
    """
    )

    # Update existing tournaments to use the default club
    op.execute(
        """
        UPDATE tournaments 
        SET club_id = (SELECT id FROM clubs LIMIT 1),
            tournament_type = 'Американо'
        WHERE club_id IS NULL
    """
    )

    # Make the columns non-nullable after setting default values
    op.alter_column("tournaments", "club_id", nullable=False)
    op.alter_column("tournaments", "tournament_type", nullable=False)

    # Create foreign key constraint
    op.create_foreign_key(
        "fk_tournaments_club_id", "tournaments", "clubs", ["club_id"], ["id"]
    )

    # Drop the location column
    op.drop_column("tournaments", "location")


def downgrade() -> None:
    # Add back location column
    op.add_column(
        "tournaments",
        sa.Column("location", sa.String(length=255), nullable=False, server_default=""),
    )

    # Drop foreign key constraint
    op.drop_constraint("fk_tournaments_club_id", "tournaments", type_="foreignkey")

    # Drop new columns
    op.drop_column("tournaments", "tournament_type")
    op.drop_column("tournaments", "club_id")

    # Drop clubs table
    op.drop_table("clubs")
