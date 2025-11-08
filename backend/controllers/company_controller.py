from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.company_model import Company
from schemas.company_schema import CompanyIn

# ✅ Add company
def add_company_controller(db: Session, data: CompanyIn):
    # Check if company already exists
    existing = db.query(Company).filter(
        (Company.name == data.name) | (Company.company_code == data.company_code)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")

    new_company = Company(
        name=data.name,
        company_code=data.company_code,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        address=data.address,
        website=data.website,
        established_year=data.established_year,
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company


# 👀 View all companies
def get_all_companies_controller(db: Session):
    companies = db.query(Company).all()
    if not companies:
        raise HTTPException(status_code=404, detail="No companies found")
    return companies


# 👁️ View company by ID
def get_company_by_id_controller(db: Session, company_id: int):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
