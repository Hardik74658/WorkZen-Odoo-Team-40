from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from config.database import Base
from sqlalchemy.orm import relationship

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    company_code = Column(String(10), unique=True, nullable=False)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    established_year = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    users = relationship("User", back_populates="company")