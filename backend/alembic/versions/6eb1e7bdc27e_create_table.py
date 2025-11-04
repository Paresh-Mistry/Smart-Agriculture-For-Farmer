"""create table

Revision ID: 6eb1e7bdc27e
Revises: 7f7d43421c4d
Create Date: 2025-10-14 20:35:25.670748

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6eb1e7bdc27e'
down_revision: Union[str, Sequence[str], None] = '7f7d43421c4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
