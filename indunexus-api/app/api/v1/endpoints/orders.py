from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.order import Order, OrderItem
from app.schemas.order import Order as OrderSchema, OrderCreate, OrderUpdate

router = APIRouter()


def generate_order_number() -> str:
    """生成订单号"""
    import time
    return f"ORD{int(time.time() * 1000)}"


def calculate_shipping_fee(subtotal: float) -> float:
    """计算运费（满500免运费）"""
    return 0.0 if subtotal >= 500 else 20.0


@router.post("/", response_model=OrderSchema, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建订单"""
    # 计算订单金额
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    shipping_fee = calculate_shipping_fee(subtotal)
    discount = 0.0
    total_amount = subtotal + shipping_fee - discount
    
    # 创建订单
    db_order = Order(
        order_number=generate_order_number(),
        user_id=str(current_user.id),
        status="pending",
        receiver_name=order_data.receiver_name,
        receiver_phone=order_data.receiver_phone,
        shipping_address=order_data.shipping_address,
        need_invoice=1 if order_data.need_invoice else 0,
        invoice_title=order_data.invoice_title,
        tax_number=order_data.tax_number,
        remark=order_data.remark,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount=discount,
        total_amount=total_amount,
    )
    
    db.add(db_order)
    db.flush()  # 获取订单 ID
    
    # 创建订单项
    for item in order_data.items:
        db_item = OrderItem(
            order_id=db_order.id,
            part_id=item.part_id,
            part_name=item.part_name,
            part_number=item.part_number,
            manufacturer=item.manufacturer,
            image_url=item.image_url,
            quantity=item.quantity,
            price=item.price,
            subtotal=item.price * item.quantity,
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    
    # 手动转换 user_id 为字符串
    db_order.user_id = str(db_order.user_id)
    
    return db_order


@router.get("/", response_model=List[OrderSchema])
def get_orders(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的订单列表"""
    query = db.query(Order).filter(Order.user_id == str(current_user.id))
    
    if status and status != "all":
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # 转换 user_id 为字符串
    for order in orders:
        order.user_id = str(order.user_id)
    
    return orders


@router.get("/{order_id}", response_model=OrderSchema)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取订单详情"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == str(current_user.id)
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
    
    # 转换 user_id 为字符串
    order.user_id = str(order.user_id)
    
    return order


@router.patch("/{order_id}", response_model=OrderSchema)
def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新订单状态"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == str(current_user.id)
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
    
    # 更新字段
    if order_update.status is not None:
        order.status = order_update.status
        
        # 自动更新时间戳
        now = datetime.utcnow()
        if order_update.status == "paid" and not order.paid_at:
            order.paid_at = now
        elif order_update.status == "shipped" and not order.shipped_at:
            order.shipped_at = now
        elif order_update.status == "completed" and not order.completed_at:
            order.completed_at = now
    
    if order_update.tracking_number is not None:
        order.tracking_number = order_update.tracking_number
    
    if order_update.paid_at is not None:
        order.paid_at = order_update.paid_at
    
    if order_update.shipped_at is not None:
        order.shipped_at = order_update.shipped_at
    
    if order_update.completed_at is not None:
        order.completed_at = order_update.completed_at
    
    db.commit()
    db.refresh(order)
    
    # 转换 user_id 为字符串
    order.user_id = str(order.user_id)
    
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除订单"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == str(current_user.id)
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
    
    # 只允许删除已完成或已取消的订单
    if order.status not in ["pending", "completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能删除待付款、已完成或已取消的订单"
        )
    
    db.delete(order)
    db.commit()
    
    return None
