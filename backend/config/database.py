from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/odoo"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    """
    Lightweight runtime migration guard.

    Adds missing columns that newer models expect but older DBs may not have.
    Safe to run on startup; it only issues ALTERs when columns are absent.
    """
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # Attendance table: add worked_hours (Float) and approved_by (String) if missing
        if "attendances" in tables:
            columns = {col["name"] for col in inspector.get_columns("attendances")}

            if "worked_hours" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE attendances ADD COLUMN worked_hours FLOAT DEFAULT 0.0"))

            if "approved_by" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE attendances ADD COLUMN approved_by VARCHAR(30) NULL"))

        # User table: add missing columns used by the ORM model
        if "user" in tables:
            ucols = {col["name"] for col in inspector.get_columns("user")}

            def add_col(sql):
                with engine.begin() as conn:
                    conn.execute(text(sql))

            if "company_email" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN company_email VARCHAR(255) NULL")
            if "password_hash" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''")
            if "department" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN department VARCHAR(100) NULL")
            if "position" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN position VARCHAR(100) NULL")
            if "date_of_joining" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN date_of_joining DATETIME NULL")
            if "status" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Active'")
            if "is_first_login" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN is_first_login BOOLEAN NOT NULL DEFAULT 1")
            if "bank_account" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN bank_account VARCHAR(50) NULL")
            if "manager_id" not in ucols:
                add_col("ALTER TABLE `user` ADD COLUMN manager_id VARCHAR(30) NULL")
    except Exception as e:
        # Don't block app startup if migration check fails; just log to console
        print("[ensure_schema] Skipped with error:", e)
