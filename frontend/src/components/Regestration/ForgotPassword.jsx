import React, { useState } from 'react';
import signup from '../../assets/signup.jpg';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../layout/Toast'; // Import the Toast component
import Loader from '../layout/Loader'; // Import the Loader component

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const onSubmit = async (data) => {
    setLoader(true);
    try {
      const res = await axios.post(`/forgotpassword?email=${encodeURIComponent(data.email)}`); // Send email as query parameter
      if (res.status === 200) {
        setLoader(false);
        // Show toast instead of alert
        setToast({ show: true, message: 'Your email has been sent' });
        // Optionally auto-close the toast after a delay and navigate
        setTimeout(() => {
          setToast({ show: false, message: '' });
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.detail || 'An error occurred');
      setLoader(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-muted/80 px-6 py-12">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-18%] h-64 w-64 rounded-full bg-[var(--accent-yellow-soft)] blur-3xl"></div>
        <div className="absolute bottom-[-14%] right-[-10%] h-80 w-80 rounded-full bg-[var(--brand-purple)]/15 blur-3xl"></div>
      </div>

      {/* Toast Positioning */}
      <div className="fixed top-5 right-5 z-50">
        <Toast
          show={toast.show}
          message={toast.message}
          onUndo={() => {
            // You can add any undo functionality here
          }}
          onClose={() => setToast({ show: false, message: '' })}
        />
      </div>

      {/* Loader */}
      {loader && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/30 z-50">
          <Loader />
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[var(--brand-purple)]/15 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.12)] md:flex-row">
        {/* Left Side: Form */}
        <div className="flex w-full flex-col justify-center gap-6 bg-white px-8 py-12 md:w-1/2 md:px-12">
          <div className="text-center md:text-left">
            <span className="status-badge status-badge--yellow">Account Recovery</span>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">Forgot Password</h2>
            <p className="mt-3 text-sm text-muted">
              Enter the email linked to your WorkZen account and we&apos;ll send a secure reset link.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="example@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/30"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[var(--accent-red)]" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full justify-center"
            >
              {loader ? 'Sending Link...' : 'Send Reset Password Link'}
            </button>
            {/* Error Message */}
            {error && (
              <div className="status-badge status-badge--red mt-2 w-full justify-center text-center" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
          </form>
          <div className="flex flex-col items-center gap-4 text-sm text-muted md:flex-row md:justify-between">
            <Link to={"/login"} className="font-semibold text-[var(--brand-purple)] hover:underline">
              Back to Login
            </Link>
            <p>
              Need a new account?{' '}
              <Link to={"/signup"} className="font-semibold text-[var(--brand-purple)] hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Image with overlay text */}
        <div className="relative h-72 w-full overflow-hidden md:h-auto md:w-1/2">
          <img
            src={signup}
            alt="Team resetting password securely"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--brand-purple)]/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-white">
            <span className="status-badge status-badge--green border-transparent bg-white/20 text-xs uppercase tracking-[0.25em] text-white">
              Secure Workflow
            </span>
            <h1 className="text-3xl font-semibold md:text-4xl text-white">Reset and Reconnect</h1>
            <p className="max-w-sm text-sm md:text-base text-white/80">
              Get back into your WorkZen suite to manage teams, payroll, and collaboration in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
