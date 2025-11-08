from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.role_schema import RoleIn, RoleOut
from controllers.role_controller import create_role, get_all_roles

router = APIRouter(prefix="/role", tags=["Role"])


@router.post("/", status_code=201)
def add_role(role: RoleIn, db: Session = Depends(get_db)):
    new_role = create_role(role.name, db)
    if new_role is None:
        raise HTTPException(status_code=400, detail="Role already exists")

    return {"message": "Role Added Successfully"}

@router.get("/", response_model=list[RoleOut])
def fetch_roles(db: Session = Depends(get_db)):
    return get_all_roles(db)
