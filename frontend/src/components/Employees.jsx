import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EmployeeCard from './Employees/EmployeeCard'
import { fetchUsers } from '../services/user.js'

const demoEmployees = [
  {
    id: 'EMP-001',
    name: 'Ava Stone',
    email: 'ava.stone@workzen.com',
    phone: '+1 (555) 293-1023',
    position: 'Senior HR Manager',
    department: 'People Operations',
    status: 'Present',
    joinedDate: 'Jan 12, 2021',
    role: 'HR Admin',
    avatar: 'https://images.unsplash.com/photo-1573497490790-4592b7373172?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EMP-014',
    name: 'Malik Chen',
    email: 'malik.chen@workzen.com',
    phone: '+1 (555) 845-7722',
    position: 'Payroll Specialist',
    department: 'Finance',
    status: 'On Leave',
    joinedDate: 'Jul 03, 2022',
    role: 'Payroll',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EMP-027',
    name: 'Priya Kaur',
    email: 'priya.kaur@workzen.com',
    phone: '+1 (555) 220-4411',
    position: 'People Operations Associate',
    department: 'People Operations',
    status: 'In',
    joinedDate: 'Oct 19, 2023',
    role: 'Employee Experience',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80',
  },
]

export const Employees = ({ employees }) => {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetched, setFetched] = useState([])

  // Fetch fresh employees whenever this page is (re)entered
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetchUsers()
        if (cancelled) return
        const users = Array.isArray(res?.data) ? res.data : []
        // Map backend users to EmployeeCard shape
        const mapped = users.map((u) => ({
          id: u?.eid,
          name: u?.name,
          email: u?.company_email || u?.personal_email,
          phone: '-',
          position: u?.position || '-',
          department: u?.department || '-',
          avatar: u?.avatar || '', // backend doesn't provide yet; keep for future
          status: u?.status || '',
          joinedDate: u?.date_of_joining ? new Date(u.date_of_joining).toLocaleDateString() : '-',
          role: u?.role_name || 'Employee',
        }))
        setFetched(mapped)
      } catch (err) {
        console.error('Failed to fetch users:', err)
        setError('Could not refresh employees right now.')
        setFetched([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [location.key])

  const propEmployees = Array.isArray(employees) ? employees : []
  const employeeList = useMemo(() => {
    // Combine fetched + any provided prop employees + keep demo employees
    // Prefer fetched first, then provided, then demos
    const combined = [...fetched, ...propEmployees]
    // Always keep demos as well
    combined.push(...demoEmployees)
    // Deduplicate by id if present
    const seen = new Set()
    return combined.filter((e) => {
      const key = e?.id || `${e?.name}-${e?.email}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [fetched, propEmployees])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Team directory</h1>
        <p className="text-sm text-muted">
          Keep track of everyone on the team. Filter by role, department, or attendance status.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted">Refreshing employees…</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {employeeList.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </section>
  )
}

export default Employees
