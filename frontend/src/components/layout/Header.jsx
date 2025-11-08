import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Demo", href: "#demo" },
    { name: "Docs", href: "#docs" },
  ];

  // Handle scroll effect for transparent to solid header transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // lock body scroll when mobile menu is open to avoid page scroll behind the menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-colors duration-300 ${
        isScrolled ? "bg-white/95 shadow-md backdrop-blur" : "bg-white/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-[var(--brand-purple)]">WorkZen</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors duration-200 hover:text-[var(--brand-purple)]"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-muted transition-colors duration-200 hover:text-[var(--brand-purple)]"
          >
            Login
          </Link>
          <Link to="/signup" className="btn btn-primary text-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition hover:bg-gray-100 hover:text-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30 lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex flex-col bg-white px-6 pb-8 pt-6 shadow-2xl lg:hidden">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-xl font-semibold text-[var(--brand-purple)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                WorkZen
              </Link>
              <button
                type="button"
                className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-transparent px-4 py-3 text-base font-medium text-gray-700 transition hover:border-[var(--brand-purple)]/30 hover:bg-[var(--brand-purple)]/10 hover:text-[var(--brand-purple)]"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-gray-200 px-4 py-3 text-center text-base font-semibold text-gray-700 transition hover:border-[var(--brand-purple)]/40 hover:bg-[var(--brand-purple)]/10 hover:text-[var(--brand-purple)]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-[var(--brand-purple)] px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-[var(--brand-purple)]/90 shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
