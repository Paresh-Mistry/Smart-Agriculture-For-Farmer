"""create user table

Revision ID: b32f2ab871db
Revises: 0b253937ff5a
Create Date: 2025-10-14 21:19:39.930202

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b32f2ab871db'
down_revision: Union[str, Sequence[str], None] = '0b253937ff5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
