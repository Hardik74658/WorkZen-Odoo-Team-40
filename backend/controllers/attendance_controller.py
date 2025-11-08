from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.attendance_model import Attendance
from models.user_model import User
from schemas.attendance_schema import AttendanceCreate, AttendanceUpdate
from datetime import datetime , date, time

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


def check_in(db: Session, eid: str, company_id: int):
    today = date.today()  # ✅ Pure date object (no time)

    # Check if already checked in today
    existing = db.query(Attendance).filter(
        Attendance.eid == eid,
        Attendance.date == today
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")

    now = datetime.now().time()  # current time only

    new_attendance = Attendance(
        eid=eid,
        company_id=company_id,
        date=today,               # ✅ matches Date column type
        check_in=now,
        status="Present",
        approved=True
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return {
        "message": "Check-in recorded successfully",
        "check_in_time": str(now),
        "date": str(today)
    }


# ✅ 2. Check-Out (calculates worked hours)
def check_out(db: Session, eid: str):
    today = date.today()

    # ✅ Find today's attendance record
    record = db.query(Attendance).filter(
        Attendance.eid == eid,
        Attendance.date == today
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="No check-in found for today")

    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")

    now = datetime.now().time()

    # ✅ Calculate worked hours
    checkin_dt = datetime.combine(today, record.check_in)
    checkout_dt = datetime.combine(today, now)
    duration = (checkout_dt - checkin_dt).total_seconds() / 3600  # Convert seconds to hours

    worked_hours = round(duration, 2)
    record.check_out = now
    record.worked_hours = worked_hours
    record.status = "Completed"

    # ✅ Calculate extra hours (if any)
    extra_hours = 0
    if worked_hours > 8:
        extra_hours = round(worked_hours - 8, 2)

    # ✅ Fetch employee name
    user = db.query(User).filter(User.eid == eid).first()
    employee_name = user.name if user else "Unknown"

    db.commit()
    db.refresh(record)

    return {
        "message": "Check-out recorded successfully",
        "employee_name": employee_name,
        "date": str(record.date),
        "check_in": str(record.check_in),
        "check_out": str(record.check_out),
        "worked_hours": worked_hours,
        "extra_hours": extra_hours
    }
