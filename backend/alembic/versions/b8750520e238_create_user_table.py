"""create user table

Revision ID: b8750520e238
Revises: d574620ece3f
Create Date: 2025-10-14 21:02:58.372700

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8750520e238'
down_revision: Union[str, Sequence[str], None] = 'd574620ece3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
