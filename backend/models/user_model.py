from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class User(Base):
    __tablename__ = "user"

    eid = Column(String(30), primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.rid"), nullable=False)

    name = Column(String(255), nullable=False)
    personal_email = Column(String(255), unique=True, nullable=False)
    company_email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)

    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    date_of_joining = Column(DateTime, nullable=True)
    status = Column(String(20), default="Active")

    is_first_login = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="users")
    role = relationship("Role", back_populates="users")

    def __repr__(self):
        return f"<User(eid={self.eid}, name={self.name}, role_id={self.role_id}, company={self.company_id})>"
