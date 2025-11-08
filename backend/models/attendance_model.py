# models/attendance_model.py

from sqlalchemy import Column, Integer, String, Date, Time, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

class Attendance(Base):
    __tablename__ = "attendances"

    attendance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    eid = Column(String(30), ForeignKey("user.eid"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)

    date = Column(Date, nullable=False)
    check_in = Column(Time, nullable=True)
    check_out = Column(Time, nullable=True)
    status = Column(String(20), default="Present")  # Present, Absent, Half-Day, On Leave
    approved = Column(Boolean, default=True)
    worked_hours = Column(Float, default=0.0)  
    approved_by = Column(String(30), ForeignKey("user.eid"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

   
    # ✅ Relationships
    # Main user (whose attendance is recorded)
    user = relationship("User", foreign_keys=[eid], back_populates="attendances")

    # Admin/HR who approved it
    approved_user = relationship("User", foreign_keys=[approved_by])


    def __repr__(self):
        return f"<Attendance(eid={self.eid}, date={self.date}, status={self.status})>"
