"""create user table

Revision ID: 020d93d380c6
Revises: 0e9e7130a65c
Create Date: 2025-10-14 20:51:12.607533

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '020d93d380c6'
down_revision: Union[str, Sequence[str], None] = '0e9e7130a65c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
