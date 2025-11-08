from sqlalchemy.orm import Session
from models.role_model import Role

def create_role(role_name: str, db: Session):
    existing = db.query(Role).filter(Role.name == role_name).first()
    if existing:
        return None  # will handle in route

    new_role = Role(name=role_name)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role


def get_all_roles(db: Session):
    return db.query(Role).all()
