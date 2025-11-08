from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.payroll_model import Payroll
from schemas.payroll_schema import PayrollCreate, PayrollUpdate
from models.user_model import User
from sqlalchemy import func, extract
from datetime import datetime

# ✅ Generate payroll entry
def create_payroll(db: Session, data: PayrollCreate):
    new_payroll = Payroll(
        eid=data.eid,
        company_id=data.company_id,
        month=data.month,
        year=data.year,
        basic_salary=data.basic_salary,
        deductions=data.deductions,
        net_pay=data.net_pay,
        status="Pending",
        approved_by=None   # ✅ Don’t set yet
    )

    db.add(new_payroll)
    db.commit()
    db.refresh(new_payroll)
    return new_payroll



# 👀 View all payrolls (Admin)
def get_all_payrolls(db: Session, company_id: int):
    payrolls = db.query(Payroll).filter(Payroll.company_id == company_id).all()
    if not payrolls:
        raise HTTPException(status_code=404, detail="No payroll records found")
    return payrolls


# 👁️ Get payroll by employee
def get_payroll_by_eid(db: Session, eid: str):
    payrolls = db.query(Payroll).filter(Payroll.eid == eid).all()
    if not payrolls:
        raise HTTPException(status_code=404, detail="No payroll records found for this employee")
    return payrolls


# ✏️ Update payroll (approve/payout)
def update_payroll(db: Session, payroll_id: int, data: PayrollUpdate):
    record = db.query(Payroll).filter(Payroll.payroll_id == payroll_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Payroll record not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)
    return record


# controllers/payroll_controller.py

# ---------- WARNINGS ----------
def get_payroll_warnings(db: Session, company_id: int):
    # If you later add these fields in user_model
    no_bank = db.query(User).filter(User.company_id == company_id, getattr(User, "bank_account", None) == None).count() if hasattr(User, "bank_account") else 0
    no_manager = db.query(User).filter(User.company_id == company_id, getattr(User, "manager_id", None) == None).count() if hasattr(User, "manager_id") else 0
    return {
        "warnings": [
            f"{no_bank} Employee(s) without Bank Account",
            f"{no_manager} Employee(s) without Manager"
        ]
    }


# ---------- RECENT PAYRUNS ----------
def get_recent_payruns(db: Session, company_id: int):
    recent = (
        db.query(
            Payroll.month,
            Payroll.year,
            func.count(Payroll.payroll_id).label("payslip_count")
        )
        .filter(Payroll.company_id == company_id)
        .group_by(Payroll.month, Payroll.year)
        .order_by(Payroll.year.desc(), Payroll.month.desc())
        .limit(3)
        .all()
    )
    return [{"label": f"Payrun for {r.month} {r.year}", "payslips": r.payslip_count} for r in recent]


# ---------- EMPLOYER COST ----------
def get_employer_cost(db: Session, company_id: int, view: str = "monthly"):
    if view == "monthly":
        cost_data = (
            db.query(Payroll.month, Payroll.year, func.sum(Payroll.net_pay).label("total_cost"))
            .filter(Payroll.company_id == company_id)
            .group_by(Payroll.month, Payroll.year)
            .order_by(Payroll.year, Payroll.month)
            .all()
        )
        return [{"month": c.month, "year": c.year, "total_cost": c.total_cost} for c in cost_data]
    else:
        cost_data = (
            db.query(Payroll.year, func.sum(Payroll.net_pay).label("total_cost"))
            .filter(Payroll.company_id == company_id)
            .group_by(Payroll.year)
            .order_by(Payroll.year)
            .all()
        )
        return [{"year": c.year, "total_cost": c.total_cost} for c in cost_data]


# ---------- EMPLOYEE COUNT ----------
def get_employee_count(db: Session, company_id: int, view: str = "monthly"):
    if view == "monthly":
        counts = (
            db.query(
                extract("month", User.date_of_joining).label("month"),
                extract("year", User.date_of_joining).label("year"),
                func.count(User.eid).label("count")
            )
            .filter(User.company_id == company_id)
            .group_by("month", "year")
            .order_by("year", "month")
            .all()
        )
        return [{"month": int(c.month), "year": int(c.year), "count": c.count} for c in counts]
    else:
        counts = (
            db.query(
                extract("year", User.date_of_joining).label("year"),
                func.count(User.eid).label("count")
            )
            .filter(User.company_id == company_id)
            .group_by("year")
            .order_by("year")
            .all()
        )
        return [{"year": int(c.year), "count": c.count} for c in counts]


# ---------- COMBINED DASHBOARD ----------
def get_payroll_dashboard(db: Session, company_id: int):
    return {
        "warnings": get_payroll_warnings(db, company_id),
        "recent_payruns": get_recent_payruns(db, company_id),
        "employer_cost": get_employer_cost(db, company_id, "monthly"),
        "employee_count": get_employee_count(db, company_id, "monthly")
    }
