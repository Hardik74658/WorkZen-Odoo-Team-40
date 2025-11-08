import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../../services/auth';
import Loader from '../layout/Loader';

function formatDateIso(d) {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
}

export default function TimeOff() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [records, setRecords] = useState([]);
  // Defaults: 24 paid days and 7 sick days (editable by admin)
  const [balances, setBalances] = useState({ paid: 24, sick: 7 });
  const [globalDefaults, setGlobalDefaults] = useState({ paid: 24, sick: 7 });
  const [defaultsModalOpen, setDefaultsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ type: 'paid', startDate: '', endDate: '', note: '' });
  const [allocModal, setAllocModal] = useState({ open: false, userId: null, paid: 0, sick: 0 });

  const role = (currentUser && (currentUser.role || currentUser.role?.name || currentUser.role_name)) ? String((currentUser.role && currentUser.role.name) || currentUser.role || currentUser.role_name).toLowerCase() : null;

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((res) => {
        if (!mounted) return;
        if (res && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch((e) => console.warn('Could not fetch current user', e))
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!role) return;
    loadData();
  }, [role]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch global defaults if available (admins can edit these)
      try {
        const defRes = await axios.get('/api/timeoff/defaults');
        if (defRes && defRes.data) setGlobalDefaults(defRes.data);
      } catch (e) {
        // ignore if endpoint not available; keep local defaults
      }
      // ensure balances at least pick up global defaults when no API returned specific balance
      if (role === 'admin' || role === 'hr_officer') {
        const [reqRes, recRes] = await Promise.all([
          axios.get('/api/timeoff/requests?status=pending'),
          axios.get('/api/timeoff/records')
        ]);
        setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
        setRecords(Array.isArray(recRes.data) ? recRes.data : []);
      } else {
        // employee
        const [balRes, recRes] = await Promise.all([
          axios.get('/api/timeoff/balance'),
          axios.get('/api/timeoff/my-records')
        ]);
        setBalances(balRes.data || globalDefaults || { paid: 24, sick: 7 });
        setRecords(Array.isArray(recRes.data) ? recRes.data : []);
      }
    } catch (err) {
      console.error('Error loading timeoff data', err);
      setError('Failed to load timeoff data');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await axios.post(`/api/timeoff/requests/${id}/approve`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Approve failed', err);
      setError('Approve action failed');
    }
  };

  const reject = async (id) => {
    try {
      await axios.post(`/api/timeoff/requests/${id}/reject`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Reject failed', err);
      setError('Reject action failed');
    }
  };

  const submitNewRequest = async () => {
    try {
      const payload = { ...newRequest };
      await axios.post('/api/timeoff/requests', payload);
      setShowNewModal(false);
      setNewRequest({ type: 'paid', startDate: '', endDate: '', note: '' });
      loadData();
    } catch (err) {
      console.error('Create request failed', err);
      setError('Create request failed');
    }
  };

  const openAlloc = (userId) => {
    setAllocModal({ open: true, userId, paid: 0, sick: 0 });
  };

  const submitAlloc = async () => {
    try {
      const { userId, paid, sick } = allocModal;
      await axios.post(`/api/timeoff/allocate`, { userId, paid: Number(paid), sick: Number(sick) });
      setAllocModal({ open: false, userId: null, paid: 0, sick: 0 });
      loadData();
    } catch (err) {
      console.error('Allocation failed', err);
      setError('Allocation failed');
    }
  };

  const submitDefaults = async () => {
    try {
      // try to persist to backend; if endpoint missing it's non-fatal
      await axios.post('/api/timeoff/defaults', globalDefaults).catch(() => null);
      setDefaultsModalOpen(false);
      // If current user is employee and balances equal previous defaults, refresh to reflect new defaults
      loadData();
    } catch (err) {
      console.error('Save defaults failed', err);
      setError('Saving defaults failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Time Off</h1>
          <div className="flex items-center gap-3">
            {(role === 'admin' || role === 'hr_officer') && (
              <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-full">New</button>
            )}
            {role === 'employee' && (
              <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-full">Request Time Off</button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          {loading ? (
            <div className="py-8"><Loader /></div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <h3 className="text-sm font-medium text-gray-600">Balances</h3>
                <div className="mt-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b"><span>Paid time off</span><strong>{balances.paid ?? 0} days</strong></div>
                  <div className="flex items-center justify-between py-2 border-b"><span>Sick time off</span><strong>{balances.sick ?? 0} days</strong></div>
                  {(role === 'admin' || role === 'hr_officer') && (
                    <div className="mt-3">
                      <button onClick={() => setDefaultsModalOpen(true)} className="px-3 py-1 bg-gray-100 rounded text-sm">Edit defaults</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-8">
                <h3 className="text-sm font-medium text-gray-600">Your recent requests / admin overview</h3>
                <div className="mt-3">
                  <div className="bg-white rounded-lg border">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b text-xs text-gray-500">
                      <div className="col-span-4">Employee</div>
                      <div className="col-span-2">Start</div>
                      <div className="col-span-2">End</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Status</div>
                    </div>

                    {
                      (role === 'admin' || role === 'hr_officer') ? (
                        requests.length > 0 ? (
                          requests.map((r) => (
                            <div key={r._id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b">
                              <div className="col-span-4">{r.user?.fullName || r.user?.name || 'Unknown'}</div>
                              <div className="col-span-2">{formatDateIso(r.startDate)}</div>
                              <div className="col-span-2">{formatDateIso(r.endDate)}</div>
                              <div className="col-span-2">{r.type}</div>
                              <div className="col-span-2 flex items-center gap-2">
                                <button onClick={() => approve(r._id)} className="px-3 py-1 bg-green-500 text-white rounded">Approve</button>
                                <button onClick={() => reject(r._id)} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                                <button onClick={() => openAlloc(r.user?._id)} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded">Allocate</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-gray-500">No pending requests</div>
                        )
                      ) : (
                        records.length > 0 ? (
                          records.map((r, i) => (
                            <div key={r._id || i} className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b">
                              <div className="col-span-4">{r.user?.fullName || r.user?.name || 'You'}</div>
                              <div className="col-span-2">{formatDateIso(r.startDate)}</div>
                              <div className="col-span-2">{formatDateIso(r.endDate)}</div>
                              <div className="col-span-2">{r.type}</div>
                              <div className="col-span-2">{r.status}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-gray-500">No records found</div>
                        )
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-6 text-sm text-gray-600">Full timeoff records</div>
          { records.length > 0 ? records.map((r, idx) => (
            <div key={r._id || idx} className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-gray-100">
              <div className="col-span-3">{r.user?.fullName || r.user?.name || 'You'}</div>
              <div className="col-span-3">{formatDateIso(r.startDate)} - {formatDateIso(r.endDate)}</div>
              <div className="col-span-3">{r.type}</div>
              <div className="col-span-3">{r.status}</div>
            </div>
          )) : (
            <div className="px-6 py-8 text-gray-500">No records found</div>
          ) }
        </div>
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">New Time Off Request</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Type</label>
                <select className="w-full border px-3 py-2 rounded" value={newRequest.type} onChange={(e) => setNewRequest((s) => ({ ...s, type: e.target.value }))}>
                  <option value="paid">Paid time off</option>
                  <option value="sick">Sick time off</option>
                  <option value="unpaid">Unpaid leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">Start</label>
                  <input type="date" className="w-full border px-3 py-2 rounded" value={newRequest.startDate} onChange={(e) => setNewRequest((s) => ({ ...s, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">End</label>
                  <input type="date" className="w-full border px-3 py-2 rounded" value={newRequest.endDate} onChange={(e) => setNewRequest((s) => ({ ...s, endDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Note</label>
                <textarea className="w-full border px-3 py-2 rounded" rows="3" value={newRequest.note} onChange={(e) => setNewRequest((s) => ({ ...s, note: e.target.value }))}></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowNewModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={submitNewRequest} className="px-4 py-2 bg-indigo-600 text-white rounded">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      {allocModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Allocate Time Off</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Paid days</label>
                <input type="number" className="w-full border px-3 py-2 rounded" value={allocModal.paid} onChange={(e) => setAllocModal((s) => ({ ...s, paid: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Sick days</label>
                <input type="number" className="w-full border px-3 py-2 rounded" value={allocModal.sick} onChange={(e) => setAllocModal((s) => ({ ...s, sick: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAllocModal({ open: false, userId: null, paid: 0, sick: 0 })} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={submitAlloc} className="px-4 py-2 bg-indigo-600 text-white rounded">Allocate</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Defaults Modal */}
      {defaultsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Default Time Off Balances</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Paid days (default)</label>
                <input type="number" className="w-full border px-3 py-2 rounded" value={globalDefaults.paid} onChange={(e) => setGlobalDefaults((s) => ({ ...s, paid: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Sick days (default)</label>
                <input type="number" className="w-full border px-3 py-2 rounded" value={globalDefaults.sick} onChange={(e) => setGlobalDefaults((s) => ({ ...s, sick: Number(e.target.value) }))} />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDefaultsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={submitDefaults} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
