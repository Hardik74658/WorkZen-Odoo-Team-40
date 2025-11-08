from fastapi import HTTPException, Depends
from utils.auth import get_current_user

def role_required(allowed_roles: list):
    def wrapper(current_user = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access denied. Only Admin/HR can do this."
            )
        return current_user
    return wrapper

def payroll_access(current_user = Depends(get_current_user)):
    """Allow only Admin or Payroll Officer"""
    if current_user.role.name not in ["Admin", "Payroll Officer"]:
        raise HTTPException(status_code=403, detail="Access denied — Payroll module restricted.")
    return current_user