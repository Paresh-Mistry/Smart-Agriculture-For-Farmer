"""
Enums for database models.
Separating enums makes them reusable across models and schemas.
"""
import enum


class UserRole(enum.Enum):
    buyer = "buyer"
    farmer = "farmer"


class CropStatus(enum.Enum):
    """Crop listing status enumeration."""
    AVAILABLE = "AVAILABLE"
    SOLD = "SOLD"
    PENDING = "PENDING"
    RESERVED = "RESERVED"


class CropCategory(enum.Enum):
    """Crop category enumeration."""
    GRAINS = "Grains"
    FRUITS = "Fruits"
    VEGETABLES = "Vegetables"
    LEGUMES = "Legumes"
    SPICES = "Spices"
    OILSEEDS = "Oilseeds"
    DAIRY = "Dairy"
    POULTRY = "Poultry"
    OTHER = "Other"
