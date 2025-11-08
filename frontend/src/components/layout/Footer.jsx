import React from 'react';

const Footer = () => {
  const linkGroup = (title, links) => (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{title}</h3>
      <ul className="space-y-3 text-sm text-muted">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="transition-colors duration-200 hover:text-[var(--brand-purple)]">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer
      className="relative  border-[var(--brand-purple)]/15 bg-gradient-to-b from-white via-white to-purple-50/40 py-12 pb-12"
      id="pricing"
    >
      <div className="section-wrapper flex flex-col gap-16">
        <div className="flex flex-col gap-12 p-12 md:gap-16 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-6">
            <LinkLogo />
            <p className="text-sm text-muted" id="docs">
              WorkZen keeps people operations simple with a single system for attendance, leaves, payroll summaries, and employee records.
            </p>
            <div className="space-y-1 text-sm text-muted">
              <p className="font-semibold text-gray-900">Contact</p>
              <a href="mailto:hello@workzen.hr" className="inline-flex items-center gap-2 text-[var(--brand-purple)]">
                hello@workzen.hr
              </a>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {linkGroup('Product', [
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Demo', href: '#demo' },
              { label: 'Docs', href: '#docs' },
            ])}

            {linkGroup('Company', [
              { label: 'About', href: '#about' },
              { label: 'Careers', href: '#careers' },
              { label: 'Partners', href: '#partners' },
              { label: 'Press', href: '#press' },
            ])}

            {linkGroup('Resources', [
              { label: 'Support', href: '#support' },
              { label: 'Status', href: '#status' },
              { label: 'Security', href: '#security' },
              { label: 'Privacy & Terms', href: '#legal' },
            ])}
          </div>
        </div>

        <div className="border-t border-[var(--brand-purple)]/15 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">© {new Date().getFullYear()} WorkZen. All rights reserved.</p>
            <div className="flex gap-4 text-[var(--brand-purple)]/70">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((network) => (
                <a
                  key={network}
                  href="#"
                  aria-label={`WorkZen on ${network}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-purple)]/15 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand-purple)]/40 hover:text-[var(--brand-purple)]"
                >
                  <SocialIcon name={network} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LinkLogo = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-purple)]/15 text-lg font-semibold text-[var(--brand-purple)]">
      WZ
    </div>
    <div className="flex flex-col">
      <span className="text-lg font-bold text-gray-900">WorkZen</span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted">HRMS made simple</span>
    </div>
  </div>
);

const SocialIcon = ({ name }) => {
  switch (name) {
    case 'facebook':
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
        </svg>
      );
  }
};

export default Footer;