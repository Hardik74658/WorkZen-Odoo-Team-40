import React, { useMemo, useState } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { getCookie, getCookieJSON } from '../../utils/cookies.js';

const SAMPLE_EMPLOYEES = [
  {
    id: 'EMP-001',
    name: 'Ava Stone',
    designation: 'Senior HR Manager',
    dateOfJoining: '2021-01-12',
    salaryEffectiveFrom: '2025-04-01',
    salary: {
      earnings: [
        { name: 'Basic', monthly: 58000 },
        { name: 'House Rent Allowance', monthly: 23200 },
        { name: 'Special Allowance', monthly: 7800 }
      ],
      deductions: [
        { name: 'Provident Fund', monthly: 7800 },
        { name: 'Professional Tax', monthly: 200 }
      ]
    }
  },
  {
    id: 'EMP-014',
    name: 'Malik Chen',
    designation: 'Payroll Specialist',
    dateOfJoining: '2022-07-03',
    salaryEffectiveFrom: '2025-03-01',
    salary: {
      earnings: [
        { name: 'Basic', monthly: 48000 },
        { name: 'HRA', monthly: 18000 },
        { name: 'Transport Allowance', monthly: 2500 }
      ],
      deductions: [
        { name: 'Provident Fund', monthly: 5760 },
        { name: 'Health Insurance', monthly: 1800 }
      ]
    }
  },
  {
    id: 'EMP-027',
    name: 'Priya Kaur',
    designation: 'People Operations Associate',
    dateOfJoining: '2023-10-19',
    salaryEffectiveFrom: '2025-02-01',
    salary: {
      earnings: [
        { name: 'Basic', monthly: 42000 },
        { name: 'HRA', monthly: 16000 },
        { name: 'Flexi Benefit', monthly: 4200 }
      ],
      deductions: [
        { name: 'Provident Fund', monthly: 5040 },
        { name: 'Professional Tax', monthly: 200 }
      ]
    }
  }
];

const generateYearOptions = (yearCount = 6) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearCount }, (_, index) => currentYear - index);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const Reports = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(SAMPLE_EMPLOYEES[0]?.id ?? '');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const companyName = useMemo(() => {
    const userData = getCookieJSON('userData');
    const userProfile = getCookieJSON('userProfile');
    return (
      userData?.companyName ||
      userData?.company ||
      userProfile?.companyName ||
      getCookie('userCompany') ||
      'Your Company'
    );
  }, []);

  const employee = useMemo(
    () => SAMPLE_EMPLOYEES.find((item) => item.id === selectedEmployeeId) || SAMPLE_EMPLOYEES[0],
    [selectedEmployeeId]
  );

  const salarySummary = useMemo(() => {
    if (!employee) {
      return {
        earnings: [],
        deductions: [],
        totalEarningsMonthly: 0,
        totalDeductionsMonthly: 0,
        netMonthly: 0,
        netAnnual: 0
      };
    }

    const earnings = employee.salary?.earnings || [];
    const deductions = employee.salary?.deductions || [];

    const totalEarningsMonthly = earnings.reduce((sum, row) => sum + (row.monthly || 0), 0);
    const totalDeductionsMonthly = deductions.reduce((sum, row) => sum + (row.monthly || 0), 0);
    const netMonthly = Math.max(totalEarningsMonthly - totalDeductionsMonthly, 0);

    return {
      earnings,
      deductions,
      totalEarningsMonthly,
      totalDeductionsMonthly,
      netMonthly,
      netAnnual: netMonthly * 12
    };
  }, [employee]);

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Generate printable salary statements for any employee and financial year.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--brand-purple)]/15 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Company</p>
            <p className="text-lg font-semibold text-gray-900">{companyName}</p>
            <p className="text-xs text-[var(--text-muted)]">Summary for {selectedYear}</p>
          </div>
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  Employee
                </span>
                <select
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-[var(--brand-purple)] focus:outline-none"
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                >
                  {SAMPLE_EMPLOYEES.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Year</span>
                <select
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-[var(--brand-purple)] focus:outline-none"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                >
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-purple)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(111,66,193,0.25)] transition hover:bg-[var(--brand-purple-soft)] hover:shadow-[0_16px_36px_rgba(111,66,193,0.32)]"
            >
              <PrinterIcon className="h-5 w-5" />
              Print Statement
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Employee overview</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{employee?.name || '—'}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Designation</p>
                  <p className="text-sm font-semibold text-gray-900">{employee?.designation || '—'}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Date of Joining</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Salary effective from</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {employee?.salaryEffectiveFrom ? new Date(employee.salaryEffectiveFrom).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Salary preview</h2>
                <span className="rounded-full border border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/10 px-4 py-1 text-xs font-medium text-[var(--brand-purple)]">
                  Fiscal year {selectedYear}
                </span>
              </div>
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 bg-white/90 p-6 shadow-inner">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">{companyName}</p>
                    <p className="text-lg font-semibold text-gray-900">Salary Statement Report</p>
                  </div>
                  <div className="text-right text-xs text-[var(--text-muted)]">
                    <p>Employee ID: {employee?.id}</p>
                    <p>Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Earnings</h3>
                    <div className="mt-3 space-y-3">
                      {salarySummary.earnings.map((row) => (
                        <div key={row.name} className="flex items-center justify-between text-sm text-gray-600">
                          <span>{row.name}</span>
                          <div className="text-right">
                            <p>{formatCurrency(row.monthly)}</p>
                            <p className="text-xs text-[var(--text-muted)]">Annually {formatCurrency(row.monthly * 12)}</p>
                          </div>
                        </div>
                      ))}
                      {!salarySummary.earnings.length && (
                        <p className="text-xs text-[var(--text-muted)]">No earnings recorded.</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-gray-900">
                      <span>Total earnings</span>
                      <div className="text-right">
                        <p>{formatCurrency(salarySummary.totalEarningsMonthly)}</p>
                        <p className="text-xs text-[var(--text-muted)]">Annually {formatCurrency(salarySummary.totalEarningsMonthly * 12)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Deductions</h3>
                    <div className="mt-3 space-y-3">
                      {salarySummary.deductions.map((row) => (
                        <div key={row.name} className="flex items-center justify-between text-sm text-gray-600">
                          <span>{row.name}</span>
                          <div className="text-right">
                            <p>{formatCurrency(row.monthly)}</p>
                            <p className="text-xs text-[var(--text-muted)]">Annually {formatCurrency(row.monthly * 12)}</p>
                          </div>
                        </div>
                      ))}
                      {!salarySummary.deductions.length && (
                        <p className="text-xs text-[var(--text-muted)]">No deductions recorded.</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-gray-900">
                      <span>Total deductions</span>
                      <div className="text-right">
                        <p>{formatCurrency(salarySummary.totalDeductionsMonthly)}</p>
                        <p className="text-xs text-[var(--text-muted)]">Annually {formatCurrency(salarySummary.totalDeductionsMonthly * 12)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[var(--brand-purple)]/10 px-4 py-3 text-sm font-semibold text-[var(--brand-purple)]">
                  <div className="flex items-center justify-between">
                    <span>Net salary</span>
                    <div className="text-right">
                      <p>{formatCurrency(salarySummary.netMonthly)}</p>
                      <p className="text-xs text-[var(--text-muted)]">Annually {formatCurrency(salarySummary.netAnnual)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">How it works</h3>
              <ol className="mt-4 space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="mt-0.5 h-6 w-6 rounded-full bg-[var(--brand-purple)]/10 text-center text-xs font-semibold leading-6 text-[var(--brand-purple)]">
                    1
                  </span>
                  Choose the employee and the financial year you want to report on.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 h-6 w-6 rounded-full bg-[var(--brand-purple)]/10 text-center text-xs font-semibold leading-6 text-[var(--brand-purple)]">
                    2
                  </span>
                  Review the auto-generated salary statement preview on the right.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 h-6 w-6 rounded-full bg-[var(--brand-purple)]/10 text-center text-xs font-semibold leading-6 text-[var(--brand-purple)]">
                    3
                  </span>
                  Print the statement or save it as PDF for payroll records.
                </li>
              </ol>
            </div>

            <div className="rounded-3xl border border-dashed border-[var(--brand-purple)]/30 bg-[var(--brand-purple)]/5 p-6 text-sm text-[var(--text-muted)]">
              <p className="font-semibold text-[var(--brand-purple)]">Access control</p>
              <p className="mt-2">
                The reports menu is limited to Admin, HR Officer, and Payroll Officer roles. Permissions are enforced via
                sidebar configuration.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Reports;
