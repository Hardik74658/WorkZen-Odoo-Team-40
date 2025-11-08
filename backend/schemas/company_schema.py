from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyCreate(BaseModel):
    name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    established_year: Optional[int] = None


class CompanyOut(BaseModel):
    company_id: int
    name: str
    company_code: str
    contact_email: Optional[str]
    contact_phone: Optional[str]
    address: Optional[str]
    website: Optional[str]
    established_year: Optional[int]
    created_at: datetime        # ✅ FIXED
    updated_at: Optional[datetime] 
    class Config:
        orm_mode = True
