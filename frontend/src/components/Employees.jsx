import React from 'react'
import EmployeeCard from './Employees/EmployeeCard'

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
  const employeeList = Array.isArray(employees) && employees.length > 0 ? employees : demoEmployees

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Team directory</h1>
        <p className="text-sm text-muted">
          Keep track of everyone on the team. Filter by role, department, or attendance status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {employeeList.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </section>
  )
}

export default Employees
