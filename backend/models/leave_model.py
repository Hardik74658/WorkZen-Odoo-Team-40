# models/leave_model.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    leave_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    eid = Column(String(30), ForeignKey("user.eid"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)

    leave_type = Column(String(50), nullable=False)  # Sick Leave, Casual Leave, Earned Leave
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Integer, nullable=True)
    reason = Column(String(255), nullable=True)
    status = Column(String(20), default="Pending")  # Pending, Approved, Rejected
    approved_by = Column(String(30), ForeignKey("user.eid"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[eid], back_populates="leaves")

    # The admin/HR who approved or rejected
    approved_user = relationship("User", foreign_keys=[approved_by])

    def __repr__(self):
        return f"<LeaveRequest(eid={self.eid}, type={self.leave_type}, status={self.status})>"
