"""
类目相关的 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.schemas.category import CategoryTree, CategoryInDB, CategoryCreate, CategoryUpdate
from app.models.category import Category
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()


def build_category_tree(categories: List[Category], parent_id=None) -> List[CategoryTree]:
    """构建类目树"""
    tree = []
    for cat in categories:
        if cat.parent_id == parent_id:
            cat_dict = {
                "id": str(cat.id),
                "name": cat.name,
                "name_en": cat.name_en,
                "parent_id": str(cat.parent_id) if cat.parent_id else None,
                "level": cat.level,
                "path": cat.path,
                "icon": cat.icon,
                "parts_count": cat.parts_count,
                "sort_order": cat.sort_order,
                "created_at": cat.created_at,
                "children": build_category_tree(categories, cat.id)
            }
            tree.append(CategoryTree(**cat_dict))
    return sorted(tree, key=lambda x: x.sort_order)


@router.get("/tree", response_model=List[CategoryTree])
def get_category_tree(db: Session = Depends(get_db)):
    """获取类目树"""
    categories = db.query(Category).all()
    return build_category_tree(categories)


@router.get("/", response_model=List[CategoryTree])
def get_categories(db: Session = Depends(get_db)):
    """获取类目树（别名）"""
    categories = db.query(Category).all()
    return build_category_tree(categories)


@router.get("/{category_id}", response_model=CategoryInDB)
def get_category(category_id: str, db: Session = Depends(get_db)):
    """获取单个类目"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="类目不存在")
    return category


@router.post("/", response_model=CategoryInDB, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建类目（仅管理员）"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以创建类目"
        )
    
    # 检查父类目是否存在
    if category_data.parent_id:
        parent = db.query(Category).filter(Category.id == category_data.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="父类目不存在")
        level = parent.level + 1
        path = f"{parent.path}/{category_data.parent_id}"
    else:
        level = 1
        path = ""
    
    # 创建类目
    new_category = Category(
        id=str(uuid.uuid4()),
        name=category_data.name,
        name_en=category_data.name_en,
        parent_id=category_data.parent_id,
        level=level,
        path=path,
        icon=category_data.icon,
        sort_order=category_data.sort_order or 0,
        parts_count=0
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category


@router.put("/{category_id}", response_model=CategoryInDB)
def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新类目（仅管理员）"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以更新类目"
        )
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="类目不存在")
    
    # 更新字段
    if category_data.name is not None:
        category.name = category_data.name
    if category_data.name_en is not None:
        category.name_en = category_data.name_en
    if category_data.icon is not None:
        category.icon = category_data.icon
    if category_data.sort_order is not None:
        category.sort_order = category_data.sort_order
    
    db.commit()
    db.refresh(category)
    
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除类目（仅管理员）"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以删除类目"
        )
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="类目不存在")
    
    # 检查是否有子类目
    children = db.query(Category).filter(Category.parent_id == category_id).count()
    if children > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该类目下有子类目，无法删除"
        )
    
    # 检查是否有零部件
    if category.parts_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该类目下有零部件，无法删除"
        )
    
    db.delete(category)
    db.commit()
    
    return None
