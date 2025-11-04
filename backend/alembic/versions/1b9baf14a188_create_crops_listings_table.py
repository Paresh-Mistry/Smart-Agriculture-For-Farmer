"""create crops_listings table

Revision ID: 1b9baf14a188
Revises: ebfd88342637
Create Date: 2025-10-14 20:18:42.480111

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b9baf14a188'
down_revision: Union[str, Sequence[str], None] = 'ebfd88342637'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
