from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.attendance_model import Attendance
from schemas.attendance_schema import AttendanceCreate, AttendanceUpdate
from datetime import datetime

# ✅ Create or mark attendance
def create_attendance(db: Session, data: AttendanceCreate):
    # Prevent duplicate attendance for same date
    existing = db.query(Attendance).filter(
        Attendance.eid == data.eid,
        Attendance.date == data.date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")

    new_attendance = Attendance(
        eid=data.eid,
        company_id=data.company_id,
        date=data.date,
        check_in=data.check_in,
        check_out=data.check_out,
        status=data.status or "Present",
        approved=data.approved,
        approved_by=data.approved_by
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance


# 👀 View all attendance (Admin)
def get_all_attendance(db: Session, company_id: int):
    records = db.query(Attendance).filter(Attendance.company_id == company_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No attendance records found")
    return records


# 👁️ View employee attendance
def get_attendance_by_eid(db: Session, eid: str):
    records = db.query(Attendance).filter(Attendance.eid == eid).all()
    if not records:
        raise HTTPException(status_code=404, detail="No attendance records for this employee")
    return records


# ✏️ Update / Approve attendance
def update_attendance(db: Session, attendance_id: int, data: AttendanceUpdate):
    record = db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)
    return record
