'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-3" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg">
              T
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Trao</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Create your account</h1>
          <p className="text-sm sm:text-base text-slate-400">Start planning AI-powered trips today — free forever.</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-indigo-500/20">
          {/* Google Sign-Up */}
          <GoogleSignInButton mode="register" />

          <div className="divider">
            <span className="text-xs text-slate-500 px-3 bg-[var(--color-bg-surface)]">or register with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" id="register-form">
            {error && (
              <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="register-name" className="input-label">Full Name</label>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Alex Johnson"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="input-label">Email Address</label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-password" className="input-label">Password</label>
                <input
                  id="register-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Min. 6 chars"
                />
              </div>
              <div>
                <label htmlFor="register-confirm-password" className="input-label">Confirm</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 sm:py-3.5 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  '🚀 Create Free Account'
                )}
              </span>
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-xs sm:text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors" id="register-login-link">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
