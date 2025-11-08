from sqlalchemy.orm import Session
from models.company_model import Company
from schemas.company_schema import CompanyCreate
from fastapi import HTTPException

def generate_company_code(name: str):
    words = name.split()
    code = "".join(w[0] for w in words).upper()
    return code


def create_company(db: Session, data: CompanyCreate):
    # ✅ Check if company already exists
    exists = db.query(Company).filter(Company.name == data.name).first()
    if exists:
        raise HTTPException(
            status_code=400,
            detail="Company with this name already exists"
        )

    # ✅ Generate company code
    company_code = generate_company_code(data.name)

    # ✅ Check if company code already exists
    code_exists = db.query(Company).filter(Company.company_code == company_code).first()
    if code_exists:
        raise HTTPException(
            status_code=400,
            detail="Company code already exists. Choose a different name."
        )

    new_company = Company(
        name=data.name,
        company_code=company_code,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        address=data.address,
        website=data.website,
        established_year=data.established_year
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

def get_companies(db: Session):
    return db.query(Company).all()


def get_company_by_id(db: Session, company_id: int):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
