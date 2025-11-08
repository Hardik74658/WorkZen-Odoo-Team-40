from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.payroll_schema import PayrollCreate, PayrollOut, PayrollUpdate
from controllers.payroll_controller import (
    create_payroll,
    get_all_payrolls,
    get_payroll_by_eid,
    update_payroll,
    get_payroll_dashboard,
    get_payroll_warnings,
    get_recent_payruns,
    get_employer_cost,
    get_employee_count
)
from utils.permissions import payroll_access

router = APIRouter(prefix="/payroll", tags=["Payroll"])

# ✅ Generate payroll
@router.post("/", response_model=PayrollOut)
def add_payroll(data: PayrollCreate, db: Session = Depends(get_db)):
    return create_payroll(db, data)

# 👀 View all payrolls (Admin)
@router.get("/{company_id}", response_model=list[PayrollOut])
def view_company_payrolls(company_id: int, db: Session = Depends(get_db)):
    return get_all_payrolls(db, company_id)

# 👁️ Get employee payrolls
@router.get("/eid/{eid}", response_model=list[PayrollOut])
def get_employee_payrolls(eid: str, db: Session = Depends(get_db)):
    return get_payroll_by_eid(db, eid)

# ✏️ Update payroll
@router.put("/{payroll_id}", response_model=PayrollOut)
def update_payroll_details(payroll_id: int, data: PayrollUpdate, db: Session = Depends(get_db)):
    return update_payroll(db, payroll_id, data)

# routes/payroll_routes.py



# 🔹 1. Dashboard combined
@router.get("/dashboard/{company_id}", dependencies=[Depends(payroll_access)])
def dashboard(company_id: int, db: Session = Depends(get_db)):
    return get_payroll_dashboard(db, company_id)

# 🔹 2. Warnings
@router.get("/warnings/{company_id}", dependencies=[Depends(payroll_access)])
def warnings(company_id: int, db: Session = Depends(get_db)):
    return get_payroll_warnings(db, company_id)

# 🔹 3. Recent Payruns
@router.get("/recent/{company_id}", dependencies=[Depends(payroll_access)])
def recent(company_id: int, db: Session = Depends(get_db)):
    return get_recent_payruns(db, company_id)

# 🔹 4. Employer Cost
@router.get("/employer-cost/{company_id}", dependencies=[Depends(payroll_access)])
def employer_cost(company_id: int, view: str = "monthly", db: Session = Depends(get_db)):
    return get_employer_cost(db, company_id, view)

# 🔹 5. Employee Count
@router.get("/employee-count/{company_id}", dependencies=[Depends(payroll_access)])
def employee_count(company_id: int, view: str = "monthly", db: Session = Depends(get_db)):
    return get_employee_count(db, company_id, view)
