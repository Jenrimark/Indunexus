"""
创建 PostgreSQL 数据库和表结构
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models import Base

def create_database():
    """创建数据库"""
    # 连接到 PostgreSQL 服务器（不指定数据库）
    server_url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/postgres"
    engine = create_engine(server_url, isolation_level="AUTOCOMMIT")
    
    try:
        with engine.connect() as conn:
            # 检查数据库是否存在
            result = conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'")
            )
            exists = result.fetchone()
            
            if not exists:
                # 创建数据库
                conn.execute(text(f"CREATE DATABASE {settings.POSTGRES_DB}"))
                print(f"✅ 数据库 '{settings.POSTGRES_DB}' 创建成功")
            else:
                print(f"ℹ️  数据库 '{settings.POSTGRES_DB}' 已存在")
    except Exception as e:
        print(f"❌ 创建数据库失败: {e}")
        sys.exit(1)
    finally:
        engine.dispose()

def create_tables():
    """创建所有表"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 所有表创建成功")
        
        # 打印创建的表
        print("\n📋 已创建的表:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")
        
        engine.dispose()
    except Exception as e:
        print(f"❌ 创建表失败: {e}")
        sys.exit(1)

def main():
    print("🚀 开始初始化数据库...\n")
    
    print("📝 数据库配置:")
    print(f"  服务器: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
    print(f"  数据库: {settings.POSTGRES_DB}")
    print(f"  用户: {settings.POSTGRES_USER}\n")
    
    # 创建数据库
    create_database()
    
    # 创建表
    create_tables()
    
    print("\n✨ 数据库初始化完成!")
    print("\n💡 下一步:")
    print("  1. 运行 'python init_db.py' 初始化测试数据")
    print("  2. 运行 'python run.py' 启动服务器")

if __name__ == "__main__":
    main()
