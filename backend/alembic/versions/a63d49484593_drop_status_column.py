"""Drop status column

Revision ID: a63d49484593
Revises: 7e63e04b9732
Create Date: 2025-10-16 06:53:58.773050

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a63d49484593'
down_revision: Union[str, Sequence[str], None] = '7e63e04b9732'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
