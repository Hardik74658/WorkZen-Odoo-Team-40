import React, { useEffect, useState, useCallback } from 'react';
import { fetchUsers, sendUserCredentials } from '../services/user.js';
import Toast from '../components/layout/Toast.jsx';
import { useSelector } from 'react-redux';

// Simple table head cell helper
const Th = ({ children }) => (
  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 border-b border-gray-200 bg-gray-50">{children}</th>
);

/*
  Definition (frontend only for now):
  "New Users" = all existing users returned by fetchUsers() EXCEPT any with role containing 'admin'.
  We track locally which ones have had credentials sent (localStorage) so that state persists between refreshes until backend integration.
*/
const LS_KEY_SENT = 'workzen:new-users:sent-map';

const readSentMap = () => {
  if (typeof window === 'undefined') return {};
  try { const raw = localStorage.getItem(LS_KEY_SENT); if (!raw) return {}; return JSON.parse(raw) || {}; } catch { return {}; }
};
const writeSentMap = (map) => { if (typeof window === 'undefined') return; try { localStorage.setItem(LS_KEY_SENT, JSON.stringify(map)); } catch {} };

const NewUsers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({}); // eid => bool
  const [toast, setToast] = useState({ show: false, message: '' });
  const authUser = useSelector((s) => s.auth.user);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      const list = Array.isArray(res.data) ? res.data : [];
      const filtered = list.filter((u) => {
        const roleName = (u.role_name || u.role || '').toString().toLowerCase();
        return !roleName.includes('admin');
      });
      const sentMap = readSentMap();
      const normalized = filtered.map((u) => ({
        eid: u.eid || u.id || u._id,
        name: u.name || u.full_name || u.fullName || '-',
        email: u.company_email || u.personal_email || u.email || '-',
        login_id: u.eid || u.employee_code || u.username || u.email || '-',
        temp_password: '********',
        credentialsSent: Boolean(sentMap[u.eid || u.id || u._id])
      }));
      setRows(normalized);
    } catch (e) {
      console.error('Failed to fetch real users', e);
      setRows([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (eid) => {
    setSending((p) => ({ ...p, [eid]: true }));
    try {
      // Simulate network send; we just reuse mock sendUserCredentials for delay
      await sendUserCredentials(eid);
      const map = readSentMap();
      map[eid] = { sentAt: new Date().toISOString(), by: authUser?.id || authUser?.eid || 'current-user' };
      writeSentMap(map);
      setToast({ show: true, message: `Credentials mailed for ${eid}` });
      await load();
    } catch (e) {
      console.error('Failed to send credentials', e);
      setToast({ show: true, message: `Failed sending for ${eid}` });
    } finally {
      setSending((p) => ({ ...p, [eid]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">New Users</h1>
        <p className="text-sm text-gray-600">All current users except Admin accounts. Send their initial login credentials.</p>
      </header>

      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-700 flex items-start gap-3">
        <span className="font-semibold">Note:</span>
        <span>User should receive a mail of their login id and password.</span>
      </div>

      {loading ? <div className="text-sm text-gray-500">Loading users…</div> : null}

      <div className="overflow-x-auto rounded-lg shadow bg-white border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <Th>Email</Th>
              <Th>Login ID</Th>
              <Th>Password</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">No eligible users found.</td>
              </tr>
            ) : null}
            {rows.map((u) => {
              const disabled = u.credentialsSent || sending[u.eid];
              return (
                <tr key={u.eid} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{u.email}</span>
                      <span className="text-xs text-gray-500">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-700">{u.login_id}</td>
                  <td className="px-4 py-3 border-b border-gray-100 font-mono text-xs text-gray-500">{u.temp_password}</td>
                  <td className="px-4 py-3 border-b border-gray-100">
                    <button
                      onClick={() => handleSend(u.eid)}
                      disabled={disabled}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold border transition ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'}`}
                    >
                      {u.credentialsSent ? 'Sent' : sending[u.eid] ? 'Sending…' : 'Send Mail'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500">Current user login id will be auto-populated once backend sends actual values.</div>

      {/* Toast feedback */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Toast
          message={toast.message}
          show={toast.show}
          onUndo={null}
          onClose={() => setToast({ show: false, message: '' })}
        />
      </div>
    </div>
  );
};

export default NewUsers;
