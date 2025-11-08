from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.attendance_schema import AttendanceCreate, AttendanceOut, AttendanceUpdate
from controllers.attendance_controller import (
    create_attendance,
    get_all_attendance,
    get_attendance_by_eid,
    update_attendance,
    check_in,
    check_out
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])

# ✅ Add / mark attendance
@router.post("/", response_model=AttendanceOut)
def add_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    return create_attendance(db, data)

# 👀 Get all attendance (Admin)
@router.get("/{company_id}", response_model=list[AttendanceOut])
def get_attendance_list(company_id: int, db: Session = Depends(get_db)):
    return get_all_attendance(db, company_id)

# 👁️ Get attendance by employee EID
@router.get("/eid/{eid}", response_model=list[AttendanceOut])
def get_employee_attendance(eid: str, db: Session = Depends(get_db)):
    return get_attendance_by_eid(db, eid)

# ✏️ Update / approve attendance
@router.put("/{attendance_id}", response_model=AttendanceOut)
def edit_attendance(attendance_id: int, data: AttendanceUpdate, db: Session = Depends(get_db)):
    return update_attendance(db, attendance_id, data)

@router.post("/checkin/{eid}/{company_id}")
def attendance_checkin(eid: str, company_id: int, db: Session = Depends(get_db)):
    return check_in(db, eid, company_id)

# ✅ Check-Out
@router.put("/checkout/{eid}")
def attendance_checkout(eid: str, db: Session = Depends(get_db)):
    return check_out(db, eid)