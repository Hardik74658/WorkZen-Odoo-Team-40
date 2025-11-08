# models/payroll_model.py

from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

class Payroll(Base):
    __tablename__ = "payrolls"

    payroll_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    eid = Column(String(30), ForeignKey("users.eid"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)

    month = Column(String(20), nullable=False)
    year = Column(Integer, nullable=False)
    basic_salary = Column(Float, nullable=False)
    deductions = Column(Float, default=0)
    net_pay = Column(Float, nullable=False)
    status = Column(String(20), default="Pending")  # Pending, Approved, Paid
    approved_by = Column(String(30), ForeignKey("users.eid"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="payrolls")

    def __repr__(self):
        return f"<Payroll(eid={self.eid}, month={self.month}, status={self.status})>"
