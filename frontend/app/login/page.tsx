'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  // Typewriter implementation
  const typewriterPhrases = [
    'Planning a trip to Tokyo 🇯🇵',
    'Exploring Amsterdam 🇳🇱',
    'Building a Europe itinerary 🌍',
    'Discovering Switzerland 🇨🇭',
    'Planning a Bali getaway 🌴',
    'Finding hidden gems in Seoul 🇰🇷',
    'Exploring Paris 🇫🇷',
    'Planning unforgettable adventures ✨'
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentFullPhrase = typewriterPhrases[phraseIndex];

    if (isDeleting) {
      setTypingSpeed(45); // Delete speed
      timer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, typingSpeed);
    } else {
      setTypingSpeed(85); // Typing speed
      timer = setTimeout(() => {
        setDisplayText((prev) => currentFullPhrase.slice(0, prev.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && displayText === currentFullPhrase) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1500); // 1500ms pause before deleting
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col lg:flex-row relative overflow-hidden bg-[var(--color-bg-base)]">
      {/* Travel-inspired ambient background (dots pattern and dashboard lines) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0">
        <svg className="w-full h-full text-indigo-400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-dots-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-dots-pattern)" />
          {/* Animated route lines */}
          <path d="M-100,200 Q200,80 500,280 T1100,100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" className="animate-dash" />
          <path d="M100,600 Q400,450 800,650 T1500,400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash" style={{ animationDuration: '35s' }} />
        </svg>
      </div>

      {/* Floating Travel Icons with low opacity */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-15">
        <span className="absolute text-3xl top-[12%] left-[8%] animate-float">✈️</span>
        <span className="absolute text-2xl top-[45%] left-[28%] animate-float" style={{ animationDelay: '2s', animationDuration: '7s' }}>🌴</span>
        <span className="absolute text-3xl top-[78%] left-[12%] animate-float" style={{ animationDelay: '4s', animationDuration: '8s' }}>🏨</span>
        <span className="absolute text-2xl top-[18%] left-[42%] animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}>🧭</span>
        <span className="absolute text-3xl top-[65%] left-[38%] animate-float" style={{ animationDelay: '3.5s', animationDuration: '7.5s' }}>📸</span>
        <span className="absolute text-3xl top-[25%] left-[85%] animate-float" style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}>🗼</span>
        <span className="absolute text-2xl top-[55%] left-[90%] animate-float" style={{ animationDelay: '5s', animationDuration: '9s' }}>🗺️</span>
      </div>

      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1 opacity-20" />
      <div className="bg-orb bg-orb-2 opacity-20" />

      {/* Hero Section Container */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-6 lg:py-24 lg:pl-16 lg:pr-8 relative z-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0 w-full">
        <div className="lg:max-w-xl">
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg">
                T
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Trao</span>
            </Link>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Your AI Travel<br className="hidden lg:block"/> Companion
          </h1>

          {/* Typewriter Animation Display */}
          <div className="h-12 sm:h-14 flex items-center mt-3 sm:mt-4">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-300">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(99,102,241,0.35)]">
                {displayText}
              </span>
              <span className="ml-1 inline-block w-[3px] h-[20px] sm:h-[24px] lg:h-[28px] bg-indigo-400 animate-blink align-middle" />
            </p>
          </div>

          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-md leading-relaxed hidden lg:block">
            Generate complete day-by-day itineraries, explore curated hotels, build budget breakdowns, and organize packing lists powered by AI.
          </p>
        </div>
      </div>

      {/* Login Card Container */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12 pt-6 lg:py-24 lg:pr-16 lg:pl-8 relative z-10 w-full">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Glassmorphism Card */}
          <div className="glass rounded-3xl p-6 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-slate-950/40">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">Access your saved trips and itinerary dashboard</p>
            </div>

            {/* Google Sign-In */}
            <GoogleSignInButton mode="login" />

            <div className="divider">
              <span className="text-xs text-slate-500 px-3 bg-[var(--color-bg-surface)]">or continue with email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" id="login-form">
              {error && (
                <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm animate-fade-in">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="input-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="input-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button
                id="login-submit-btn"
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
                      Signing in...
                    </>
                  ) : (
                    '🔐 Sign In'
                  )}
                </span>
              </button>
            </form>

            <div className="divider" />

            <p className="text-center text-xs sm:text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors" id="login-register-link">
                Create one free →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
