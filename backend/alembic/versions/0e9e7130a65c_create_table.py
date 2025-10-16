"""create table

Revision ID: 0e9e7130a65c
Revises: 6eb1e7bdc27e
Create Date: 2025-10-14 20:47:58.129466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e9e7130a65c'
down_revision: Union[str, Sequence[str], None] = '6eb1e7bdc27e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
