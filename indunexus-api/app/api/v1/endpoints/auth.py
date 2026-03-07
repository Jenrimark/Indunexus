"""
认证相关 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserProfileUpdate
from app.schemas.response import Response, ErrorResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/register", response_model=Response[dict])
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否存在
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    # 创建新用户
    new_user = User(
        id=str(uuid.uuid4()),
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role="buyer",
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.username}",
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 生成 token
    access_token = create_access_token(
        data={"sub": new_user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Response(
        success=True,
        data={
            "token": access_token,
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "role": new_user.role,
                "avatar": new_user.avatar,
            }
        }
    )


@router.post("/login", response_model=Response[dict])
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    # 查找用户
    user = db.query(User).filter(User.username == user_data.username).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    
    # 生成 token
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Response(
        success=True,
        data={
            "token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "avatar": user.avatar,
            }
        }
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """用户登出"""
    return Response(
        success=True,
        message="登出成功"
    )


@router.get("/me", response_model=Response[UserResponse])
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return Response(
        success=True,
        data=UserResponse.from_orm(current_user)
    )


@router.put("/profile", response_model=Response[UserResponse])
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户个人信息"""
    # 如果更新用户名，检查是否已存在
    if profile_data.username and profile_data.username != current_user.username:
        existing_user = db.query(User).filter(User.username == profile_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        current_user.username = profile_data.username
    
    # 如果更新邮箱，检查是否已存在
    if profile_data.email and profile_data.email != current_user.email:
        existing_email = db.query(User).filter(User.email == profile_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
        current_user.email = profile_data.email
    
    # 更新其他字段
    if profile_data.avatar is not None:
        current_user.avatar = profile_data.avatar
    
    if profile_data.company_name is not None:
        current_user.company_name = profile_data.company_name
    
    if profile_data.company_description is not None:
        current_user.company_description = profile_data.company_description
    
    db.commit()
    db.refresh(current_user)
    
    return Response(
        success=True,
        message="个人信息更新成功",
        data=UserResponse.from_orm(current_user)
    )
