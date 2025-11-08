import React from 'react';
import { motion } from 'framer-motion';
import heroSVG from '../../assets/heroSVG.svg';

export const Hero = () => {
  // Floating icon animations
  const floatingAnimation = {
    y: {
      yoyo: Infinity,
      duration: 2.5,
      ease: "easeInOut",
      repeatDelay: 0.5,
    }
  };
  
  const iconVariants = [
    { initial: { y: 0 }, animate: { y: -15 } },
    { initial: { y: 0 }, animate: { y: -10 } },
    { initial: { y: 0 }, animate: { y: -20 } },
    { initial: { y: 0 }, animate: { y: -12 } }
  ];

  return (
  <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/40 pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-28">
      {/* Decorative elements - floating icons */}
      <motion.div 
        className="absolute top-20 left-[10%] w-16 h-16"
        initial={iconVariants[0].initial}
        animate={iconVariants[0].animate}
        transition={{ ...floatingAnimation.y, delay: 0 }}
      >
  <svg className="w-full h-full text-[var(--brand-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute top-40 left-[30%] w-14 h-14"
        initial={iconVariants[1].initial}
        animate={iconVariants[1].animate}
        transition={{ ...floatingAnimation.y, delay: 0.5 }}
      >
  <svg className="w-full h-full text-[var(--brand-purple)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute top-24 right-[25%] w-16 h-16"
        initial={iconVariants[2].initial}
        animate={iconVariants[2].animate}
        transition={{ ...floatingAnimation.y, delay: 1 }}
      >
  <svg className="w-full h-full text-[var(--accent-yellow)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute top-16 right-[15%] w-12 h-12"
        initial={iconVariants[3].initial}
        animate={iconVariants[3].animate}
        transition={{ ...floatingAnimation.y, delay: 1.5 }}
      >
  <svg className="w-full h-full text-[var(--accent-red)]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 2 00-2-2V7a2 2 2 00-2-2H5a2 2 2 00-2 2v12a2 2 2 00-2 2z"></path>
        </svg>
      </motion.div>

      {/* Background colorful blobs */}
      <div className="absolute top-10 right-[8%] w-72 h-72 bg-[var(--brand-purple)]/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[8%] left-[5%] w-72 h-72 bg-[var(--accent-yellow)]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-10 right-[22%] w-64 h-64 bg-[var(--accent-green)]/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="section-wrapper">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center">
          {/* Text content */}
          <motion.div 
            className="lg:w-3/5 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-purple)]/20 bg-[var(--brand-purple)]/10 px-4 py-2 text-sm font-medium text-[var(--brand-purple)]">
              <span className="status-badge status-badge--green px-2 py-0 text-xs uppercase tracking-wide">New</span>
              WorkZen — HRMS made simple
            </div>
            <h1 className="mt-6 text-[clamp(2.5rem,4.8vw,3.75rem)] font-bold leading-[1.08] text-gray-900">
              WorkZen — Simple, Powerful HRMS
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted lg:max-w-xl">
              Manage attendance, leaves, payroll, and employee data — all in one place. Built for small teams and enterprises.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <motion.a 
                href="/signup" 
                className="btn btn-primary text-base"
                aria-label="Get started with a free WorkZen trial"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started — Free Trial
              </motion.a>
              <motion.a 
                href="#demo" 
                className="btn btn-secondary text-base"
                aria-label="Watch a demo of WorkZen"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                See Demo
              </motion.a>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--brand-purple)]/15 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <div className="status-badge status-badge--green">Verified SOC 2 Type II</div>
                <span className="text-sm text-muted">HR teams onboard in under 7 days</span>
              </div>
              <div className="flex items-center gap-3 text-left text-sm text-muted">
                <span className="font-semibold text-gray-900">2,500+</span>
                <span>companies trust WorkZen</span>
              </div>
            </div>
          </motion.div>

          {/* Hero image/illustration */}
          <motion.div 
            className="lg:w-2/5 mt-10 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative overflow-hidden rounded-[28px] border border-[var(--brand-purple)]/10 bg-white shadow-[0_25px_60px_rgba(111,66,193,0.12)]">
                <div className="absolute left-6 top-6 flex items-center gap-2">
                  <span className="status-badge status-badge--yellow">Attendance</span>
                  <span className="status-badge status-badge--green">Payroll ready</span>
                </div>
                <img 
                  src={heroSVG} 
                  alt="WorkZen dashboard"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="h-10 w-10 rounded-xl bg-[var(--brand-purple)]/15 text-[var(--brand-purple)] flex items-center justify-center font-semibold">82%</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Engagement up</p>
                    <p className="text-xs text-muted">Quarterly update</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-10 h-16 w-16 rounded-full bg-[var(--accent-yellow)]/50 blur-xl"></div>
              <div className="absolute -bottom-12 -left-6 h-24 w-24 rounded-full bg-[var(--brand-purple)]/20 blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add animations to stylesheet */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
