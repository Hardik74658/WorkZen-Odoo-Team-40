import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
// Actions are handled only in Navbar; page no longer triggers check-in/out
import { getCurrentUser } from '../../services/auth';
import { getCookie, getCookieJSON } from '../../utils/cookies.js';
import { buildUrl, authHeaders } from '../../services/attendance.js';
import Loader from '../layout/Loader';

function formatTime(t) {
  if (!t) return '-';
  // Handle pure HH:MM or HH:MM:SS coming from backend without constructing Date (avoids Invalid Date)
  if (typeof t === 'string') {
    const m = t.match(/^([0-1]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (m) {
      // Display in 24h HH:MM
      return `${m[1]}:${m[2]}`;
    }
  }
  // Handle ISO datetime strings
  const d = new Date(t);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return String(t);
}

function toDateInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [error, setError] = useState(null);

  const role = useMemo(() => {
    if (!currentUser) return null;
    const r = currentUser.role || currentUser.role_name || currentUser.role?.name;
    if (!r) return null;
    return String(r).toLowerCase();
  }, [currentUser]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eid = getCookie('userId') || getCookie('eid') || getCookieJSON('userData')?.eid;
      const companyId = getCookie('userCompanyId') || getCookie('company_id') || getCookie('companyId') || getCookieJSON('userData')?.company_id;

      if (!eid) throw new Error('Missing eid for attendance fetch');

      // Admin-like roles: fetch all attendance for company using backend endpoint /attendance/{company_id}
      if (role === 'admin' || role === 'hr_officer' || role === 'payroll_officer') {
        if (!companyId) throw new Error('Missing companyId for company attendance');
        const url = buildUrl(`/attendance/${companyId}`); // FastAPI route
        const res = await axios.get(url, { headers: { ...authHeaders(), 'Cache-Control': 'no-cache' } });
        // Show full list (all records for the company), newest first
        const rows = Array.isArray(res.data) ? res.data : [];
        rows.sort((a, b) => {
          const byDate = String(b.date || '').localeCompare(String(a.date || ''));
          if (byDate !== 0) return byDate;
          // If same day, sort by check_in desc HH:MM:SS lexicographically
          return String(b.check_in || '').localeCompare(String(a.check_in || ''));
        });
        setAttendanceRows(rows);
      } else {
        // Employee role: use /attendance/eid/{eid}
        const url = buildUrl(`/attendance/eid/${eid}`);
        const res = await axios.get(url, { headers: { ...authHeaders(), 'Cache-Control': 'no-cache' } });
        const rows = Array.isArray(res.data) ? res.data : [];
        rows.sort((a, b) => {
          const byDate = String(b.date || '').localeCompare(String(a.date || ''));
          if (byDate !== 0) return byDate;
          return String(b.check_in || '').localeCompare(String(a.check_in || ''));
        });
        setAttendanceRows(rows);
      }
    } catch (err) {
      console.error('Error fetching attendance', err);
      setError('Unable to load attendance.');
      setAttendanceRows([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Initial user fetch
  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((res) => {
        if (!mounted) return;
        if (res && res.data) setCurrentUser(res.data);
      })
      .catch((e) => {
        console.warn('Could not fetch current user for attendance', e);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // When currentUser resolves (first mount or after a re-login) ensure fresh attendance.
  useEffect(() => {
    if (currentUser) {
      fetchAttendance();
    }
  }, [currentUser, fetchAttendance]);

  useEffect(() => {
    // refetch when role or date/month changes (after currentUser loaded)
    if (!role) return;
    fetchAttendance();
  }, [role, selectedDate, selectedMonth, fetchAttendance]);

  

  const prevDay = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const nextDay = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const prevMonth = () => setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Status panel (read-only on this page)
  const [actionLoading] = useState(false);
  const [panelStatus, setPanelStatus] = useState({ state: 'out', checkInTime: null });

  const refreshPanelStatus = useCallback(async () => {
    try {
      const eid = getCookie('userId') || getCookie('eid') || getCookieJSON('userData')?.eid;
      if (!eid) return;
      const res = await axios.get(buildUrl(`/attendance/eid/${eid}`), { headers: authHeaders() });
      const today = new Date().toISOString().slice(0,10);
      const records = Array.isArray(res.data) ? res.data : [];
      const todayRecord = records.find(r => String(r.date).startsWith(today));
      if (todayRecord?.check_in && !todayRecord?.check_out) {
        setPanelStatus({ state: 'in', checkInTime: todayRecord.date + 'T' + todayRecord.check_in });
      } else if (todayRecord?.check_out) {
        setPanelStatus({ state: 'completed', checkInTime: null, workedHours: todayRecord.worked_hours });
      } else {
        setPanelStatus({ state: 'out', checkInTime: null });
      }
    } catch {/* ignore */}
  }, []);

  useEffect(() => { refreshPanelStatus(); }, [refreshPanelStatus]);

  // Refetch when page regains focus or becomes visible (now placed after refreshPanelStatus definition)
  useEffect(() => {
    const refetchOnFocus = () => {
      fetchAttendance();
      refreshPanelStatus();
    };
    window.addEventListener('focus', refetchOnFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refetchOnFocus();
    });
    return () => {
      window.removeEventListener('focus', refetchOnFocus);
      document.removeEventListener('visibilitychange', refetchOnFocus);
    };
  }, [fetchAttendance, refreshPanelStatus]);

  // Keep this page in sync when Navbar performs actions
  useEffect(() => {
    const handler = () => {
      refreshPanelStatus();
      fetchAttendance();
    };
    window.addEventListener('attendance:refresh', handler);
    return () => window.removeEventListener('attendance:refresh', handler);
  }, [refreshPanelStatus, fetchAttendance]);

  const doCheckIn = async () => {
    setActionLoading(true);
    try {
      const { data } = await attendanceCheckIn();
      setPanelStatus({ state: 'in', checkInTime: data.date + 'T' + data.check_in_time });
      await refreshPanelStatus();
      await fetchAttendance();
      // Notify Navbar to refresh its own status
      window.dispatchEvent(new Event('attendance:refresh'));
    } catch (e) { console.error('Check-in failed', e); }
    finally { setActionLoading(false); }
  };

  const doCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceCheckOut();
      await refreshPanelStatus();
      await fetchAttendance();
      window.dispatchEvent(new Event('attendance:refresh'));
    } catch (e) { console.error('Check-out failed', e); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">{currentUser ? <span>Signed in as <strong>{currentUser.fullName || currentUser.name || currentUser.email}</strong></span> : ' '}</div>
            <button
              type="button"
              onClick={() => { fetchAttendance(); refreshPanelStatus(); }}
              className="rounded-full border border-indigo-300 bg-white px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
          <span className={`h-3 w-3 rounded-full ${panelStatus.state === 'in' ? 'bg-green-500' : panelStatus.state === 'completed' ? 'bg-gray-500' : 'bg-red-400'}`}></span>
          <div className="flex flex-col mr-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">My status</span>
            <span className="text-sm font-medium text-gray-900">{panelStatus.state === 'completed' ? 'Completed' : panelStatus.state === 'in' ? 'Checked in' : 'Not checked in'}</span>
            {panelStatus.state === 'in' && panelStatus.checkInTime && <span className="text-xs text-gray-500">Since {formatTime(panelStatus.checkInTime)}</span>}
            {panelStatus.state === 'completed' && panelStatus.workedHours != null && <span className="text-xs text-gray-500">Worked {panelStatus.workedHours}h</span>}
          </div>
          {/* No action button here; Navbar is the only place for check-in/out */}
          {panelStatus.state === 'completed' && (
            <span className="text-sm font-medium text-gray-600">Completed • {panelStatus.workedHours ?? '0'}h</span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={prevDay} className="px-3 py-2 bg-white border rounded-md">&lt;</button>
              <input type="date" value={toDateInputValue(selectedDate)} onChange={(e) => setSelectedDate(new Date(e.target.value))} className="px-3 py-2 border rounded-md" />
              <button onClick={nextDay} className="px-3 py-2 bg-white border rounded-md">&gt;</button>
              <div className="ml-4 text-sm text-gray-500">Day view</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="px-3 py-2 bg-white border rounded-md">&lt;</button>
              <div className="px-3 py-2 border rounded-md bg-white">
                <select value={`${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}`} onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedMonth(new Date(y, m - 1, 1));
                }} className="bg-transparent">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const d = new Date(selectedMonth.getFullYear(), i, 1);
                    return (
                      <option key={i} value={`${d.getFullYear()}-${d.getMonth() + 1}`}>
                        {d.toLocaleString(undefined, { month: 'long' })} {d.getFullYear()}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button onClick={nextMonth} className="px-3 py-2 bg-white border rounded-md">&gt;</button>
              <div className="ml-4 text-sm text-gray-500">Month view (for employees)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100">
            <div className="col-span-2 text-xs font-medium text-gray-500">Date</div>
            <div className="col-span-3 text-xs font-medium text-gray-500">Employee (EID)</div>
            <div className="col-span-2 text-xs font-medium text-gray-500">Check In</div>
            <div className="col-span-2 text-xs font-medium text-gray-500">Check Out</div>
            <div className="col-span-2 text-xs font-medium text-gray-500">Work Hours</div>
            <div className="col-span-1 text-xs font-medium text-gray-500">Extra</div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center"><Loader /></div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-600">{error}</div>
          ) : attendanceRows && attendanceRows.length > 0 ? (
            attendanceRows.map((row, idx) => (
              <div key={row.attendance_id || idx} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 items-center">
                <div className="col-span-2 text-sm text-gray-700">{row.date}</div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">{(row.eid || 'U').toString().charAt(0)}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{row.eid}</div>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-gray-700">{formatTime(row.check_in)}</div>
                <div className="col-span-2 text-sm text-gray-700">{formatTime(row.check_out)}</div>
                <div className="col-span-2 text-sm text-gray-700">{row.worked_hours ?? '-'}</div>
                <div className="col-span-1 text-sm text-gray-700">{row.worked_hours && row.worked_hours > 8 ? (Math.round((row.worked_hours - 8) * 100) / 100) : '-'}</div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-gray-500">
              <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="text-base">No attendance records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
