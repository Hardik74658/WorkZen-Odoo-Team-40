from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user_model import User
from models.role_model import Role
from schemas.setting_schema import UpdateRoleRequest, UpdateEmailRequest

# NOTE: This controller is tailored for the admin Settings page UI.
# It purposely returns lightweight dictionaries instead of ORM objects so the
# frontend has a consistent shape (eid, name, emails, role_id, role_name, company_id).

# 🧾 Get all users for settings page
def get_users_for_settings(db: Session, company_id: int):
    """Return all users for a company with role metadata.

    Shape matches (superset of) what Settings.jsx expects:
    {
      eid, name, company_email, personal_email, role_id, role_name, company_id
    }
    """
    users = db.query(User).filter(User.company_id == company_id).all()
    if not users:
        return []  # empty list is OK for UI – no need to 404

    # Pre-fetch roles into a dict to avoid N+1 lookups
    role_map = {r.rid: r.name for r in db.query(Role).all()}
    output = []
    for u in users:
        role_name = role_map.get(u.role_id, "") if u.role_id else ""
        output.append({
            "eid": u.eid,
            "name": u.name,
            "company_email": u.company_email,
            "personal_email": u.personal_email,
            "role_id": u.role_id,
            "role_name": role_name,
            "company_id": u.company_id,
        })
    return output


# 🔄 Update user role
def update_user_role(db: Session, eid: str, data: UpdateRoleRequest):
    """Update a user's role.

    Returns the updated lightweight user dict so the frontend can merge it
    without re-fetching the whole list.
    """
    user = db.query(User).filter(User.eid == eid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.rid == data.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role does not exist")

    # No-op optimization
    if user.role_id == data.role_id:
        return {
            "message": "No change – role already set",
            "user": {
                "eid": user.eid,
                "role_id": user.role_id,
                "role_name": role.name,
            }
        }

    user.role_id = data.role_id
    db.commit()
    db.refresh(user)

    return {
        "message": f"Role updated successfully for {user.name}",
        "user": {
            "eid": user.eid,
            "role_id": user.role_id,
            "role_name": role.name,
        }
    }


# 📧 Update user email(s)
def update_user_email(db: Session, eid: str, data: UpdateEmailRequest):
    user = db.query(User).filter(User.eid == eid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.company_email is not None:
        user.company_email = data.company_email
    if data.personal_email is not None:
        user.personal_email = data.personal_email

    db.commit()
    db.refresh(user)
    return {
        "message": f"Email updated successfully for {user.name}",
        "user": {
            "eid": user.eid,
            "company_email": user.company_email,
            "personal_email": user.personal_email,
        }
    }


# 🧩 Get all roles (for dropdown)
def get_all_roles(db: Session):
    return db.query(Role).order_by(Role.name.asc()).all()