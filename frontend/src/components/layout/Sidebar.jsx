import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { deleteCookie, getCookie, getCookieJSON } from '../../utils/cookies.js';

import {
  UserCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  SunIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ROLE_LABELS = {
  admin: 'Admin',
  hr_officer: 'HR Officer',
  payroll_officer: 'Payroll Officer',
  employee: 'Employee'
};

const ALL_ROLES = Object.keys(ROLE_LABELS);

export const SIDEBAR_LINKS = [
  {
    name: 'Employees',
    path: '/employees',
    icon: UserGroupIcon,
    description: 'Directory',
    allowedRoles: ALL_ROLES
  },
  {
    name: 'Add user',
    path: '/add-user',
    icon: PlusIcon,
    description: 'Onboard new hire',
    allowedRoles: ['admin', 'hr_officer']
  },
  {
    name: 'New Users',
    path: '/new-users',
    icon: UserCircleIcon,
    description: 'Send credentials',
    allowedRoles: ['admin', 'hr_officer']
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: CalendarDaysIcon,
    description: 'Clock-in history',
    allowedRoles: ['admin', 'hr_officer', 'employee']
  },
  {
    name: 'Time Off',
    path: '/time-off',
    icon: SunIcon,
    description: 'Leave planner',
    allowedRoles: ['admin', 'hr_officer', 'employee']
  },
  {
    name: 'Payroll',
    path: '/payroll',
    icon: BanknotesIcon,
    description: 'Salary cycles',
    allowedRoles: ['admin', 'payroll_officer']
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: ChartBarIcon,
    description: 'Insights',
    allowedRoles: ['admin', 'hr_officer', 'payroll_officer']
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Cog6ToothIcon,
    description: 'Workspace',
    allowedRoles: ['admin']
  }
];

const Sidebar = ({
  userRole,
  onLogout,
  attendanceStatus,
  links
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storedUser = useSelector((state) => state.auth.user);
  const cookieUserData = useMemo(() => getCookieJSON('userData'), []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    ['authToken', 'userId', 'userName', 'userRole', 'userRoleId', 'userCompany', 'userCompanyId', 'userProfile', 'userData'].forEach((key) => deleteCookie(key));
    dispatch(logout());
  };

  const normalizeRole = (roleValue) => {
    if (!roleValue) return null;
    if (typeof roleValue === 'string') return roleValue.toLowerCase();
    if (typeof roleValue === 'object' && roleValue !== null) {
      if (roleValue.name) return String(roleValue.name).toLowerCase();
      if (roleValue.role_name) return String(roleValue.role_name).toLowerCase();
    }
    return null;
  };

  const derivedRole = useMemo(() => {
    const fromProps = normalizeRole(userRole);
    if (fromProps) return fromProps;
    const storeRole = normalizeRole(storedUser?.role);
    if (storeRole) return storeRole;
    const roleName = normalizeRole(storedUser?.role_name);
    if (roleName) return roleName;
    const cookieRole = normalizeRole(cookieUserData?.role) || normalizeRole(cookieUserData?.role_name) || normalizeRole(getCookie('userRole'));
    return cookieRole;
  }, [userRole, storedUser, cookieUserData]);

  const navItems = useMemo(() => {
    const sourceLinks = links || SIDEBAR_LINKS;
    if (!derivedRole) return sourceLinks;

    return sourceLinks.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return item.allowedRoles.includes(derivedRole);
    });
  }, [links, derivedRole]);

  const companyBadge = useMemo(() => {
    return {
      name: storedUser?.companyName || cookieUserData?.company || getCookie('userCompany') || 'WorkZen HR',
      logo: storedUser?.companyLogo || null
    };
  }, [storedUser, cookieUserData]);

  const roleLabel = useMemo(() => {
    const finalRole = derivedRole;
    if (finalRole && ROLE_LABELS[finalRole]) return ROLE_LABELS[finalRole];
    const fallback = normalizeRole(storedUser?.role) || normalizeRole(storedUser?.role_name);
    if (fallback && ROLE_LABELS[fallback]) return ROLE_LABELS[fallback];
    return 'Member';
  }, [derivedRole, storedUser]);

  const canCreateRecord = derivedRole === 'admin' || derivedRole === 'hr_officer';

  return (
    <aside
      className="flex border p-2 min-h-screen w-72 flex-col flex-shrink-0 border-r border-[var(--brand-purple)]/10 bg-white/90 backdrop-blur shadow-[0_25px_60px_rgba(15,23,42,0.12)] rounded-r-[32px]"
    >
      <div className="relative flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8">
          <div className="rounded-3xl bg-gradient-to-br from-white via-white to-[var(--surface)] p-4 shadow-[0_15px_40px_rgba(111,66,193,0.12)] border border-[var(--brand-purple)]/10">
            <div className="flex items-center gap-3">
              {companyBadge.logo ? (
                <img
                  src={companyBadge.logo}
                  alt="Company logo"
                  className="h-12 w-12 rounded-2xl object-cover border border-[var(--brand-purple)]/20"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-purple)]/12 text-[var(--brand-purple)]">
                  <UserCircleIcon className="h-7 w-7" />
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-purple)]/70">Company</p>
                <h1 className="text-lg font-semibold text-gray-900">{companyBadge.name}</h1>
                <p className="text-xs text-[var(--text-muted)]">{roleLabel}</p>
              </div>
            </div>
            {canCreateRecord && (
              <button
                type="button"
                onClick={() => navigate('/add-user')}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-purple)] text-white py-2.5 text-sm font-semibold shadow-[0_12px_25px_rgba(111,66,193,0.25)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-purple-soft)]"
              >
                <PlusIcon className="h-5 w-5" />
                New
              </button>
            )}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[var(--brand-purple)]/15 bg-[var(--surface-muted)]/80 px-4 py-2 shadow-sm">
            <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search employees"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Overview</p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => `
                        group flex items-center justify-between rounded-2xl border transition-all duration-200 px-4 py-3
                        ${isActive ? 'border-[var(--brand-purple)]/20 bg-white text-[var(--brand-purple)] shadow-[0_12px_28px_rgba(111,66,193,0.16)]' : 'border-transparent text-gray-600 hover:border-[var(--brand-purple)]/10 hover:bg-white/70 hover:text-[var(--brand-purple)]'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-2xl border bg-white/80 text-[var(--brand-purple)] transition-all duration-200 ${
                                isActive
                                  ? 'border-[var(--brand-purple)]/40 bg-[var(--brand-purple)]/10'
                                  : 'border-[var(--brand-purple)]/10 group-hover:border-[var(--brand-purple)]/20 group-hover:bg-[var(--brand-purple)]/10'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold leading-tight">{item.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                            </div>
                          </div>
                          <span
                            className={`h-2 w-2 rounded-full transition ${
                              isActive ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-red)]/40'
                            }`}
                          ></span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

       
      </div>
    </aside>
  );
};

export default Sidebar;
