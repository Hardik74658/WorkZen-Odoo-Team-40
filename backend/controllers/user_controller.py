from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user_model import User
from models.company_model import Company
from models.role_model import Role
from schemas.user_schema import UserCreate
from utils.auth import hash_password, verify_password, create_access_token
from utils.eid_generator import generate_eid
from datetime import datetime

# ✅ Create User
def create_user(db: Session, data: UserCreate):

    # Check personal email uniqueness
    if db.query(User).filter(User.personal_email == data.personal_email).first():
        raise HTTPException(status_code=400, detail="Personal email already exists")

    # Generate EID
    eid = generate_eid(
        db=db,
        company_id=data.company_id,
        full_name=data.name,
        date_of_joining=data.date_of_joining
    )

    new_user = User(
        eid=eid,
        company_id=data.company_id,
        role_id=data.role_id,
        name=data.name,
        personal_email=data.personal_email,
        company_email=data.company_email,
        password_hash=hash_password(data.password),
        department=data.department,
        position=data.position,
        date_of_joining=data.date_of_joining
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "eid": new_user.eid,
        "company_id": new_user.company_id,
        "role_id": new_user.role_id,
        "name": new_user.name,
        "personal_email": new_user.personal_email,
        "company_email": new_user.company_email,
        "department": new_user.department,
        "position": new_user.position,
        "date_of_joining": new_user.date_of_joining,
        "status": new_user.status,
        "is_first_login": new_user.is_first_login,
        "created_at": new_user.created_at,
        "updated_at": new_user.updated_at,
        "company_name": new_user.company.name,
        "role_name": new_user.role.name
    }


# ✅ Fetch All Users
def get_all_users(db: Session):
    users = db.query(User).all()

    output = []
    for user in users:
        output.append({
            "eid": user.eid,
            "company_id": user.company_id,
            "role_id": user.role_id,
            "name": user.name,
            "personal_email": user.personal_email,
            "company_email": user.company_email,
            "department": user.department,
            "position": user.position,
            "date_of_joining": user.date_of_joining,
            "status": user.status,
            "is_first_login": user.is_first_login,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "company_name": user.company.name,
            "role_name": user.role.name
        })
    
    return output


# ✅ Login User
def login_user(db: Session, eid: str, password: str):

    # ✅ Find user using EID
    user = db.query(User).filter(User.eid == eid).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Verify password
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="Wrong password")

    # ✅ Generate token
    token = create_access_token({
        "eid": user.eid,
        "role": user.role.name
    })

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "eid": user.eid,
            "name": user.name,
            "role": user.role.name,
            "company": user.company.name
        }
    }


def admin_register(db: Session, data):

    # ✅ Check if company already exists
    existing_company = db.query(Company).filter(
        Company.name == data.company_name
    ).first()

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company already exists. You cannot register as admin."
        )
    
    # ✅ Create new company
    company_code = "".join(w[0] for w in data.company_name.split()).upper()
    
    new_company = Company(
        name=data.company_name,
        company_code=company_code,
        contact_email=data.email,
        contact_phone=data.contact,
        address=None,
        website=None,
        established_year=datetime.now().year
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    # ✅ Create role "admin" if not exists
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        admin_role = Role(name="admin")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)

    # ✅ Generate EID for Admin
    eid = generate_eid(
        db=db,
        company_id=new_company.company_id,
        full_name=data.full_name,
        date_of_joining=datetime.now()
    )

    # ✅ Create new Admin user
    new_user = User(
        eid=eid,
        name=data.full_name,
        personal_email=data.email,
        company_email=None,
        password_hash=hash_password(data.password),
        company_id=new_company.company_id,
        role_id=admin_role.rid,
        department="Admin",
        position="Administrator",
        date_of_joining=datetime.now(),
        status="Active"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Company and Admin created successfully",
        "company": {
            "company_id": new_company.company_id,
            "company_name": new_company.name,
            "company_code": new_company.company_code
        },
        "admin": {
            "eid": new_user.eid,
            "name": new_user.name,
            "email": new_user.personal_email
        }
    }


def view_user_controller(db: Session, eid: str):
    user = db.query(User).filter(User.eid == eid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_controller(db: Session, eid: str, data: dict):
    user = db.query(User).filter(User.eid == eid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in data.items():
        if hasattr(user, key):
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

# ❌ Delete user
def delete_user_controller(db: Session, eid: str):
    user = db.query(User).filter(User.eid == eid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User {eid} deleted successfully"}
