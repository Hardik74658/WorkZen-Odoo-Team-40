from sqlalchemy.orm import Session
from models.role_model import Role
import re

def _normalize(role_name: str) -> str:
    if not role_name:
        return ""
    cleaned = role_name.replace("-", " ").strip().lower()
    cleaned = re.sub(r"\s+", "_", cleaned)
    return cleaned

def create_role(role_name: str, db: Session):
    norm = _normalize(role_name)
    if not norm:
        return None
    existing = db.query(Role).filter(Role.name == norm).first()
    if existing:
        return existing  # return existing to avoid silent None confusion

    new_role = Role(name=norm)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

def get_all_roles(db: Session):
    return db.query(Role).all()
