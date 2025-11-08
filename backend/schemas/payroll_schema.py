from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# ✅ Create Schema
class PayrollCreate(BaseModel):
    eid: str
    company_id: int
    month: str
    year: int
    basic_salary: float
    deductions: Optional[float] = 0
    net_pay: float
    status: Optional[str] = "Pending"  # Pending, Approved, Paid
    approved_by: Optional[str] = None


# ✅ Output Schema
class PayrollOut(BaseModel):
    payroll_id: int
    eid: str
    company_id: int
    month: str
    year: int
    basic_salary: float
    deductions: float
    net_pay: float
    status: str
    approved_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


# ✅ Update Schema
class PayrollUpdate(BaseModel):
    deductions: Optional[float] = None
    net_pay: Optional[float] = None
    status: Optional[str] = None
    approved_by: Optional[str] = None

    class Config:
        orm_mode = True
