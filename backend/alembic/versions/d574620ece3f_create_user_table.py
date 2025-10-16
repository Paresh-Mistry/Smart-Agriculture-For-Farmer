"""create user table

Revision ID: d574620ece3f
Revises: 020d93d380c6
Create Date: 2025-10-14 21:00:16.460259

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd574620ece3f'
down_revision: Union[str, Sequence[str], None] = '020d93d380c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
