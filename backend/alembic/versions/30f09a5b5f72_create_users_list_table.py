"""create users_list table

Revision ID: 30f09a5b5f72
Revises: 003a980dc4eb
Create Date: 2025-10-14 20:19:58.343654

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '30f09a5b5f72'
down_revision: Union[str, Sequence[str], None] = '003a980dc4eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
