import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export const Features = () => {
  const mainFeatures = [
    {
      name: 'Attendance & Time Tracking',
      description: 'Clock in/out, monthly summaries, and exportable reports at your fingertips.',
      icon: ClockIcon,
      accent: 'var(--accent-yellow)'
    },
    {
      name: 'Leave Management',
      description: 'Request, approve, and track leaves with automated balance calculations.',
      icon: CalendarDaysIcon,
      accent: 'var(--brand-purple)'
    },
    {
      name: 'Payroll Summary',
      description: 'Automatic payroll calculations based on attendance and approved leaves.',
      icon: CurrencyDollarIcon,
      accent: 'var(--accent-green)'
    },
    {
      name: 'Employee Directory & Profiles',
      description: 'Centralized employee records, bank details, roles, and manager hierarchy.',
      icon: IdentificationIcon,
      accent: 'var(--accent-red)'
    }
  ];

  const flowSteps = [
    {
      step: 'Step 1',
      title: 'Add company & employees',
      description: 'Import from spreadsheets or sync with your HRIS in minutes.'
    },
    {
      step: 'Step 2',
      title: 'Mark attendance & approve leaves',
      description: 'Managers get one-click approvals and teams see real-time balances.'
    },
    {
      step: 'Step 3',
      title: 'Generate payroll summary & export payslips',
      description: 'Sync with payroll tools or export compliant payslips instantly.'
    }
  ];

  const demoLinks = [
    {
      title: 'Try as Admin',
      description: 'Load demo data with approvals, payroll and team analytics enabled.',
      href: '/login?prefill=admin-demo',
      badge: 'status-badge--green'
    },
    {
      title: 'Try as Employee',
      description: 'Preview the employee portal with attendance and leave requests.',
      href: '/login?prefill=employee-demo',
      badge: 'status-badge--yellow'
    }
  ];

  const variantContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const variantItem = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <section className="bg-white py-24 sm:py-32" id="features">
      <div className="section-wrapper">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            className="text-3xl sm:text-[2.5rem] font-semibold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            WorkZen keeps every HR workflow in one secure system
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            From onboarding to payroll, WorkZen connects people operations with real-time data and intuitive approvals.
          </motion.p>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
          variants={variantContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {mainFeatures.map((feature) => (
            <motion.div
              key={feature.name}
              variants={variantItem}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-3xl border border-[var(--brand-purple)]/10 bg-white px-7 py-9 shadow-[0_20px_40px_rgba(15,23,42,0.05)]"
            >
              <span
                className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${feature.accent}14`, color: feature.accent }}
              >
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-xl font-semibold text-gray-900">{feature.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{feature.description}</p>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07]" style={{ backgroundColor: feature.accent }}></div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-[var(--brand-purple)]/15 bg-surface-muted/80 p-8 shadow-sm"
          >
            <span className="status-badge status-badge--yellow mb-5">How WorkZen Works</span>
            <h3 className="text-2xl font-semibold text-gray-900">Payroll-ready in three guided steps</h3>
            <p className="mt-4 text-muted">
              WorkZen guides HR teams with automated checklists and smart nudges so nothing falls through the cracks.
            </p>
            <div className="mt-8 space-y-6">
              {flowSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-purple)]/10 text-sm font-semibold text-[var(--brand-purple)]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{step.step}</p>
                    <h4 className="mt-1 text-lg font-medium text-gray-900">{step.title}</h4>
                    <p className="mt-1 text-sm text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex h-full flex-col justify-between gap-8 rounded-3xl border border-[var(--brand-purple)]/15 bg-white p-8 shadow-[0_18px_45px_rgba(111,66,193,0.08)]"
          >
            <div>
              <span className="status-badge status-badge--green mb-5">Security & Compliance</span>
              <h3 className="text-2xl font-semibold text-gray-900">Secure by design</h3>
              <p className="mt-4 text-muted">
                Hashed passwords, role-based access, detailed audit logs, and optional company isolation keep your team compliant from day one.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <DocumentCheckIcon className="mt-1 h-5 w-5 text-[var(--brand-purple)]" />
                  <span>GDPR-ready data retention policies with export controls.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheckIcon className="mt-1 h-5 w-5 text-[var(--brand-purple)]" />
                  <span>Encrypted in transit and at rest with automated backups.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowTrendingUpIcon className="mt-1 h-5 w-5 text-[var(--brand-purple)]" />
                  <span>Real-time health dashboards with anomaly alerts for admins.</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {demoLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="group rounded-2xl border border-[var(--brand-purple)]/20 bg-[var(--surface-muted)]/60 p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--brand-purple)]/40"
                  aria-label={`${link.title} demo login`}
                >
                  <span className={`status-badge ${link.badge}`}>{link.title}</span>
                  <p className="mt-3 text-sm text-muted group-hover:text-gray-900">{link.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-purple)]">
                    Launch demo
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

