from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class Company(Base):
    __tablename__ = "company"

    company_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    company_code = Column(String(10), nullable=False, unique=True)  # e.g. 'OI' for Odoo India
    address = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    established_year = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with users (employees, admins, etc.)
    # users = relationship("User", back_populates="company")

    def __repr__(self):
        return f"<Company(name={self.name}, code={self.company_code})>"
