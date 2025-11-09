from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserSettingsOut(BaseModel):
    eid: str
    name: str
    company_email: Optional[EmailStr] = None
    personal_email: Optional[EmailStr] = None
    role: str

    class Config:
        orm_mode = True


class UpdateRoleRequest(BaseModel):
    role_id: int  # The new role ID


class UpdateEmailRequest(BaseModel):
    company_email: Optional[EmailStr] = None
    personal_email: Optional[EmailStr] = None