import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from '../layout/Loader';
import { getCurrentUser } from '../../services/auth';
import { getCookie, getCookieJSON } from '../../utils/cookies.js';

const ALLOWED_ROLES = ['admin', 'payroll_officer'];

const normalizeRoleValue = (value) => {
  if (!value) return null;
  if (typeof value === 'object') {
    if (value.name) return normalizeRoleValue(value.name);
    if (value.role_name) return normalizeRoleValue(value.role_name);
  }
  return String(value).trim().toLowerCase();
};

const sampleOverview = {
  warnings: [
    {
      id: 'missing-bank',
      label: '1 Employee without Bank A/c',
      href: '/employees?filter=missing-bank'
    },
    {
      id: 'missing-manager',
      label: '1 Employee without Manager',
      href: '/employees?filter=missing-manager'
    }
  ],
  payRuns: [
    {
      id: '2025-10',
      label: 'Payrun for Oct 2025',
      periodLabel: 'Oct 2025',
      payDate: '2025-10-31',
      slipCount: 3,
      totals: {
        employerCost: 50000,
        gross: 50000,
        net: 43800
      },
      status: 'done'
    },
    {
      id: '2025-09',
      label: 'Payrun for Sept 2025',
      periodLabel: 'Sept 2025',
      payDate: '2025-09-30',
      slipCount: 3,
      totals: {
        employerCost: 49200,
        gross: 49200,
        net: 43100
      },
      status: 'done'
    }
  ],
  stats: {
    employerCost: {
      monthly: [
        { label: 'Jan 2025', value: 41000 },
        { label: 'Feb 2025', value: 42800 },
        { label: 'Mar 2025', value: 45250 }
      ],
      annual: [
        { label: '2023', value: 480000 },
        { label: '2024', value: 505000 },
        { label: '2025', value: 518000 }
      ]
    },
    employeeCount: {
      monthly: [
        { label: 'Jan 2025', value: 18 },
        { label: 'Feb 2025', value: 20 },
        { label: 'Mar 2025', value: 22 }
      ],
      annual: [
        { label: '2023', value: 15 },
        { label: '2024', value: 18 },
        { label: '2025', value: 22 }
      ]
    }
  }
};

const sampleRunDetail = {
  id: '2025-10',
  periodLabel: 'Oct 2025',
  payDate: '2025-10-31',
  totals: {
    employerCost: 50000,
    gross: 50000,
    net: 43800
  },
  employees: [
    {
      id: 'emp-1',
      name: 'Anita Sharma',
      employerCost: 50000,
      basic: 25000,
      gross: 50000,
      net: 43800,
      status: 'done',
      workedDays: [
        { type: 'Attendance', days: 20, note: '5 working days in week' },
        { type: 'Paid Time Off', days: 2, note: '2 Paid leaves/Month' }
      ],
      salaryComponents: [
        { name: 'Basic Salary', rate: 100, amount: 25000 },
        { name: 'House Rent Allowance', rate: 40, amount: 10000 },
        { name: 'Standard Allowance', rate: 20, amount: 5000 },
        { name: 'Performance Bonus', rate: 10, amount: 3000 },
        { name: 'Professional Tax', rate: -2, amount: -1000 }
      ]
    },
    {
      id: 'emp-2',
      name: 'Rahul Mehta',
      employerCost: 46200,
      basic: 22000,
      gross: 46200,
      net: 40100,
      status: 'done',
      workedDays: [
        { type: 'Attendance', days: 19, note: 'Includes 1 unpaid leave' },
        { type: 'Paid Time Off', days: 1, note: 'Casual leave approved' }
      ],
      salaryComponents: [
        { name: 'Basic Salary', rate: 100, amount: 22000 },
        { name: 'House Rent Allowance', rate: 40, amount: 8800 },
        { name: 'Transport Allowance', rate: 10, amount: 2200 },
        { name: 'Project Bonus', rate: 15, amount: 3300 },
        { name: 'Provident Fund', rate: -12, amount: -2640 }
      ]
    }
  ]
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '₹0';
  }
  try {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    return formatter.format(Number(value));
  } catch (err) {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (err) {
    return value;
  }
};

const StatToggle = ({ title, view, onChange, data }) => {
  const activeData = data?.[view] || [];
  const maxValue = activeData.reduce((max, item) => Math.max(max, item.value || 0), 0) || 1;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button
            type="button"
            className={`rounded-full px-3 py-1 transition ${view === 'annual' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            onClick={() => onChange('annual')}
          >
            Annually
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 transition ${view === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            onClick={() => onChange('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {activeData.map((item) => (
          <div key={item.label} className="flex flex-col">
            <div className="h-24 w-full rounded-2xl bg-indigo-50 p-2">
              <div
                className="h-full w-full rounded-xl bg-gradient-to-b from-indigo-400 to-indigo-600"
                style={{
                  transform: `scaleY(${Math.max((item.value || 0) / maxValue, 0.1)})`,
                  transformOrigin: 'bottom'
                }}
              ></div>
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
        {activeData.length === 0 && (
          <div className="col-span-3 text-center text-sm text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );
};

export default function Payroll() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [overview, setOverview] = useState(sampleOverview);
  const [selectedRun, setSelectedRun] = useState(sampleOverview.payRuns[0]);
  const [runDetail, setRunDetail] = useState(sampleRunDetail);
  const [slipDetail, setSlipDetail] = useState(sampleRunDetail.employees[0]);
  const [costView, setCostView] = useState('monthly');
  const [countView, setCountView] = useState('monthly');
  const reduxUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCurrentUser()
      .then((res) => {
        if (!mounted) return;
        setCurrentUser(res?.data || null);
      })
      .catch(() => {
        if (!mounted) return;
        setCurrentUser(null);
      })
      .finally(() => {
        if (!mounted) return;
        setUserLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const normalizedRole = useMemo(() => {
    const fromCurrent =
      normalizeRoleValue(currentUser?.role) ||
      normalizeRoleValue(currentUser?.role_name) ||
      normalizeRoleValue(currentUser?.role?.name);

    if (fromCurrent) return fromCurrent;

    const fromRedux = (
      normalizeRoleValue(reduxUser?.role) ||
      normalizeRoleValue(reduxUser?.role_name) ||
      null
    );
    if (fromRedux) return fromRedux;

    // Final fallback to cookies, aligned with Sidebar logic
    const cookieUser = getCookieJSON('userData') || getCookieJSON('userProfile');
    return (
      normalizeRoleValue(cookieUser?.role) ||
      normalizeRoleValue(cookieUser?.role_name) ||
      normalizeRoleValue(getCookie('userRole')) ||
      null
    );
  }, [currentUser, reduxUser]);

  const fetchRunDetail = useCallback(
    async (run, { suppressLoading = false } = {}) => {
      if (!run) return;
      if (!suppressLoading) setLoading(true);
      let detail = { ...sampleRunDetail, periodLabel: run.periodLabel || sampleRunDetail.periodLabel };
      try {
        const res = await axios.get(`/api/payroll/payruns/${run.id}`);
        if (res?.data) {
          detail = {
            ...detail,
            ...res.data,
            totals: res.data.totals || detail.totals,
            employees: res.data.employees || detail.employees
          };
        }
      } catch (err) {
        setError('Unable to load payrun detail. Showing sample data.');
      }
      setSelectedRun(run);
      setRunDetail(detail);
      setSlipDetail(detail.employees?.[0] || null);
      if (!suppressLoading) setLoading(false);
    },
    []
  );

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    let data = sampleOverview;
    try {
      const res = await axios.get('/api/payroll/overview');
      if (res?.data) {
        data = {
          ...data,
          ...res.data,
          stats: {
            ...data.stats,
            ...(res.data.stats || {})
          }
        };
      }
    } catch (err) {
      setError('Unable to reach payroll overview service. Showing sample data.');
    }
    setOverview(data);
    if (data?.payRuns?.length) {
      const firstRun = data.payRuns[0];
      await fetchRunDetail(firstRun, { suppressLoading: true });
    } else {
      setSelectedRun(null);
      setRunDetail(null);
      setSlipDetail(null);
    }
    setLoading(false);
  }, [fetchRunDetail]);

  useEffect(() => {
    if (!userLoaded) return;
    if (!normalizedRole || !ALLOWED_ROLES.includes(normalizedRole)) {
      setLoading(false);
      return;
    }
    loadOverview();
  }, [userLoaded, normalizedRole, loadOverview]);

  const handleSelectRun = (run) => {
    fetchRunDetail(run);
  };

  const performAction = async (actionFn, failureMessage) => {
    if (!selectedRun) return;
    setActionLoading(true);
    try {
      await actionFn();
      await loadOverview();
    } catch (err) {
      console.error(err);
      setError(failureMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerate = () => performAction(
    () => axios.post('/api/payroll/payruns', { mode: 'current' }),
    'Failed to generate payrun'
  );

  const handleValidate = () => performAction(
    () => axios.post(`/api/payroll/payruns/${selectedRun.id}/validate`),
    'Failed to validate payrun'
  );

  const handleCancel = () => performAction(
    () => axios.post(`/api/payroll/payruns/${selectedRun.id}/cancel`),
    'Failed to cancel payrun'
  );

  const handlePrint = () => {
    window.print();
  };

  const unauthorized = userLoaded && (!normalizedRole || !ALLOWED_ROLES.includes(normalizedRole));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payroll</h1>
            <p className="text-sm text-gray-500">Manage pay runs, warnings, and salary insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === 'payrun' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setActiveTab('payrun')}
            >
              Payrun
            </button>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <Loader />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {unauthorized ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Payroll is accessible only to Admins and Payroll Officers.
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'dashboard' ? (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700">Warnings</h3>
                    <div className="mt-4 space-y-3">
                      {overview?.warnings?.length ? (
                        overview.warnings.map((warning) => (
                          <a
                            key={warning.id}
                            href={warning.href || '#'}
                            className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
                          >
                            <span>{warning.label}</span>
                            <span className="text-xs text-indigo-500">Review →</span>
                          </a>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No warnings</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700">Recent Payruns</h3>
                    <div className="mt-4 space-y-3">
                      {overview?.payRuns?.length ? (
                        overview.payRuns.map((run) => (
                          <button
                            key={run.id}
                            type="button"
                            onClick={() => handleSelectRun(run)}
                            className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedRun?.id === run.id ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{run.label}</span>
                              <span className="text-xs text-gray-500">{run.slipCount} payslips</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">Net: {formatCurrency(run.totals?.net)}</div>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No payruns generated yet</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700">Snapshot</h3>
                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Latest payrun</span>
                        <span className="font-semibold text-gray-900">{selectedRun?.label || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Employer cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(selectedRun?.totals?.employerCost)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Gross wage</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(selectedRun?.totals?.gross)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Net wage</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(selectedRun?.totals?.net)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <StatToggle
                    title="Employer cost"
                    view={costView}
                    onChange={setCostView}
                    data={overview?.stats?.employerCost}
                  />
                  <StatToggle
                    title="Employee count"
                    view={countView}
                    onChange={setCountView}
                    data={overview?.stats?.employeeCount}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{runDetail?.periodLabel || 'Select a payrun'}</h2>
                        <p className="text-sm text-gray-500">Pay date: {formatDate(runDetail?.payDate)}</p>
                        <div className="mt-3 flex gap-6 text-sm text-gray-600">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Employer cost</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(runDetail?.totals?.employerCost)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Gross wage</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(runDetail?.totals?.gross)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Net wage</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(runDetail?.totals?.net)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={actionLoading}
                          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:bg-indigo-300"
                        >
                          Generate
                        </button>
                        <button
                          type="button"
                          onClick={handleValidate}
                          disabled={actionLoading || !selectedRun}
                          className="rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:border-green-200 disabled:text-green-200"
                        >
                          Validate
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={actionLoading || !selectedRun}
                          className="rounded-full border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:border-amber-200 disabled:text-amber-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-100 px-6 py-3 text-xs font-medium text-gray-500">
                      <div className="col-span-3">Pay Period</div>
                      <div className="col-span-2">Employee</div>
                      <div className="col-span-2">Employer Cost</div>
                      <div className="col-span-2">Basic Wage</div>
                      <div className="col-span-2">Net Wage</div>
                      <div className="col-span-1 text-right">Status</div>
                    </div>
                    {runDetail?.employees?.length ? (
                      runDetail.employees.map((employee) => (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => setSlipDetail(employee)}
                          className={`grid w-full grid-cols-12 gap-4 px-6 py-4 text-left text-sm transition ${slipDetail?.id === employee.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                        >
                          <div className="col-span-3 text-gray-600">[{runDetail?.periodLabel}]</div>
                          <div className="col-span-2 font-medium text-gray-900">{employee.name}</div>
                          <div className="col-span-2 text-gray-700">{formatCurrency(employee.employerCost)}</div>
                          <div className="col-span-2 text-gray-700">{formatCurrency(employee.basic)}</div>
                          <div className="col-span-2 text-gray-700">{formatCurrency(employee.net)}</div>
                          <div className="col-span-1 text-right">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${employee.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {employee.status || 'draft'}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-sm text-gray-500">No payslip records available for this payrun.</div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Payslip details</h3>
                    {slipDetail ? (
                      <div className="mt-4 space-y-5 text-sm text-gray-600">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">Employee</p>
                          <p className="text-base font-semibold text-gray-900">{slipDetail.name}</p>
                          <p className="text-xs text-indigo-500">{selectedRun?.label}</p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Worked days</h4>
                          <div className="mt-3 space-y-2">
                            {slipDetail.workedDays?.length ? (
                              slipDetail.workedDays.map((item, idx) => (
                                <div key={`${slipDetail.id}-wd-${idx}`} className="flex justify-between text-xs text-gray-600">
                                  <span>{item.type}</span>
                                  <span className="font-medium text-gray-900">{item.days} {item.note ? <span className="text-[10px] text-gray-400">({item.note})</span> : null}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400">No worked day data</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Salary computation</h4>
                          <div className="mt-3 space-y-2">
                            {slipDetail.salaryComponents?.length ? (
                              slipDetail.salaryComponents.map((row, idx) => (
                                <div key={`${slipDetail.id}-sc-${idx}`} className="flex items-center justify-between text-xs text-gray-600">
                                  <div>
                                    <p className="font-medium text-gray-800">{row.name}</p>
                                    <p className="text-[10px] text-gray-400">Rate {row.rate}%</p>
                                  </div>
                                  <span className="font-medium text-gray-900">{formatCurrency(row.amount)}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400">No computation data</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-400">Select an employee payslip to see the breakdown.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
