"""add_description_and_requirements_to_loyalties

Revision ID: add_desc_req_loy
Revises: c4b1724585b3
Create Date: 2024-05-29 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "add_desc_req_loy"
down_revision: Union[str, None] = "c4b1724585b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to loyalties table
    op.add_column("loyalties", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("loyalties", sa.Column("requirements", sa.JSON(), nullable=True))

    # Define the loyalties table for updates
    loyalties_table = sa.table(
        "loyalties",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.Text),
        sa.column("requirements", sa.JSON),
    )

    # Update name for id 1
    op.execute(
        loyalties_table.update().where(loyalties_table.c.id == 1).values(name="Нет")
    )

    # Update descriptions and requirements for each loyalty level
    op.execute(
        loyalties_table.update()
        .where(loyalties_table.c.id == 2)
        .values(
            description="GoPadel Active — участвует от 5 и более турниров подряд — проявляет активность внутри комьюнити. Активисты получат с этой недели 5% скидки на продукты и в будущим от нас мерч.",
            requirements={"tournaments_count": 5, "consecutive": True},
        )
    )

    op.execute(
        loyalties_table.update()
        .where(loyalties_table.c.id == 3)
        .values(
            description="GoPadel Friend — Активно участвует в жизни комьюнити, помогает рекомендациями, приводит друзей и т.д. — Суммарно участвовал в 10 и более турнирах или участвует в нескольких видах продуктов (турниры + лига или обучение + лига и т.д.) — Или внес значимый вклад в развитие (привел партнера, спонсора, предложил новые форматы и т.д.). Друзья получат с этой недели 10% скидки на продукты и в будущим от нас мерч + разные плюшки.",
            requirements={"tournaments_count": 10, "multiple_products": True},
        )
    )

    op.execute(
        loyalties_table.update()
        .where(loyalties_table.c.id == 4)
        .values(
            description="GoPadel Aksakal — Активно участвует с нами более 6 месяцев — Посетил суммарно больше 20 турниров — Помогает комьюнити, приглашает друзей и и т.д. Аксакалы получат с этой недели 20% скидки на продукты и в будущим от нас мерч + разные плюшки.",
            requirements={"months": 6, "tournaments_count": 20},
        )
    )

    op.execute(
        loyalties_table.update()
        .where(loyalties_table.c.id == 5)
        .values(
            description="Ambassador — Те, кто активно про нас рассказывают во вне — Привлекают больше всех участников — Помогают поддержать и развить имя и имидж комьюнити. Амбассадоры получат с этой недели 20% скидки на продукты и в будущим от нас мерч + разные плюшки.",
            requirements={"ambassador": True},
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Revert name change
    loyalties_table = sa.table(
        "loyalties",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
    )
    op.execute(
        loyalties_table.update().where(loyalties_table.c.id == 1).values(name="Нету")
    )

    # Remove the columns
    op.drop_column("loyalties", "requirements")
    op.drop_column("loyalties", "description")
