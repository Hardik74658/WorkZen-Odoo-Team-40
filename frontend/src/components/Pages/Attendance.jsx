import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../../services/auth';
import Loader from '../layout/Loader';

function formatTime(t) {
  if (!t) return '-';
  try {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return t;
  }
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
      // If admin/hr/payroll - fetch list-view for the day
      if (role === 'admin' || role === 'hr_officer' || role === 'payroll_officer') {
        const dateStr = toDateInputValue(selectedDate);
        const res = await axios.get(`/api/attendance/day?date=${dateStr}`);
        // Expected: [{ user: { _id, fullName, profilePicture }, checkIn, checkOut, workHours, extraHours }]
        setAttendanceRows(Array.isArray(res.data) ? res.data : []);
      } else {
        // Employee: show month-wise own attendance
        const month = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
        const res = await axios.get(`/api/attendance/month?month=${month}`);
        // Expected: [{ date, checkIn, checkOut, workHours, extraHours }]
        setAttendanceRows(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Error fetching attendance', err);
      setError('Unable to load attendance.');
      setAttendanceRows([]);
    } finally {
      setLoading(false);
    }
  }, [role, selectedDate, selectedMonth]);

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

  useEffect(() => {
    // refetch when role or date/month changes (after currentUser loaded)
    if (!role) return;
    fetchAttendance();
  }, [role, selectedDate, selectedMonth, fetchAttendance]);

  const prevDay = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const nextDay = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const prevMonth = () => setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
          <div className="text-sm text-gray-600">{currentUser ? <span>Signed in as <strong>{currentUser.fullName || currentUser.name || currentUser.email}</strong></span> : ' '}</div>
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
            <div className="col-span-3 text-xs font-medium text-gray-500">Employee</div>
            <div className="col-span-2 text-xs font-medium text-gray-500">Check In</div>
            <div className="col-span-2 text-xs font-medium text-gray-500">Check Out</div>
            <div className="col-span-3 text-xs font-medium text-gray-500">Work Hours</div>
            <div className="col-span-2 text-xs font-medium text-gray-500">Extra hours</div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center"><Loader /></div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-600">{error}</div>
          ) : attendanceRows && attendanceRows.length > 0 ? (
            attendanceRows.map((row, idx) => (
              <div key={row._id || idx} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  {row.user?.profilePicture ? (
                    <img src={row.user.profilePicture} alt={row.user.fullName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">{(row.user?.fullName || row.user?.name || 'U').charAt(0)}</div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{row.user?.fullName || row.user?.name || row.user?.email || (row.date || '-')}</div>
                    <div className="text-xs text-gray-500">{row.user?.role?.name || row.user?.role || ''}</div>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-gray-700">{formatTime(row.checkIn)}</div>
                <div className="col-span-2 text-sm text-gray-700">{formatTime(row.checkOut)}</div>
                <div className="col-span-3 text-sm text-gray-700">{row.workHours || row.totalHours || '-'}</div>
                <div className="col-span-2 text-sm text-gray-700">{row.extraHours || '-'}</div>
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
