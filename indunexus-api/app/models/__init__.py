"""
Database models
"""
from app.core.database import Base
from app.models.user import User
from app.models.category import Category
from app.models.part import PartSPU, PartSKU
from app.models.ai_recognition import AIRecognition
from app.models.user_favorite import UserFavorite
from app.models.user_preset import UserPreset
from app.models.shopping_cart import ShoppingCart
from app.models.order import Order, OrderItem

__all__ = [
    "Base",
    "User",
    "Category",
    "PartSPU",
    "PartSKU",
    "AIRecognition",
    "UserFavorite",
    "UserPreset",
    "ShoppingCart",
    "Order",
    "OrderItem",
]
