from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.company_schema import CompanyCreate, CompanyOut
from controllers.company_controller import create_company, get_companies, get_company_by_id
from typing import List

router = APIRouter(prefix="/company", tags=["Company"])

@router.post("/", response_model=CompanyOut)
def add_company(data: CompanyCreate, db: Session = Depends(get_db)):
    return create_company(db, data)


@router.get("/", response_model=List[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return get_companies(db)


@router.get("/{company_id}", response_model=CompanyOut)
def read_company(company_id: int, db: Session = Depends(get_db)):
    return get_company_by_id(db, company_id)
