"""
数据库初始化脚本
"""
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models import Base, User, Part
from app.core.security import get_password_hash
import uuid


def init_db():
    """初始化数据库"""
    print("创建数据库表...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        existing_user = db.query(User).first()
        if existing_user:
            print("数据库已初始化，跳过...")
            return
        
        print("创建初始用户...")
        # 创建管理员用户
        admin_user = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@indunexus.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            is_active=True,
        )
        db.add(admin_user)
        
        # 创建测试用户
        test_user = User(
            id=str(uuid.uuid4()),
            username="test",
            email="test@indunexus.com",
            hashed_password=get_password_hash("test123"),
            role="buyer",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=test",
            is_active=True,
        )
        db.add(test_user)
        
        print("创建初始零部件数据...")
        # 创建 50 个测试零部件
        for i in range(50):
            part = Part(
                id=str(uuid.uuid4()),
                part_number=f"{6200 + i}",
                oem_code=f"OEM-{i + 1:03d}",
                name=f"深沟球轴承 {6200 + i}",
                name_en=f"Deep Groove Ball Bearing {6200 + i}",
                category_id="bearing",
                brand=["SKF", "NSK", "FAG", "NTN"][i % 4],
                description="高精度深沟球轴承，适用于高速旋转场景",
                images={
                    "thumbnail": f"https://picsum.photos/seed/{i}/300/300",
                    "fullSize": [f"https://picsum.photos/seed/{i}/800/800"],
                    "blurhash": "LKO2?U%2Tw=w]~RBVZRi};RPxuwH"
                },
                specifications={
                    "material": "轴承钢",
                    "dimensions": {
                        "innerDiameter": 25 + i,
                        "outerDiameter": 52 + i * 2,
                        "width": 15 + i,
                        "unit": "mm"
                    },
                    "weight": {
                        "value": round(0.15 + i * 0.01, 2),
                        "unit": "kg"
                    },
                    "tolerance": "P5",
                    "sealType": "密封圈" if i % 2 == 0 else "防尘盖"
                },
                price=100.0 + i * 10,
                currency="CNY",
                stock=50 + i * 2,
                model_3d="/models/bearing.glb" if i % 3 == 0 else None,
                technical_drawing="/drawings/bearing.pdf",
                compatible_vehicles=["东风天龙", "解放J6", "重汽豪沃"],
                alternatives=[],
            )
            db.add(part)
        
        db.commit()
        print("✅ 数据库初始化完成！")
        print("\n默认账号:")
        print("  管理员: admin / admin123")
        print("  测试用户: test / test123")
        
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
