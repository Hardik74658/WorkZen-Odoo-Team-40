from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.leave_schema import LeaveCreate, LeaveOut, LeaveUpdate
from controllers.leave_controller import (
    create_leave,
    get_all_leaves,
    get_leave_by_eid,
    update_leave,
    approve_or_reject_leave
)

router = APIRouter(prefix="/leaves", tags=["Leave Requests"])

# ✅ Apply for leave
@router.post("/", response_model=LeaveOut)
def apply_leave(data: LeaveCreate, db: Session = Depends(get_db)):
    return create_leave(db, data)

# 👀 Get all leaves (Admin)
@router.get("/{company_id}", response_model=list[LeaveOut])
def get_leaves(company_id: int, db: Session = Depends(get_db)):
    return get_all_leaves(db, company_id)

# 👁️ Get employee leaves
@router.get("/eid/{eid}", response_model=list[LeaveOut])
def get_employee_leaves(eid: str, db: Session = Depends(get_db)):
    return get_leave_by_eid(db, eid)

# ✏️ Approve/Reject leave
@router.put("/{leave_id}", response_model=LeaveOut)
def approve_leave(leave_id: int, data: LeaveUpdate, db: Session = Depends(get_db)):
    return update_leave(db, leave_id, data)

@router.put("/approve/{leave_id}")
def approve_leave(leave_id: int, data: LeaveUpdate, db: Session = Depends(get_db)):
    return approve_or_reject_leave(db, leave_id, data)