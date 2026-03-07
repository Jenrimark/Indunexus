"""
零部件相关 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.part import Part
from app.schemas.part import PartCreate, PartResponse, PartSearchRequest, PartSearchResponse
from app.schemas.response import Response

router = APIRouter()


@router.post("/search", response_model=Response[PartSearchResponse])
async def search_parts(search_request: PartSearchRequest, db: Session = Depends(get_db)):
    """搜索零部件"""
    query = db.query(Part)
    
    # 关键词搜索
    if search_request.keyword:
        keyword = f"%{search_request.keyword}%"
        query = query.filter(
            (Part.name.like(keyword)) |
            (Part.part_number.like(keyword)) |
            (Part.description.like(keyword))
        )
    
    # 类目筛选
    if search_request.category_id:
        query = query.filter(Part.category_id == search_request.category_id)
    
    # 排序
    if search_request.sort_by == "price":
        if search_request.sort_order == "asc":
            query = query.order_by(Part.price.asc())
        else:
            query = query.order_by(Part.price.desc())
    elif search_request.sort_by == "stock":
        query = query.order_by(Part.stock.desc())
    else:
        # 默认按创建时间排序
        query = query.order_by(Part.created_at.desc())
    
    # 总数
    total = query.count()
    
    # 分页
    offset = (search_request.page - 1) * search_request.page_size
    parts = query.offset(offset).limit(search_request.page_size).all()
    
    # 是否还有更多
    has_more = (offset + len(parts)) < total
    
    return Response(
        success=True,
        data=PartSearchResponse(
            parts=[PartResponse.from_orm(part) for part in parts],
            total=total,
            page=search_request.page,
            page_size=search_request.page_size,
            has_more=has_more
        )
    )


@router.get("/{part_id}", response_model=Response[PartResponse])
async def get_part(part_id: str, db: Session = Depends(get_db)):
    """获取零部件详情"""
    part = db.query(Part).filter(Part.id == part_id).first()
    
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="零部件不存在"
        )
    
    return Response(
        success=True,
        data=PartResponse.from_orm(part)
    )


@router.post("/", response_model=Response[PartResponse])
async def create_part(part_data: PartCreate, db: Session = Depends(get_db)):
    """创建零部件"""
    # 检查零件号是否存在
    existing_part = db.query(Part).filter(Part.part_number == part_data.part_number).first()
    if existing_part:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="零件号已存在"
        )
    
    # 创建新零部件
    new_part = Part(
        id=str(uuid.uuid4()),
        part_number=part_data.part_number,
        oem_code=part_data.oem_code,
        name=part_data.name,
        name_en=part_data.name_en,
        category_id=part_data.category_id,
        brand=part_data.brand,
        description=part_data.description,
        images=part_data.images,
        specifications=part_data.specifications,
        price=part_data.price,
        currency=part_data.currency,
        stock=part_data.stock,
        compatible_vehicles=[],
        alternatives=[],
    )
    
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    
    return Response(
        success=True,
        data=PartResponse.from_orm(new_part)
    )


@router.get("/{part_id}/recommended", response_model=Response[List[PartResponse]])
async def get_recommended_parts(part_id: str, db: Session = Depends(get_db)):
    """获取推荐零部件"""
    # 获取当前零部件
    part = db.query(Part).filter(Part.id == part_id).first()
    
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="零部件不存在"
        )
    
    # 获取同类目的其他零部件
    recommended = db.query(Part).filter(
        Part.category_id == part.category_id,
        Part.id != part_id
    ).limit(5).all()
    
    return Response(
        success=True,
        data=[PartResponse.from_orm(p) for p in recommended]
    )
