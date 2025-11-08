import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, ChartBarIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function TrustedPartners() {
  const stats = [
    {
      label: 'Companies automated HR with WorkZen',
      value: '2,500+',
      icon: UserGroupIcon,
      accent: 'var(--brand-purple)'
    },
    {
      label: 'Hours saved weekly by HR teams',
      value: '12 hrs',
      icon: ChartBarIcon,
      accent: 'var(--accent-green)'
    },
    {
      label: 'Platform uptime backed by SLAs',
      value: '99.95%',
      icon: ShieldCheckIcon,
      accent: 'var(--accent-yellow)'
    },
    {
      label: 'Average employee satisfaction score',
      value: '4.8/5',
      icon: SparklesIcon,
      accent: 'var(--accent-red)'
    }
  ];

  const variantContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const variantItem = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className='display-block'>
    <section className="bg-surface-muted/60 py-24 sm:py-32">
      <div className="section-wrapper">
        <div className="text-center">
          <motion.h2
            className="text-3xl sm:text-[2.5rem] font-semibold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Trusted by modern HR and finance teams worldwide
          </motion.h2>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg text-muted"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            WorkZen powers people operations for fast-growing startups and global enterprises—without the spreadsheets.
          </motion.p>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
          variants={variantContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {stats.map((item) => (
            <motion.div
              key={item.label}
              variants={variantItem}
              whileHover={{ translateY: -6 }}
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${item.accent}14`, color: item.accent }}
              >
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-sm uppercase tracking-wide text-muted">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{item.value}</p>
              <div
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07]"
                style={{ backgroundColor: item.accent }}
              ></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={variantContainer}
        >
          <motion.div
            variants={variantItem}
            className="rounded-3xl border border-[var(--brand-purple)]/20 bg-white p-8 text-left shadow-[0_30px_60px_rgba(111,66,193,0.12)]"
          >
            <p className="text-lg text-gray-900">“WorkZen made it effortless to unify our attendance, leaves, and payroll. We closed each payroll run 4x faster and improved compliance visibility across all regions.”</p>
            <div className="mt-6 flex flex-col gap-1">
              <span className="font-semibold text-gray-900">Priya Sharma</span>
              <span className="text-sm text-muted">Director of People Ops, Northwind Logistics</span>
            </div>
          </motion.div>

          <motion.div
            variants={variantItem}
            className="rounded-3xl border border-[var(--brand-purple)]/20 bg-[var(--brand-purple)]/10 p-8 text-center"
            id="demo"
          >
            <p className="text-lg font-semibold text-gray-900">Ready to streamline HR?</p>
            <p className="mt-3 text-sm text-muted">Start your free trial or request a guided demo with our product specialists.</p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="/signup" className="btn btn-primary text-sm" aria-label="Start WorkZen free trial from trusted section">Start free trial</a>
              <a href="#demo" className="btn btn-secondary text-sm" aria-label="Request a WorkZen demo from trusted section">Request a demo</a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
    </div>
  );
}