import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpTrayIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import signup from '../../assets/signup.jpg';
import Loader from '../layout/Loader.jsx';
import Toast from '../layout/Toast.jsx';
import { registerAdmin } from '../../services/auth.js';

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      companyName: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      companyLogo: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogoChange = (files) => {
    const file = files?.[0];
    if (!file) {
      setLogoPreview(null);
      setLogoName('');
      return;
    }

    setLogoPreview(URL.createObjectURL(file));
    setLogoName(file.name);
    clearErrors('companyLogo');
  };

  const onSubmit = async (formData) => {
    if (formData.password !== formData.confirmPassword) {
      setError('confirmPassword', {
        type: 'validate',
        message: 'Passwords do not match',
      });
      return;
    }

    setLoading(true);
    setToastMessage(null);

    try {
      const file = formData.companyLogo?.[0];
      let logoBase64 = null;

      if (file) {
        const encodeFileToBase64 = (inputFile) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Unable to read file'));
            reader.readAsDataURL(inputFile);
          });

        logoBase64 = await encodeFileToBase64(file);
      }

      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.phone.trim(),
        password: formData.password,
        company_name: formData.companyName.trim(),
        company_logo: logoBase64,
      };

      await registerAdmin(payload);

      setToastMessage('Company profile created! Check your email to verify the account.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      console.error('Registration error:', error);
      const backendMessage = error?.data?.detail || error?.data?.message || error?.message;
      setToastMessage(backendMessage || 'Unable to create company right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-muted/80 px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-12%] h-72 w-72 rounded-full bg-[var(--accent-yellow-soft)] blur-3xl"></div>
        <div className="absolute bottom-[-14%] right-[-8%] h-96 w-96 rounded-full bg-[var(--brand-purple)]/20 blur-3xl"></div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <Loader />
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} show onClose={() => setToastMessage(null)} />
      )}

      <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[var(--brand-purple)]/15 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.12)] md:flex-row">
        <div className="relative h-72 w-full overflow-hidden md:h-auto md:w-1/2">
          <img
            src={signup}
            alt="WorkZen onboarding"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--brand-purple)]/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-white">
            <span className="status-badge status-badge--green border-transparent bg-white/20 text-xs uppercase tracking-[0.25em] text-white">
              Company registration
            </span>
            <h1 className="text-3xl font-semibold md:text-4xl text-white">Create your WorkZen account</h1>
            <p className="max-w-sm text-sm text-white/80 md:text-base">
              Centralize your HR data, onboard teams in minutes, and manage payroll-ready attendance workflows from day one.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center gap-8 bg-white px-8 py-12 md:w-1/2 md:px-12">
          <div className="text-center md:text-left">
            <span className="status-badge status-badge--yellow">WorkZen for companies</span>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">Register your company</h2>
            <p className="mt-3 text-sm text-muted">
              Provide core company details to generate your WorkZen workspace. You can invite team members once verification is complete.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-gray-900">
                  Company name
                </label>
                <input
                  type="text"
                  id="companyName"
                  placeholder="Acme HR Solutions"
                  {...register('companyName', { required: 'Company name is required' })}
                  className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900">
                  Your name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Priya Sharma"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
                  Work email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@company.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                  className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900">
                  Work phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="(+91) 98765 43210"
                  {...register('phone', {
                    required: 'Phone number is required',
                    minLength: {
                      value: 8,
                      message: 'Phone number is too short',
                    },
                  })}
                  className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[42px] text-muted"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-900">
                  Confirm password
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  {...register('confirmPassword', {
                    required: 'Confirm your password',
                  })}
                  className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-[42px] text-muted"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Upload company logo
              </label>
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[var(--brand-purple)]/30 bg-[var(--surface-muted)]/60 p-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-purple)]/15 text-[var(--brand-purple)]">
                    <ArrowUpTrayIcon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="companyLogo"
                    className="btn btn-secondary inline-flex cursor-pointer justify-center text-sm"
                  >
                    Choose file
                  </label>
                  <input
                    type="file"
                    id="companyLogo"
                    accept="image/*"
                    className="hidden"
                    {...register('companyLogo', {
                      required: 'Company logo is required',
                      onChange: (event) => handleLogoChange(event.target.files),
                    })}
                  />
                  <p className="mt-2 text-xs text-muted">
                    {logoName || 'JPG, PNG or SVG up to 2MB.'}
                  </p>
                </div>
              </div>
              {errors.companyLogo && (
                <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                  {errors.companyLogo.message}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center" aria-label="Create WorkZen company">
              {loading ? 'Creating company...' : 'Sign up'}
            </button>
          </form>

          <p className="text-center text-sm text-muted md:text-left">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--brand-purple)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
