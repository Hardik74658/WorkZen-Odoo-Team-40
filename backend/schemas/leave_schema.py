from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# ✅ Create Schema
class LeaveCreate(BaseModel):
    eid: str
    company_id: int
    leave_type: str
    start_date: date
    end_date: date
    total_days: Optional[int] = None
    reason: Optional[str] = None


# ✅ Output Schema
class LeaveOut(BaseModel):
    leave_id: int
    eid: str
    company_id: int
    leave_type: str
    start_date: date
    end_date: date
    total_days: Optional[int]
    reason: Optional[str]
    status: Optional[str]
    approved_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


# ✅ Update Schema (for Admin approval/reject)
class LeaveUpdate(BaseModel):
    status: Optional[str] = None   # Approved / Rejected
    approved_by: Optional[str] = None

    class Config:
        orm_mode = True
