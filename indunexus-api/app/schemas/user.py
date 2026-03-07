"""
用户相关 Schema
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """用户基础信息"""
    username: str
    email: EmailStr


class UserCreate(UserBase):
    """创建用户"""
    password: str
    role: Optional[str] = "buyer"
    company_name: Optional[str] = None
    company_description: Optional[str] = None


class UserLogin(BaseModel):
    """用户登录"""
    username: str
    password: str


class UserResponse(UserBase):
    """用户响应"""
    id: UUID
    role: str
    avatar: Optional[str] = None
    is_active: bool
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """令牌"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """令牌数据"""
    username: Optional[str] = None


class UserUpdate(BaseModel):
    """更新用户"""
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    is_active: Optional[bool] = None
    company_name: Optional[str] = None
    company_description: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """更新用户个人信息"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    company_name: Optional[str] = None
    company_description: Optional[str] = None


class UserInDB(UserBase):
    """数据库中的用户"""
    id: UUID
    role: str
    hashed_password: str
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
