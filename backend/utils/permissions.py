from fastapi import HTTPException, Depends
from utils.auth import get_current_user

# ---------------------------------------------------------------------------
# Role normalization helpers
# ---------------------------------------------------------------------------
def _normalize(role_name: str | None) -> str:
    """Return a canonical representation of a role name.

    Normalization rules:
      - None -> empty string
      - trim whitespace
      - lowercase
      - spaces converted to single underscore
      - multiple consecutive separators collapsed
    Examples:
        "Admin" -> "admin"
        "Payroll Officer" -> "payroll_officer"
        "HR-Officer" -> "hr_officer"
    """
    if not role_name:
        return ""
    # Replace hyphens with spaces first, then unify to underscores
    cleaned = role_name.replace("-", " ").strip().lower()
    # Collapse any run of whitespace into single underscore
    import re
    cleaned = re.sub(r"\s+", "_", cleaned)
    return cleaned

def _matches(current: str, allowed: list[str]) -> bool:
    current_norm = _normalize(current)
    allowed_norm = {_normalize(r) for r in allowed}
    return current_norm in allowed_norm

# ---------------------------------------------------------------------------
# Generic decorator for role requirements
# ---------------------------------------------------------------------------
def role_required(allowed_roles: list[str]):
    """Dependency factory ensuring current user has one of allowed roles.

    allowed_roles may be provided in any readable format (case / spaces / dashes).
    """
    def wrapper(current_user = Depends(get_current_user)):
        role_name = getattr(getattr(current_user, "role", None), "name", None)
        if not _matches(role_name, allowed_roles):
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Requires one of: {', '.join(allowed_roles)}"
            )
        return current_user
    return wrapper

# ---------------------------------------------------------------------------
# Specific payroll access dependency
# ---------------------------------------------------------------------------
def payroll_access(current_user = Depends(get_current_user)):
    """Allow only Admin or Payroll Officer (flexible casing / formatting)."""
    role_name = getattr(getattr(current_user, "role", None), "name", None)
    if not _matches(role_name, ["admin", "payroll_officer"]):
        raise HTTPException(status_code=403, detail="Access denied — Payroll module restricted.")
    return current_user

# Optional: export a reusable constant for other modules
PAYROLL_ALLOWED_ROLES = ["admin", "payroll_officer"]