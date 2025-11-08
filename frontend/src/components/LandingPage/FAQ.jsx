import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const faqs = [
    {
      question: 'Can WorkZen replace my current attendance and leave trackers?',
      answer: 'Yes. WorkZen unifies attendance, leave balances, and approvals into a single source of truth. Import historic data via CSV or API and let teams mark attendance from the web or kiosk. Managers approve requests in one click with real-time visibility.'
    },
    {
      question: 'How fast can we go live with payroll summaries?',
      answer: 'Most teams finish onboarding within seven days. WorkZen maps your pay cycles, automates statutory deductions, and exports payroll-ready summaries. You can push data to your payroll software or download compliant payslips instantly.'
    },
    {
      question: 'Does WorkZen support role-based access and multi-company setups?',
      answer: 'Absolutely. Assign granular permissions (HR, finance, managers, employees) and isolate companies or business units behind secure partitions. Audit logs track every change and can be exported for compliance reviews.'
    },
    {
      question: 'How do demo logins work for admins and employees?',
      answer: 'Use the “Try as Admin” or “Try as Employee” quick links above to auto-fill sandbox credentials on the login page. You’ll experience dashboards and workflows exactly like a live account, with demo data you can reset anytime.'
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently asked about WorkZen
          </h2>
          <div className="h-1 w-20 bg-[var(--brand-purple)] mx-auto"></div>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-medium text-lg text-gray-900">{faq.question}</span>
                <ChevronDownIcon 
                  className={`h-5 w-5 text-[var(--brand-purple)] transition-transform duration-300 ${activeIndex === index ? 'transform rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-muted">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-muted mb-4">Still have questions?</p>
          <a 
            href="#" 
            className="btn btn-primary"
            aria-label="Contact WorkZen support team"
          >
            Talk to our HR experts
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
