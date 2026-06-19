'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: '🤖',
    title: 'AI-Generated Itineraries',
    description:
      'Google Gemini 2.5 Flash creates detailed day-by-day plans tailored to your interests, duration, and budget.',
  },
  {
    icon: '🏨',
    title: 'Smart Hotel Matching',
    description:
      'Get curated hotel recommendations that perfectly match your budget tier — from backpacker hostels to luxury resorts.',
  },
  {
    icon: '💰',
    title: 'Realistic Budget Estimates',
    description:
      'Receive itemized cost breakdowns for transport, accommodation, food, and activities based on real local rates.',
  },
  {
    icon: '⛈️',
    title: 'Weather-Aware Packing',
    description:
      'AI analyzes your destination climate and planned activities to generate a smart, interactive packing checklist.',
  },
  {
    icon: '✏️',
    title: 'Live Itinerary Editing',
    description:
      'Add or remove activities, regenerate specific days with new preferences — your plan evolves with you.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description:
      'End-to-end JWT authentication with strict user isolation — your trip data is yours alone.',
  },
];

const destinations = ['Tokyo', 'Paris', 'Bali', 'New York', 'Santorini', 'Dubai', 'Kyoto', 'Barcelona'];

export default function HomePage() {
  const [currentDest, setCurrentDest] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentDest((prev) => (prev + 1) % destinations.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
            T
          </div>
          <span className="text-xl font-black tracking-tight text-white">Trao</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="btn-secondary text-sm px-5 py-2.5"
            id="nav-login-btn"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-primary text-sm px-5 py-2.5"
            id="nav-register-btn"
          >
            <span>Get Started Free</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-28">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm font-medium text-indigo-300 border border-indigo-500/20 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Powered by Google Gemini 2.5 Flash
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] mb-6 animate-fade-in-up max-w-4xl" style={{ animationDelay: '0.1s' }}>
          Plan Your Trip to{' '}
          <span
            className="gradient-text inline-block transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {destinations[currentDest]}
          </span>
          <br />
          <span className="text-slate-300">with AI</span>
        </h1>

        <p
          className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Generate complete day-by-day itineraries, realistic budget breakdowns, hotel
          recommendations, and personalized packing lists — in seconds.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Link href="/register" className="btn-primary text-base px-8 py-3.5 animate-pulse-glow" id="hero-cta-primary">
            <span>✈️ Start Planning Free</span>
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8 py-3.5" id="hero-cta-secondary">
            Sign In to Dashboard →
          </Link>
        </div>

        {/* Stats Bar */}
        <div
          className="flex flex-wrap items-center justify-center gap-8 mt-16 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          {[
            { value: 'Gemini 2.5', label: 'AI Model' },
            { value: '30+', label: 'Day Trips' },
            { value: '3', label: 'Budget Tiers' },
            { value: '100%', label: 'Private & Secure' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Everything you need to plan the{' '}
            <span className="gradient-text">perfect trip</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From destination research to packing — Trao handles it all intelligently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card p-6 animate-fade-in-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            From idea to itinerary in{' '}
            <span className="gradient-text-gold">3 steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Set Your Preferences', desc: 'Enter your destination, trip duration, budget tier (Low / Medium / High), and travel interests.' },
            { step: '02', title: 'AI Builds Your Plan', desc: 'Gemini 2.5 Flash generates a full itinerary, hotel list, budget breakdown, and packing checklist in seconds.' },
            { step: '03', title: 'Edit & Explore', desc: 'Add activities, regenerate specific days, toggle packing items, and save your personalized trip.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Footer Banner ─────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="glass rounded-3xl p-10 text-center border border-indigo-500/20 glow-primary">
          <h2 className="text-3xl font-black text-white mb-3">Ready to plan your next adventure?</h2>
          <p className="text-slate-400 mb-8">Sign up free — no credit card required.</p>
          <Link href="/register" className="btn-primary text-base px-10 py-4" id="footer-cta-btn">
            <span>🌍 Create Your Free Account</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-slate-600 text-sm">
        Built with Google Gemini 2.5 Flash · Next.js · MongoDB
      </footer>
    </div>
  );
}
