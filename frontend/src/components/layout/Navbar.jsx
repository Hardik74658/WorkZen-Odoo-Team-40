import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../redux/slices/authSlice';
import { deleteCookie, getCookieJSON } from '../../utils/cookies.js';

const formatTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

const Navbar = ({
  currentPageTitle = 'Overview',
  attendanceStatus,
  onCheckIn,
  onCheckOut,
  onLogout
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user) || getCookieJSON('userProfile');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const avatarUrl = useMemo(() => {
    return (
      user?.profilePicture ||
      'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=880&q=80'
    );
  }, [user]);

  const userName = user?.name || user?.fullName || 'Team Member';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCheckedIn = attendanceStatus?.state === 'in';
  const isCompleted = attendanceStatus?.state === 'completed';
  const checkInTime = attendanceStatus?.checkInTime
    ? new Date(attendanceStatus.checkInTime)
    : null;
  const statusColor = isCheckedIn
    ? 'bg-[var(--accent-green)]'
    : 'bg-[var(--accent-red)]';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    ['authToken', 'userId', 'userName', 'userRole', 'userRoleId', 'userCompany', 'userCompanyId', 'userProfile', 'userData'].forEach((key) => deleteCookie(key));
    dispatch(logout());
  };

  const handleCheckIn = onCheckIn || (() => {});
  const handleCheckOut = onCheckOut || (() => {});

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--brand-purple)]/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Active module</span>
            <h1 className="text-xl font-semibold text-gray-900">{currentPageTitle}</h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-4 rounded-3xl border border-[var(--brand-purple)]/15 bg-white/90 px-5 py-3 shadow-[0_18px_40px_rgba(111,66,193,0.12)]">
            <span className={`h-3 w-3 rounded-full transition ${statusColor}`}></span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Attendance</span>
              <span className="text-sm font-semibold text-gray-900">
                {isCompleted ? 'Completed' : isCheckedIn ? 'Checked in' : 'Not checked in'}
              </span>
              {isCheckedIn && checkInTime && (
                <span className="text-xs text-[var(--text-muted)]">Since {formatTime(checkInTime)}</span>
              )}
              {isCompleted && attendanceStatus.workedHours != null && (
                <span className="text-xs text-[var(--text-muted)]">Worked {attendanceStatus.workedHours}h</span>
              )}
            </div>
            {!isCompleted && (
              <button
                type="button"
                onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30 ${
                  isCheckedIn
                    ? 'bg-white text-[var(--accent-red)] border border-[var(--accent-red)]/40 hover:bg-[var(--accent-red)]/10'
                    : 'bg-[var(--brand-purple)] text-white shadow-[0_12px_25px_rgba(111,66,193,0.2)] hover:bg-[var(--brand-purple-soft)]'
                }`}
              >
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </button>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-3" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-3xl border border-[var(--brand-purple)]/15 bg-white/90 px-2 py-1.5 shadow-sm transition hover:border-[var(--brand-purple)]/30 hover:bg-white"
            aria-label="User menu"
          >
            <div className="h-10 w-10 overflow-hidden rounded-2xl border border-[var(--brand-purple)]/20 bg-[var(--brand-purple)]/10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${userName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--brand-purple)]">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="hidden text-left sm:flex sm:flex-col">
              <span className="text-sm font-semibold text-gray-900">{userName}</span>
              <span className="text-xs text-[var(--text-muted)]">My profile</span>
            </div>
            <ChevronDownIcon className={`h-4 w-4 text-[var(--text-muted)] transition ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-14 w-48 rounded-2xl border border-[var(--brand-purple)]/15 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-[var(--surface)]"
              >
                <UserCircleIcon className="h-5 w-5 text-[var(--brand-purple)]" />
                My Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-[var(--accent-red)] transition hover:bg-[var(--accent-red-soft)]"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;