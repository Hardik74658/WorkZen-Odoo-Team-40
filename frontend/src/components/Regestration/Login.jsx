import React, { useMemo, useState } from 'react';
import signup from '../../assets/signup.jpg';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.js';
import { useDispatch } from 'react-redux';
import { login as sliceLogin } from '../../redux/slices/authSlice';
import Toast from '../layout/Toast.jsx';
import Loader from '../layout/Loader.jsx';

const Login = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const demoCredentials = useMemo(
    () => ({
      admin: { eid: 'WFZ-ADMIN-001', password: 'Admin@123' },
      employee: { eid: 'WFZ-EMP-001', password: 'Employee@123' },
    }),
    []
  );

  const handlePrefill = (role) => {
    const creds = demoCredentials[role];
    if (!creds) return;
    setValue('eid', creds.eid, { shouldValidate: true, shouldDirty: true });
    setValue('password', creds.password, { shouldValidate: true, shouldDirty: true });
    setToastMessage(`Filled demo credentials for ${role === 'admin' ? 'Admin' : 'Employee'}.`);
  };
  
  const onSubmit = async (data) => {
    setLoader(true);
    setError(''); // Clear previous errors
    try {
      const payload = {
        eid: data.eid.trim(),
        password: data.password,
      };

      const res = await login(payload);
      if (res?.status === 200) {
        const userPayload = res?.data?.user || res?.data || {};
        if (userPayload?.eid) {
          localStorage.setItem('userId', userPayload.eid);
        }
        if (userPayload?.role_name) {
          localStorage.setItem('role', userPayload.role_name);
        } else if (userPayload?.role?.name) {
          localStorage.setItem('role', userPayload.role.name);
        }

        dispatch(sliceLogin(userPayload));
        setLoader(false);
        setToastMessage('Login successful!');
        navigate('/landing_page');
      } else {
        throw new Error(res?.data?.detail || 'Unexpected error occurred');
      }
    } catch (error) {
      console.error("Login error:", error);
      const backendMessage = error?.data?.detail || error?.data?.message || error?.message;
      setError(backendMessage || 'Network error');
      setLoader(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-muted/80 px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-[var(--accent-yellow-soft)] blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-[var(--brand-purple)]/15 blur-3xl"></div>
      </div>
      {loader && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/30 z-50">
          <Loader />
        </div>
      )}
      {toastMessage && (
        <Toast
          message={toastMessage}
          show={true}
          onClose={() => setToastMessage(null)}
        />
      )}
      <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[var(--brand-purple)]/15 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.12)] md:flex-row">
        {/* Left Side: Image with overlay text */}
        <div className="relative h-72 w-full overflow-hidden md:h-auto md:w-1/2">
          <img
            src={signup}
            alt="WorkZen team collaborating"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--brand-purple)]/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-white">
            <span className="status-badge status-badge--green border-transparent bg-white/20 text-xs uppercase tracking-[0.25em] text-white">
              Secure HRMS Access
            </span>
            <h1 className="text-3xl font-semibold md:text-4xl text-white">Log in to WorkZen</h1>
            <p className="max-w-sm text-sm md:text-base text-white/80">
              Manage attendance, leave approvals, and payroll insights from a single dashboard tailored to your role.
            </p>
            <div className="flex  flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handlePrefill('admin')}
                className="btn btn-primary bg-white text-black hover:bg-gray-300 text-xs sm:text-sm"
              >
                Try as Admin
              </button>
              <button
                type="button"
                onClick={() => handlePrefill('employee')}
                className="btn btn-primary text-xs sm:text-sm"
              >
                Try as Employee
              </button>
            </div>
          </div>
        </div>
        {/* Right Side: Form */}
        <div className="flex w-full flex-col justify-center gap-6 bg-white px-8 py-12 md:w-1/2 md:px-12">
          <div className="text-center md:text-left">
            <span className="status-badge status-badge--yellow">WorkZen Portal</span>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">Login</h2>
            <p className="mt-3 text-sm text-muted">
              Enter your company email to access attendance, leave dashboards, and payroll summaries.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Employee Identifier Field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="eid">
                Employee ID or Email
              </label>
              <input
                type="text"
                placeholder="WFZ-EMP-001"
                id="eid"
                {...register('eid', {
                  required: 'Employee ID or email is required',
                })}
                className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                autoComplete="username"
                aria-invalid={Boolean(errors.eid)}
              />
              {errors.eid && (
                <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                  {errors.eid.message}
                </p>
              )}
            </div>
            {/* Password Field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full justify-center"
              aria-label="Login to WorkZen"
            >
              {loader ? 'Logging In...' : 'Login'}
            </button>
            {/* Error Message */}
            {error && (
              <div className="status-badge status-badge--red mt-2 w-full justify-center text-center" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
          </form>
          <div className="flex flex-col items-center gap-4 text-sm text-muted md:flex-row md:justify-between">
            <Link to={"/forgotpwd"} className="font-semibold text-[var(--brand-purple)] hover:underline">
              Forgot Password?
            </Link>
            <p>
              Don’t have an account?{' '}
              <Link to={"/signup"} className="font-semibold text-[var(--brand-purple)] hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
