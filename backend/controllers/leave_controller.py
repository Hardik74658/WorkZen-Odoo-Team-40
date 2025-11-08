from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.leave_model import LeaveRequest
from models.user_model import User
from schemas.leave_schema import LeaveCreate, LeaveUpdate
from datetime import datetime

# ✅ Apply for leave
def create_leave(db: Session, data: LeaveCreate):
    new_leave = LeaveRequest(
        eid=data.eid,
        company_id=data.company_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        total_days=data.total_days,
        reason=data.reason
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave


# 👀 Get all leaves for a company (Admin)
def get_all_leaves(db: Session, company_id: int):
    leaves = db.query(LeaveRequest).filter(LeaveRequest.company_id == company_id).all()
    if not leaves:
        raise HTTPException(status_code=404, detail="No leave records found")
    result = []
    for leave in leaves:
        user = db.query(User).filter(User.eid == leave.eid).first()
        leave_dict = leave.__dict__.copy()
        leave_dict["employee_name"] = user.name if user else "Unknown"
        result.append(leave_dict)
    return result


# 👁️ Get leave by employee
def get_leave_by_eid(db: Session, eid: str):
    leaves = db.query(LeaveRequest).filter(LeaveRequest.eid == eid).all()
    if not leaves:
        raise HTTPException(status_code=404, detail="No leave records found for this employee")
    return leaves


# ✏️ Approve or reject leave
def update_leave(db: Session, leave_id: int, data: LeaveUpdate):
    leave = db.query(LeaveRequest).filter(LeaveRequest.leave_id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(leave, key, value)

    db.commit()
    db.refresh(leave)
    return leave

def approve_or_reject_leave(db: Session, leave_id: int, data: LeaveUpdate):
    leave = db.query(LeaveRequest).filter(LeaveRequest.leave_id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    # Validate approver
    approver = db.query(User).filter(User.eid == data.approved_by).first()
    if not approver:
        raise HTTPException(status_code=404, detail="Approver user not found")

    # Update leave
    leave.status = data.status
    leave.approved_by = data.approved_by
    db.commit()
    db.refresh(leave)

    # Get employee and approver names
    employee = db.query(User).filter(User.eid == leave.eid).first()
    employee_name = employee.name if employee else "Unknown"

    return {
        "message": f"Leave {data.status.lower()} successfully",
        "leave_id": leave.leave_id,
        "employee_name": employee_name,
        "leave_type": leave.leave_type,
        "status": leave.status,
        "approved_by": data.approved_by,
        "approver_name": approver.name,
        "start_date": str(leave.start_date),
        "end_date": str(leave.end_date),
        "total_days": leave.total_days
    }