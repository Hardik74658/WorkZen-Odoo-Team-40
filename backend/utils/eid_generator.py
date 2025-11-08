from datetime import datetime
from sqlalchemy.orm import Session
from models.user_model import User
from models.company_model import Company

def generate_eid(db: Session, company_id: int, full_name: str, date_of_joining: datetime):
    # 1) Get company_code from company table
    company = db.query(Company).filter(Company.company_id == company_id).first()
    company_code = company.company_code  # ✅ already stored

    # 2) Split full name
    parts = full_name.split()
    first_name = parts[0]
    last_name = parts[-1] if len(parts) > 1 else parts[0]

    # 3) First 2 letters of each
    name_code = (first_name[:2] + last_name[:2]).upper()

    # 4) Year of joining
    year = date_of_joining.year

    # 5) Count how many users joined in this year
    existing_count = (
        db.query(User)
        .filter(User.date_of_joining != None)
        .filter(User.date_of_joining >= datetime(year, 1, 1))
        .filter(User.date_of_joining <= datetime(year, 12, 31))
        .count()
    )

    # 6) Serial number (4 digits)
    serial = str(existing_count + 1).zfill(4)

    # ✅ FINAL EID
    return f"{company_code}{name_code}{year}{serial}"
