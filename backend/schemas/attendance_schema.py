from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

# ✅ Create Schema
class AttendanceCreate(BaseModel):
    eid: str
    company_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: Optional[str] = "Present"   # Present, Absent, On Leave
    approved: Optional[bool] = True
    approved_by: Optional[str] = None



# ✅ Response Schema
class AttendanceOut(BaseModel):
    attendance_id: int
    eid: str
    company_id: int
    date: date
    worked_hours: Optional[float] = 0.0 
    check_in: Optional[time]
    check_out: Optional[time]
    status: Optional[str]
    approved: Optional[bool]
    approved_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


# ✅ Update Schema (optional, for admin approval)
class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    approved: Optional[bool] = None
    approved_by: Optional[str] = None

    class Config:
        orm_mode = True
