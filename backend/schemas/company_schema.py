from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ✅ Input schema — when creating a company (POST request)
class CompanyIn(BaseModel):
    name: str
    company_code: str
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    established_year: Optional[int] = None


# ✅ Output schema — when returning company data (GET/response)
class CompanyOut(BaseModel):
    company_id: int
    name: str
    company_code: str
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    established_year: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
