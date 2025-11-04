"""create crops_listings table

Revision ID: 003a980dc4eb
Revises: 0b0419a907e4
Create Date: 2025-10-14 20:19:37.104105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003a980dc4eb'
down_revision: Union[str, Sequence[str], None] = '0b0419a907e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
