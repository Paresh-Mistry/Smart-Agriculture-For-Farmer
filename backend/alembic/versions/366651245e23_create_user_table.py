"""create user table

Revision ID: 366651245e23
Revises: b8750520e238
Create Date: 2025-10-14 21:06:58.201291

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '366651245e23'
down_revision: Union[str, Sequence[str], None] = 'b8750520e238'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
