from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    company_id: int
    role_id: int
    
    name: str
    personal_email: EmailStr
    company_email: Optional[EmailStr] = None
    password: str                      # raw password (we will hash it)

    department: Optional[str] = None
    position: Optional[str] = None
    date_of_joining: Optional[datetime] = None
    bank_account: Optional[str] = None          # ✅ NEW
    manager_id: Optional[str] = None            # ✅ NEW

class UserOut(BaseModel):
    eid: str
    company_id: int
    role_id: int

    name: str
    personal_email: EmailStr
    company_email: Optional[EmailStr]
    bank_account: Optional[str] = None          # ✅ NEW
    manager_id: Optional[str] = None            # ✅ NEW

    department: Optional[str]
    position: Optional[str]
    date_of_joining: Optional[datetime]
    status: str

    is_first_login: bool

    created_at: datetime
    updated_at: datetime

    # Include related data
    company_name: Optional[str] = None
    role_name: Optional[str] = None

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    eid: str
    password: str

class AdminRegister(BaseModel):
    full_name: str
    email: EmailStr
    contact: str
    password: str
    company_name: str
    company_logo: str

