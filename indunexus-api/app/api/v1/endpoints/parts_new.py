"""
零部件相关的 API 端点 (SPU/SKU 架构)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.schemas.part_new import (
    PartSPUWithSKUs,
    PartSPUInDB,
    PartSKUInDB,
    PartSearchResult,
)
from app.models.part import PartSPU, PartSKU
from app.models.category import Category

router = APIRouter()


class PartSearchRequest(BaseModel):
    """搜索请求体"""
    keyword: Optional[str] = None
    type: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    filters: Optional[dict] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    page: int = 1
    page_size: int = 20


def _search_parts_logic(
    keyword: Optional[str],
    category_id: Optional[str],
    brand: Optional[str],
    min_price: Optional[float],
    max_price: Optional[float],
    in_stock: Optional[bool],
    sort_by: Optional[str],
    sort_order: Optional[str],
    page: int,
    page_size: int,
    db: Session
) -> PartSearchResult:
    """搜索零部件的核心逻辑"""
    # 构建查询
    query = db.query(PartSPU).options(joinedload(PartSPU.skus))
    
    # 关键词搜索
    if keyword:
        query = query.filter(
            or_(
                PartSPU.part_number.ilike(f"%{keyword}%"),
                PartSPU.name.ilike(f"%{keyword}%"),
                PartSPU.oem_code.ilike(f"%{keyword}%")
            )
        )
    
    # 类目筛选
    if category_id:
        query = query.filter(PartSPU.category_id == category_id)
    
    # 品牌筛选
    if brand:
        query = query.filter(PartSPU.brand == brand)
    
    # 价格筛选（需要 join SKU）
    if min_price is not None or max_price is not None:
        query = query.join(PartSKU)
        if min_price is not None:
            query = query.filter(PartSKU.price >= min_price)
        if max_price is not None:
            query = query.filter(PartSKU.price <= max_price)
    
    # 库存筛选
    if in_stock:
        query = query.join(PartSKU).filter(PartSKU.stock > 0)
    
    # 去重（因为可能 join 了 SKU）
    query = query.distinct()
    
    # 排序 - 简化版本，先按 SPU 字段排序
    if sort_by:
        order = sort_order or 'desc'
        if sort_by == 'name':
            if order == 'asc':
                query = query.order_by(PartSPU.name.asc())
            else:
                query = query.order_by(PartSPU.name.desc())
        elif sort_by == 'created_at':
            if order == 'asc':
                query = query.order_by(PartSPU.created_at.asc())
            else:
                query = query.order_by(PartSPU.created_at.desc())
        elif sort_by == 'brand':
            if order == 'asc':
                query = query.order_by(PartSPU.brand.asc())
            else:
                query = query.order_by(PartSPU.brand.desc())
        # 价格和库存排序暂时使用创建时间
        else:
            query = query.order_by(PartSPU.created_at.desc())
    else:
        # 默认按创建时间倒序
        query = query.order_by(PartSPU.created_at.desc())
    
    # 总数
    total = query.count()
    
    # 分页
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    # 如果是按价格或库存排序，在 Python 层面排序
    if sort_by in ['price', 'stock']:
        order = sort_order or 'desc'
        reverse = (order == 'desc')
        
        if sort_by == 'price':
            # 按最低价格排序
            items = sorted(items, key=lambda x: min([sku.price for sku in x.skus]) if x.skus else float('inf'), reverse=reverse)
        elif sort_by == 'stock':
            # 按总库存排序
            items = sorted(items, key=lambda x: sum([sku.stock for sku in x.skus]) if x.skus else 0, reverse=reverse)
    
    # 转换为响应格式
    result_items = []
    for spu in items:
        spu_dict = {
            "id": str(spu.id),
            "part_number": spu.part_number,
            "oem_code": spu.oem_code,
            "name": spu.name,
            "name_en": spu.name_en,
            "category_id": str(spu.category_id),
            "brand": spu.brand,
            "description": spu.description,
            "created_at": spu.created_at,
            "updated_at": spu.updated_at,
            "skus": [
                {
                    "id": str(sku.id),
                    "spu_id": str(sku.spu_id),
                    "sku_code": sku.sku_code,
                    "specifications": sku.specifications,
                    "price": float(sku.price),
                    "currency": sku.currency,
                    "stock": sku.stock,
                    "images": sku.images,
                    "model_3d_url": sku.model_3d_url,
                    "technical_drawing_url": sku.technical_drawing_url,
                    "created_at": sku.created_at,
                    "updated_at": sku.updated_at,
                }
                for sku in spu.skus
            ]
        }
        result_items.append(PartSPUWithSKUs(**spu_dict))
    
    return PartSearchResult(
        total=total,
        page=page,
        page_size=page_size,
        has_more=total > offset + page_size,
        items=result_items
    )


@router.post("/search", response_model=PartSearchResult)
def search_parts_post(
    search_request: PartSearchRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    搜索零部件 (POST 方法)
    
    支持复杂查询参数，通过请求体传递
    """
    # 从 filters 中提取价格和库存筛选
    min_price = None
    max_price = None
    in_stock = None
    
    if search_request.filters:
        min_price = search_request.filters.get("min_price")
        max_price = search_request.filters.get("max_price")
        in_stock = search_request.filters.get("in_stock")
    
    return _search_parts_logic(
        keyword=search_request.keyword,
        category_id=search_request.category_id,
        brand=search_request.brand,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        sort_by=search_request.sort_by,
        sort_order=search_request.sort_order,
        page=search_request.page,
        page_size=search_request.page_size,
        db=db
    )


class PartSearchRequest(BaseModel):
    """搜索请求体"""
    keyword: Optional[str] = None
    type: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    filters: Optional[dict] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    page: int = 1
    page_size: int = 20


@router.get("/search", response_model=PartSearchResult)
def search_parts_get(
    keyword: Optional[str] = None,
    category_id: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    搜索零部件 (GET 方法)
    
    - keyword: 搜索关键词（匹配型号、名称）
    - category_id: 类目 ID
    - brand: 品牌
    - min_price: 最低价格
    - max_price: 最高价格
    - in_stock: 是否有库存
    - sort_by: 排序字段 (price, stock, name, created_at)
    - sort_order: 排序顺序 (asc, desc)
    - page: 页码
    - page_size: 每页数量
    """
    return _search_parts_logic(
        keyword=keyword,
        category_id=category_id,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
        db=db
    )


@router.get("/spu/{spu_id}", response_model=PartSPUWithSKUs)
def get_spu(spu_id: str, db: Session = Depends(get_db)):
    """获取 SPU 详情（包含所有 SKU）"""
    spu = db.query(PartSPU).options(joinedload(PartSPU.skus)).filter(PartSPU.id == spu_id).first()
    
    if not spu:
        raise HTTPException(status_code=404, detail="零部件不存在")
    
    # 转换为响应格式
    spu_dict = {
        "id": str(spu.id),
        "part_number": spu.part_number,
        "oem_code": spu.oem_code,
        "name": spu.name,
        "name_en": spu.name_en,
        "category_id": str(spu.category_id),
        "brand": spu.brand,
        "description": spu.description,
        "created_at": spu.created_at,
        "updated_at": spu.updated_at,
        "skus": [
            {
                "id": str(sku.id),
                "spu_id": str(sku.spu_id),
                "sku_code": sku.sku_code,
                "specifications": sku.specifications,
                "price": float(sku.price),
                "currency": sku.currency,
                "stock": sku.stock,
                "images": sku.images,
                "model_3d_url": sku.model_3d_url,
                "technical_drawing_url": sku.technical_drawing_url,
                "created_at": sku.created_at,
                "updated_at": sku.updated_at,
            }
            for sku in spu.skus
        ]
    }
    
    return PartSPUWithSKUs(**spu_dict)


@router.get("/sku/{sku_id}", response_model=PartSKUInDB)
def get_sku(sku_id: str, db: Session = Depends(get_db)):
    """获取 SKU 详情"""
    sku = db.query(PartSKU).filter(PartSKU.id == sku_id).first()
    
    if not sku:
        raise HTTPException(status_code=404, detail="SKU 不存在")
    
    return PartSKUInDB(
        id=str(sku.id),
        spu_id=str(sku.spu_id),
        sku_code=sku.sku_code,
        specifications=sku.specifications,
        price=float(sku.price),
        currency=sku.currency,
        stock=sku.stock,
        images=sku.images,
        model_3d_url=sku.model_3d_url,
        technical_drawing_url=sku.technical_drawing_url,
        created_at=sku.created_at,
        updated_at=sku.updated_at,
    )


@router.get("/recommended", response_model=PartSearchResult)
def get_recommended_parts(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """获取推荐零部件（最新的）"""
    query = db.query(PartSPU).options(joinedload(PartSPU.skus)).order_by(PartSPU.created_at.desc())
    
    total = query.count()
    items = query.limit(limit).all()
    
    # 转换为响应格式
    result_items = []
    for spu in items:
        spu_dict = {
            "id": str(spu.id),
            "part_number": spu.part_number,
            "oem_code": spu.oem_code,
            "name": spu.name,
            "name_en": spu.name_en,
            "category_id": str(spu.category_id),
            "brand": spu.brand,
            "description": spu.description,
            "created_at": spu.created_at,
            "updated_at": spu.updated_at,
            "skus": [
                {
                    "id": str(sku.id),
                    "spu_id": str(sku.spu_id),
                    "sku_code": sku.sku_code,
                    "specifications": sku.specifications,
                    "price": float(sku.price),
                    "currency": sku.currency,
                    "stock": sku.stock,
                    "images": sku.images,
                    "model_3d_url": sku.model_3d_url,
                    "technical_drawing_url": sku.technical_drawing_url,
                    "created_at": sku.created_at,
                    "updated_at": sku.updated_at,
                }
                for sku in spu.skus
            ]
        }
        result_items.append(PartSPUWithSKUs(**spu_dict))
    
    return PartSearchResult(
        total=total,
        page=1,
        page_size=limit,
        has_more=False,
        items=result_items
    )


# ==================== 管理功能（仅管理员） ====================

from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.schemas.part_new import PartSPUCreate, PartSPUUpdate, PartSKUCreate, PartSKUUpdate
import uuid


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """要求管理员权限"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="只有管理员可以访问此功能"
        )
    return current_user


@router.post("/spu", response_model=PartSPUWithSKUs, status_code=201)
def create_spu(
    spu_data: PartSPUCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """创建 SPU（仅管理员）"""
    # 检查类目是否存在
    category = db.query(Category).filter(Category.id == spu_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="类目不存在")
    
    # 检查型号是否已存在
    existing = db.query(PartSPU).filter(PartSPU.part_number == spu_data.part_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="零部件型号已存在")
    
    # 创建 SPU
    new_spu = PartSPU(
        id=str(uuid.uuid4()),
        part_number=spu_data.part_number,
        oem_code=spu_data.oem_code,
        name=spu_data.name,
        name_en=spu_data.name_en,
        category_id=spu_data.category_id,
        brand=spu_data.brand,
        description=spu_data.description
    )
    
    db.add(new_spu)
    db.commit()
    db.refresh(new_spu)
    
    # 更新类目零部件数量
    category.parts_count += 1
    db.commit()
    
    return PartSPUWithSKUs(
        id=str(new_spu.id),
        part_number=new_spu.part_number,
        oem_code=new_spu.oem_code,
        name=new_spu.name,
        name_en=new_spu.name_en,
        category_id=str(new_spu.category_id),
        brand=new_spu.brand,
        description=new_spu.description,
        created_at=new_spu.created_at,
        updated_at=new_spu.updated_at,
        skus=[]
    )


@router.put("/spu/{spu_id}", response_model=PartSPUWithSKUs)
def update_spu(
    spu_id: str,
    spu_data: PartSPUUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """更新 SPU（仅管理员）"""
    spu = db.query(PartSPU).filter(PartSPU.id == spu_id).first()
    if not spu:
        raise HTTPException(status_code=404, detail="零部件不存在")
    
    # 更新字段
    if spu_data.name is not None:
        spu.name = spu_data.name
    if spu_data.name_en is not None:
        spu.name_en = spu_data.name_en
    if spu_data.oem_code is not None:
        spu.oem_code = spu_data.oem_code
    if spu_data.brand is not None:
        spu.brand = spu_data.brand
    if spu_data.description is not None:
        spu.description = spu_data.description
    if spu_data.category_id is not None:
        # 检查新类目是否存在
        category = db.query(Category).filter(Category.id == spu_data.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="类目不存在")
        
        # 更新类目零部件数量
        old_category = db.query(Category).filter(Category.id == spu.category_id).first()
        if old_category:
            old_category.parts_count -= 1
        category.parts_count += 1
        
        spu.category_id = spu_data.category_id
    
    db.commit()
    db.refresh(spu)
    
    # 加载 SKUs
    spu = db.query(PartSPU).options(joinedload(PartSPU.skus)).filter(PartSPU.id == spu_id).first()
    
    return PartSPUWithSKUs(
        id=str(spu.id),
        part_number=spu.part_number,
        oem_code=spu.oem_code,
        name=spu.name,
        name_en=spu.name_en,
        category_id=str(spu.category_id),
        brand=spu.brand,
        description=spu.description,
        created_at=spu.created_at,
        updated_at=spu.updated_at,
        skus=[
            PartSKUInDB(
                id=str(sku.id),
                spu_id=str(sku.spu_id),
                sku_code=sku.sku_code,
                specifications=sku.specifications,
                price=float(sku.price),
                currency=sku.currency,
                stock=sku.stock,
                images=sku.images,
                model_3d_url=sku.model_3d_url,
                technical_drawing_url=sku.technical_drawing_url,
                created_at=sku.created_at,
                updated_at=sku.updated_at
            )
            for sku in spu.skus
        ]
    )


@router.delete("/spu/{spu_id}", status_code=204)
def delete_spu(
    spu_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """删除 SPU（仅管理员）"""
    spu = db.query(PartSPU).filter(PartSPU.id == spu_id).first()
    if not spu:
        raise HTTPException(status_code=404, detail="零部件不存在")
    
    # 更新类目零部件数量
    category = db.query(Category).filter(Category.id == spu.category_id).first()
    if category:
        category.parts_count -= 1
    
    # 删除 SPU（会级联删除 SKU）
    db.delete(spu)
    db.commit()
    
    return None


@router.post("/sku", response_model=PartSKUInDB, status_code=201)
def create_sku(
    sku_data: PartSKUCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """创建 SKU（仅管理员）"""
    # 检查 SPU 是否存在
    spu = db.query(PartSPU).filter(PartSPU.id == sku_data.spu_id).first()
    if not spu:
        raise HTTPException(status_code=404, detail="SPU 不存在")
    
    # 检查 SKU 编码是否已存在
    existing = db.query(PartSKU).filter(PartSKU.sku_code == sku_data.sku_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU 编码已存在")
    
    # 创建 SKU
    new_sku = PartSKU(
        id=str(uuid.uuid4()),
        spu_id=sku_data.spu_id,
        sku_code=sku_data.sku_code,
        specifications=sku_data.specifications,
        price=sku_data.price,
        currency=sku_data.currency or "CNY",
        stock=sku_data.stock,
        images=sku_data.images or [],
        model_3d_url=sku_data.model_3d_url,
        technical_drawing_url=sku_data.technical_drawing_url
    )
    
    db.add(new_sku)
    db.commit()
    db.refresh(new_sku)
    
    return PartSKUInDB(
        id=str(new_sku.id),
        spu_id=str(new_sku.spu_id),
        sku_code=new_sku.sku_code,
        specifications=new_sku.specifications,
        price=float(new_sku.price),
        currency=new_sku.currency,
        stock=new_sku.stock,
        images=new_sku.images,
        model_3d_url=new_sku.model_3d_url,
        technical_drawing_url=new_sku.technical_drawing_url,
        created_at=new_sku.created_at,
        updated_at=new_sku.updated_at
    )


@router.put("/sku/{sku_id}", response_model=PartSKUInDB)
def update_sku(
    sku_id: str,
    sku_data: PartSKUUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """更新 SKU（仅管理员）"""
    sku = db.query(PartSKU).filter(PartSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU 不存在")
    
    # 更新字段
    if sku_data.specifications is not None:
        sku.specifications = sku_data.specifications
    if sku_data.price is not None:
        sku.price = sku_data.price
    if sku_data.currency is not None:
        sku.currency = sku_data.currency
    if sku_data.stock is not None:
        sku.stock = sku_data.stock
    if sku_data.images is not None:
        sku.images = sku_data.images
    if sku_data.model_3d_url is not None:
        sku.model_3d_url = sku_data.model_3d_url
    if sku_data.technical_drawing_url is not None:
        sku.technical_drawing_url = sku_data.technical_drawing_url
    
    db.commit()
    db.refresh(sku)
    
    return PartSKUInDB(
        id=str(sku.id),
        spu_id=str(sku.spu_id),
        sku_code=sku.sku_code,
        specifications=sku.specifications,
        price=float(sku.price),
        currency=sku.currency,
        stock=sku.stock,
        images=sku.images,
        model_3d_url=sku.model_3d_url,
        technical_drawing_url=sku.technical_drawing_url,
        created_at=sku.created_at,
        updated_at=sku.updated_at
    )


@router.delete("/sku/{sku_id}", status_code=204)
def delete_sku(
    sku_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """删除 SKU（仅管理员）"""
    sku = db.query(PartSKU).filter(PartSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU 不存在")
    
    db.delete(sku)
    db.commit()
    
    return None


@router.get("/stats/summary")
def get_parts_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """获取零部件统计数据（仅管理员）"""
    total_spus = db.query(PartSPU).count()
    total_skus = db.query(PartSKU).count()
    total_stock = db.query(PartSKU).with_entities(db.func.sum(PartSKU.stock)).scalar() or 0
    low_stock_count = db.query(PartSKU).filter(PartSKU.stock < 10).count()
    
    return {
        "total_spus": total_spus,
        "total_skus": total_skus,
        "total_stock": int(total_stock),
        "low_stock_count": low_stock_count
    }
