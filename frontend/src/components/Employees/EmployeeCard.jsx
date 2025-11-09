import React, { useState } from 'react'

// Small helper to map attendance/status to colors
const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'present':
    case 'in':
      return 'bg-green-500'
    case 'on leave':
    case 'leave':
      return 'bg-yellow-400'
    case 'absent':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

export default function EmployeeCard({ employee = {}, className = '' }) {
  const [open, setOpen] = useState(false)

  const {
    id,
    name = 'Unnamed Employee',
    email = '-',
    phone = '-',
    position = '-',
    department = '-',
    avatar,
    status = '',
    joinedDate = '-',
    role = 'Employee',
  } = employee

  const primaryTitle = [position, role].find(
    (value) => value && value !== '-' && String(value).trim().length > 0,
  )

  const initials = getInitials(name)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => (e.key === 'Enter' ? setOpen(true) : null)}
        className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--brand-purple)]/15 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_68px_rgba(111,66,193,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-purple)] ${className}`}
      >
        <div className="relative h-36 w-full overflow-hidden rounded-t-2xl">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
              <div className="text-4xl font-semibold text-white/90 drop-shadow" aria-label={`Avatar for ${name}`}>
                {initials}
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full rounded-t-2xl border-b border-white/40 bg-gradient-to-b from-white/25 via-transparent to-transparent" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">{name}</h3>
          {primaryTitle && (
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--brand-purple)]/10 px-3 py-1 text-xs font-medium text-[var(--brand-purple)]">
              {primaryTitle}
            </span>
          )}
        </div>
      </div>

      {/* Modal - non-editable details view */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-start gap-4 border-b border-[var(--brand-purple)]/10 p-6">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
                  <span className="text-xl font-semibold text-white/90" aria-hidden="true">{initials}</span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {[position, department].filter((value) => value && value !== '-').join(' • ') || '—'}
                </p>
                <p className="mt-2 inline-flex items-center rounded-full bg-[var(--brand-purple)]/10 px-3 py-1 text-xs font-medium text-[var(--brand-purple)]">
                  {role || 'Employee'}
                </p>
                <p className="mt-2 text-sm text-muted">Joined {joinedDate}</p>
              </div>
              <div className="ml-2">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setOpen(false)}
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <DetailRow label="Employee ID" value={id || '-'} />
              <DetailRow label="Email" value={email} />
              <DetailRow label="Phone" value={phone} />
              <DetailRow label="Position" value={position} />
              <DetailRow label="Department" value={department} />
              <DetailRow label="Role" value={role || 'Employee'} />
              <DetailRow label="Attendance Status" value={status || 'Unknown'} tone={statusColor(status)} />
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--brand-purple)]/10 bg-surface-muted/60 p-4">
              <button
                className="btn btn-secondary text-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DetailRow({ label, value, tone }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="flex items-center gap-2 text-sm text-gray-700 break-words">
        {tone ? <span className={`inline-block h-2.5 w-2.5 rounded-full ${tone}`} aria-hidden="true" /> : null}
        <span>{value}</span>
      </div>
    </div>
  )
}

// Helpers ----------------------------------------------------
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
