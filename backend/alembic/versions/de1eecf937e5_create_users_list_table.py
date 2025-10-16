"""create users_list table

Revision ID: de1eecf937e5
Revises: 30f09a5b5f72
Create Date: 2025-10-14 20:23:02.949304

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de1eecf937e5'
down_revision: Union[str, Sequence[str], None] = '30f09a5b5f72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
