import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Loader from '../layout/Loader.jsx';
import { fetchSettingsRoles, fetchSettingsUsers, updateUserRole } from '../../services/user.js';
import { getCookie } from '../../utils/cookies.js';

const ROLE_LABELS = {
  admin: 'Admin',
  administrator: 'Admin',
  hr_officer: 'HR Officer',
  hr: 'HR Officer',
  human_resources: 'HR Officer',
  payroll_officer: 'Payroll Officer',
  payroll: 'Payroll Officer',
  employee: 'Employee'
};

const canonicalizeRoleName = (rawName) => {
  if (!rawName) return null;
  const normalized = rawName.trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'hr_manager' || normalized === 'human_resource' || normalized === 'human_resources_officer') {
    return 'hr_officer';
  }
  if (normalized === 'payroll_manager' || normalized === 'payroll_specialist') {
    return 'payroll_officer';
  }
  return normalized;
};

const formatRoleLabel = (roleName) => {
  const canonical = canonicalizeRoleName(roleName);
  if (canonical && ROLE_LABELS[canonical]) {
    return ROLE_LABELS[canonical];
  }
  if (!roleName) return '—';
  return roleName
    .toString()
    .split(/[_\s]+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
};

const extractRoleName = (source) => {
  if (!source) return null;
  if (typeof source === 'string') return source;
  if (typeof source === 'object') {
    if (source.role) return extractRoleName(source.role);
    if (source.role_name) return source.role_name;
    if (source.roleName) return source.roleName;
    if (source.name) return source.name;
  }
  return null;
};

const moduleAccessList = [
  {
    key: 'employees',
    title: 'Employees',
    description: 'Manage directory and lifecycle events.',
  },
  {
    key: 'attendance',
    title: 'Attendance',
    description: 'Review check-ins and attendance logs.',
  },
  {
    key: 'time_off',
    title: 'Time Off',
    description: 'Approve leave requests and track balance.',
  },
  {
    key: 'payroll',
    title: 'Payroll',
    description: 'Control payroll cycles and payouts.',
  },
  {
    key: 'reports',
    title: 'Reports',
    description: 'Summaries for compliance and audits.',
  }
];

const Settings = () => {
  const authUser = useSelector((state) => state.auth.user);
  const cookieRole = useMemo(() => getCookie('userRole'), []);
  const viewerRole = useMemo(() => {
    const directRole = extractRoleName(authUser);
    const fallback = extractRoleName(authUser?.user) || cookieRole;
    return canonicalizeRoleName(directRole || fallback);
  }, [authUser, cookieRole]);
  const viewerRoleRef = useRef(viewerRole);
  viewerRoleRef.current = viewerRole;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleChanges, setRoleChanges] = useState({});
  const [saving, setSaving] = useState({});
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState('');

  const roleOptionById = useMemo(() => {
    return roleOptions.reduce((acc, role) => {
      acc[role.id] = role;
      return acc;
    }, {});
  }, [roleOptions]);

  const loadData = useCallback(async (isManualRefresh = false) => {
    const effectiveRole = viewerRoleRef.current;
    if (effectiveRole && effectiveRole !== 'admin') {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');
    try {
      // Determine company id from cookie / auth user for scoping settings query
      const companyId = authUser?.company_id || authUser?.user?.company_id || getCookie('userCompanyId');
      if (!companyId) {
        throw new Error('Missing company context for settings');
      }
      const [usersResponse, rolesResponse] = await Promise.all([
        fetchSettingsUsers(companyId),
        fetchSettingsRoles(),
      ]);

      const normalizedRoles = (rolesResponse?.data || [])
        .map((role) => {
          const canonical = canonicalizeRoleName(role?.name);
          if (!canonical || !ROLE_LABELS[canonical]) {
            return null;
          }
          return {
            id: role.rid,
            name: role.name,
            canonical,
            label: ROLE_LABELS[canonical]
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.label.localeCompare(b.label));

      setRoleOptions(normalizedRoles);
      // Backend returns list of user dicts. Normalize keys if needed.
      const rawUsers = usersResponse?.data || [];
      const normalizedUsers = rawUsers.map((u) => ({
        eid: u.eid,
        name: u.name,
        company_email: u.company_email || null,
        personal_email: u.personal_email || null,
        role_id: u.role_id || null,
        role_name: u.role_name || u.role || null,
      }));
      setUsers(normalizedUsers);
      setRoleChanges({});
    } catch (err) {
      console.error('Failed to load settings data:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Unexpected error';
      setError(detail);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = (user, event) => {
    const selectedId = Number(event.target.value);
    setRoleChanges((prev) => {
      if (!Number.isFinite(selectedId) || selectedId === user.role_id) {
        const { [user.eid]: _omit, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [user.eid]: selectedId
      };
    });
  };

  const handleSaveRole = async (user) => {
    const pendingRoleId = roleChanges[user.eid];
    if (!pendingRoleId || pendingRoleId === user.role_id) {
      return;
    }

    setSaving((prev) => ({ ...prev, [user.eid]: true }));
    setBanner(null);
    try {
      const response = await updateUserRole(user.eid, pendingRoleId);
      const updatedUser = response?.data?.user || {};
      setUsers((prev) => prev.map((item) => {
        if (item.eid !== user.eid) return item;
        return {
          ...item,
          role_id: updatedUser.role_id ?? pendingRoleId,
          role_name: updatedUser.role_name || item.role_name,
        };
      }));
      setRoleChanges((prev) => {
        const { [user.eid]: _omit, ...rest } = prev;
        return rest;
      });
      const label = roleOptionById[pendingRoleId]?.label || formatRoleLabel(updatedUser.role_name);
      setBanner({
        type: 'success',
        message: `${user.name || user.eid} is now ${label}.`
      });
    } catch (err) {
      console.error('Failed to update role:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Could not update role';
      setBanner({ type: 'error', message: detail });
    } finally {
      setSaving((prev) => {
        const { [user.eid]: _omit, ...rest } = prev;
        return rest;
      });
    }
  };

  const hasPendingChange = (user) => roleChanges[user.eid] !== undefined && roleChanges[user.eid] !== user.role_id;
  const isSaving = (user) => Boolean(saving[user.eid]);

  const renderBanner = () => {
    if (!banner && !error) return null;
    const type = banner?.type || (error ? 'error' : 'info');
    const message = banner?.message || error;
    const Icon = type === 'success' ? CheckCircleIcon : ExclamationTriangleIcon;
    const toneClasses =
      type === 'success'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

    return (
      <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${toneClasses}`}>
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{type === 'success' ? 'Role updated' : 'Heads up'}</p>
          <p className="text-xs sm:text-sm">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setBanner(null);
            setError('');
          }}
          className="text-xs font-medium text-[var(--brand-purple)] hover:underline"
        >
          Dismiss
        </button>
      </div>
    );
  };

  if (viewerRole && viewerRole !== 'admin') {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm text-amber-700">
        <h1 className="text-lg font-semibold text-amber-800">Restricted area</h1>
        <p className="mt-2 max-w-2xl text-sm">
          Only administrators can manage company roles. If you believe you should have access, please reach out to your WorkZen admin team.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Assign roles across key HR modules. Only administrators can access this workspace to manage company-wide permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-purple)]/30 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-purple)] shadow-sm transition hover:border-[var(--brand-purple)]/60"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {renderBanner()}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-[var(--brand-purple)]/15 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-[var(--brand-purple)]/10 p-2 text-[var(--brand-purple)]">
              <ShieldCheckIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Module access</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Roles define what each teammate sees across the suite.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {moduleAccessList.map((item) => (
              <li key={item.key} className="rounded-2xl border border-gray-100 bg-[var(--surface-muted)]/70 px-3 py-2">
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User name
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Login ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
                      No teammates found. Invite teammates from the <span className="font-medium text-[var(--brand-purple)]">Add user</span> panel to get started.
                    </td>
                  </tr>
                )}
                {users.map((user) => {
                  const currentRole = roleOptionById[user.role_id];
                  const pendingRoleId = roleChanges[user.eid];
                  const selectValueRaw = pendingRoleId ?? user.role_id ?? '';
                  const selectValue = selectValueRaw === '' ? '' : String(selectValueRaw);
                  const pendingRole = pendingRoleId ? roleOptionById[pendingRoleId] : null;

                  return (
                    <tr key={user.eid} className="transition hover:bg-[var(--surface-muted)]/60">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{user.eid}</td>
                      <td className="px-6 py-4 text-gray-600">{user.company_email || user.personal_email || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <select
                            className="w-52 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-[var(--brand-purple)] focus:outline-none"
                            value={selectValue}
                            onChange={(event) => handleRoleChange(user, event)}
                            disabled={!roleOptions.length || isSaving(user)}
                          >
                            {!roleOptions.length && (
                              <option value="">No roles available</option>
                            )}
                            {roleOptions.map((role) => (
                              <option key={role.id} value={String(role.id)}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                          <span className="text-xs text-[var(--text-muted)]">
                            Current: {formatRoleLabel(user.role_name || currentRole?.name)}
                          </span>
                          {pendingRole && pendingRole.id !== user.role_id && (
                            <span className="text-xs font-medium text-[var(--brand-purple)]">
                              Pending change → {pendingRole.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleSaveRole(user)}
                          disabled={!hasPendingChange(user) || isSaving(user)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            hasPendingChange(user)
                              ? 'bg-[var(--brand-purple)] text-white shadow-sm hover:bg-[var(--brand-purple-soft)]'
                              : 'bg-gray-100 text-gray-400'
                          } ${isSaving(user) ? 'opacity-70' : ''}`}
                        >
                          {isSaving(user) ? 'Saving…' : 'Update role'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
