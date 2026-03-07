"""
通用响应 Schema
"""
from pydantic import BaseModel
from typing import Optional, Any, Generic, TypeVar

T = TypeVar('T')


class Response(BaseModel, Generic[T]):
    """通用响应"""
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """错误响应"""
    success: bool = False
    error: dict
    
    @classmethod
    def create(cls, code: str, message: str):
        return cls(error={"code": code, "message": message})
