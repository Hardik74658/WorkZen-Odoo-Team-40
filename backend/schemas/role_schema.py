from pydantic import BaseModel

class RoleIn(BaseModel):
    name: str

class RoleOut(BaseModel):
    rid: int
    name: str

    class Config:
        orm_mode = True
