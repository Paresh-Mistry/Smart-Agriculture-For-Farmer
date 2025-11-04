"""create table

Revision ID: 7f7d43421c4d
Revises: 23e00ab81349
Create Date: 2025-10-14 20:32:27.893783

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f7d43421c4d'
down_revision: Union[str, Sequence[str], None] = '23e00ab81349'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
