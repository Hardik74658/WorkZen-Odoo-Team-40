from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from controllers.setting_controller import (
    get_users_for_settings,
    update_user_role,
    update_user_email,
    get_all_roles
)
from schemas.setting_schema import UpdateRoleRequest, UpdateEmailRequest
from utils.permissions import role_required  # Use flexible role gating

# Define which roles can access settings (admin only for now)
SETTINGS_ALLOWED_ROLES = ["admin"]

router = APIRouter(prefix="/settings", tags=["Settings"])

# 🔹 Get all users (Settings Table)
@router.get("/users/{company_id}")
def get_users(company_id: int, db: Session = Depends(get_db), current_user = Depends(role_required(SETTINGS_ALLOWED_ROLES))):
    # Ensure requesting user's company matches to prevent cross-company enumeration
    if current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail="Cannot view another company's users")
    return get_users_for_settings(db, company_id)


# 🔹 Update user role
@router.put("/update-role/{eid}")
def change_role(eid: str, data: UpdateRoleRequest, db: Session = Depends(get_db), current_user = Depends(role_required(SETTINGS_ALLOWED_ROLES))):
    return update_user_role(db, eid, data)


# 🔹 Update user email
@router.put("/update-email/{eid}")
def change_email(eid: str, data: UpdateEmailRequest, db: Session = Depends(get_db), current_user = Depends(role_required(SETTINGS_ALLOWED_ROLES))):
    return update_user_email(db, eid, data)


# 🔹 Get all roles for dropdown
@router.get("/roles")
def get_roles(db: Session = Depends(get_db), current_user = Depends(role_required(SETTINGS_ALLOWED_ROLES))):
    return get_all_roles(db)