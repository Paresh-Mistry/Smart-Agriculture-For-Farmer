"""create crops_listings table

Revision ID: 0b0419a907e4
Revises: 1b9baf14a188
Create Date: 2025-10-14 20:19:05.026021

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b0419a907e4'
down_revision: Union[str, Sequence[str], None] = '1b9baf14a188'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
