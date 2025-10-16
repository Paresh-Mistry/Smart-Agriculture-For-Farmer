"""create users_list table

Revision ID: 23e00ab81349
Revises: de1eecf937e5
Create Date: 2025-10-14 20:28:16.655985

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '23e00ab81349'
down_revision: Union[str, Sequence[str], None] = 'de1eecf937e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
