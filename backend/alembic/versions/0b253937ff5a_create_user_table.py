"""create user table

Revision ID: 0b253937ff5a
Revises: 366651245e23
Create Date: 2025-10-14 21:11:37.755214

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b253937ff5a'
down_revision: Union[str, Sequence[str], None] = '366651245e23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
