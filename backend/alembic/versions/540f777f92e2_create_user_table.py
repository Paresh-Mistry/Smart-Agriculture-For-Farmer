"""create user table

Revision ID: 540f777f92e2
Revises: b32f2ab871db
Create Date: 2025-10-14 21:21:26.138213

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '540f777f92e2'
down_revision: Union[str, Sequence[str], None] = 'b32f2ab871db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
