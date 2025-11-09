from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from schemas.user_schema import UserCreate, UserOut, UserLogin, AdminRegister
from controllers.user_controller import create_user, get_all_users, login_user, admin_register, view_user_controller, update_user_controller, delete_user_controller, create_employee
from utils.permissions import role_required

router = APIRouter(prefix="/users", tags=["Users"])

# ✅ Create user
@router.post("/", response_model=UserOut)
def add_user(data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, data)

# ✅ Get all users (with company & role names)
@router.get("/", response_model=List[UserOut])
def fetch_users(db: Session = Depends(get_db)):
    return get_all_users(db)

# ✅ Login
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, data.eid, data.password)

@router.post("/register-admin")
def register_admin(data: AdminRegister, db: Session = Depends(get_db)):
    return admin_register(db, data)

# 👁️ View single user by EID
@router.get("/user/{eid}", response_model=UserOut)
def view_user(eid: str, db: Session = Depends(get_db)):
    return view_user_controller(db, eid)


# ✏️ Update user info
@router.put("/user/{eid}", response_model=UserOut)
def update_user(
    eid: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(role_required(["admin", "hr_officer"]))
):
    return update_user_controller(db, eid, data)


# ❌ Delete user
@router.delete("/user/{eid}")
def delete_user(eid: str, db: Session = Depends(get_db)):
    return delete_user_controller(db, eid)

@router.post("/add", response_model=UserOut)
def add_employee(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required(["admin", "hr_officer"]))  # ✅ normalized role names
):
    return create_employee(db, data)   
