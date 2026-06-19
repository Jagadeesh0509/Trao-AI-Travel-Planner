'use client';

import { useState, useEffect, use } from 'react';
import { Trip, ItineraryDay, Activity } from '@/types';
import { tripsApi } from '@/utils/api';
import HotelCard from '@/components/HotelCard';
import MapComponent from '@/components/MapComponent';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default function SharedTripPage({ params }: SharePageProps) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'budget' | 'map' | 'weather'>('itinerary');
  const [weatherReport, setWeatherReport] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadPublicTrip();
    }
  }, [tripId]);

  // Load weather when weather tab is opened
  useEffect(() => {
    if (activeTab === 'weather' && trip && !weatherReport && !weatherLoading) {
      loadWeather();
    }
  }, [activeTab, trip]);

  const loadPublicTrip = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripsApi.getPublicById(tripId);
      setTrip(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'This trip itinerary is private or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async () => {
    if (!trip) return;
    setWeatherLoading(true);
    try {
      const report = await tripsApi.getWeather(trip._id);
      setWeatherReport(report);
    } catch (err) {
      console.error('Failed to load weather', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const getTravelDates = () => {
    if (!trip?.startDate) return 'Flexible Dates';
    const start = new Date(trip.startDate);
    const end = new Date(start.getTime() + (trip.durationDays - 1) * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const getForecastDate = (dayIndex: number) => {
    if (!trip?.startDate) return '';
    const start = new Date(trip.startDate);
    const targetDate = new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020409]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#020409]">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 max-w-sm mb-6">{error || 'This itinerary is private or does not exist.'}</p>
        <a href="/" className="btn-primary text-xs px-6 py-3">
          <span>Go to Trao Homepage</span>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020409] text-slate-100 pb-16 relative">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1 opacity-5" />
      <div className="bg-orb bg-orb-2 opacity-5" />

      {/* Shared Header Banner */}
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 px-4 py-2.5 text-center text-xs font-semibold text-indigo-300 backdrop-blur-md">
        ✈️ Shared Trip Itinerary · Created using AI on <span className="font-bold text-white">Trao</span>
      </div>

      {/* Main Top Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
            T
          </div>
          <span className="text-lg font-black tracking-tight text-white">Trao</span>
        </div>
        <a href="/" className="text-xs font-bold text-slate-400 hover:text-white border border-white/10 rounded-lg px-4 py-2 hover:bg-white/5 transition-all">
          Build Your Own Trip ✨
        </a>
      </nav>

      {/* Trip Showcase */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 mt-8 relative z-10">
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                Shared View
              </span>
              <h1 className="text-3xl font-black text-white mt-2">{trip.title || trip.destination}</h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                <span>📅 {getTravelDates()}</span>
                <span>·</span>
                <span>⏱️ {trip.durationDays} Days</span>
                <span>·</span>
                <span>💳 {trip.budgetTier} Budget</span>
              </div>
            </div>
            
            <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Total Estimated Budget</div>
              <div className="text-3xl font-black gradient-text mt-0.5">
                ${trip.estimatedBudget.total?.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Based on local estimates</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/5 mb-6 overflow-x-auto">
          {[
            { id: 'itinerary', label: 'Itinerary', icon: '🗺️' },
            { id: 'hotels', label: 'Hotels', icon: '🏨' },
            { id: 'budget', label: 'Budget', icon: '💰' },
            { id: 'map', label: 'Route Map', icon: '📍' },
            { id: 'weather', label: 'Weather', icon: '⛈️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Tabs */}
        <div>
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              {trip.itinerary.map((day: ItineraryDay) => (
                <div key={day.dayNumber} className="card p-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-sm">
                        {day.dayNumber}
                      </div>
                      <span className="font-bold text-white text-sm sm:text-base">Day {day.dayNumber}</span>
                    </div>
                    {day.theme && <span className="text-xs text-indigo-300 font-semibold">{day.theme}</span>}
                  </div>
                  
                  <div className="space-y-3">
                    {day.activities.map((act: Activity, idx: number) => (
                      <div key={idx} className="flex gap-3 p-3 bg-white/2 border border-white/5 rounded-xl text-xs sm:text-sm">
                        <span className="text-lg">
                          {act.timeOfDay === 'Morning' ? '🌅' : act.timeOfDay === 'Afternoon' ? '☀️' : '🌙'}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between font-semibold text-white">
                            <span>{act.title}</span>
                            {act.estimatedCostUSD > 0 && <span className="text-emerald-400 font-mono">${act.estimatedCostUSD}</span>}
                          </div>
                          {act.description && <p className="text-slate-400 text-xs mt-1 leading-normal">{act.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="card p-6">
              <HotelCard hotels={trip.hotels} />
            </div>
          )}

          {activeTab === 'map' && (
            <MapComponent trip={trip} />
          )}

          {activeTab === 'budget' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                💰 Budget Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Transport & Flights', value: trip.estimatedBudget.transport, icon: '✈️' },
                  { label: 'Accommodation', value: trip.estimatedBudget.accommodation, icon: '🏨' },
                  { label: 'Food & Dining', value: trip.estimatedBudget.food, icon: '🍽️' },
                  { label: 'Activities & Sightseeing', value: trip.estimatedBudget.activities, icon: '🎭' },
                ].map(({ label, value, icon }) => {
                  const total = trip.estimatedBudget.total || 1;
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
                        <span className="text-slate-300 flex items-center gap-2">{icon} {label}</span>
                        <span className="font-bold text-white">${value?.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-right text-[10px] text-slate-500 mt-0.5">{pct}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="card p-6">
              {weatherLoading ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <span className="text-slate-400 text-sm animate-pulse">Consulting meteorological guides...</span>
                </div>
              ) : weatherReport && weatherReport.current ? (
                <div className="space-y-6">
                  {/* Current weather card */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                    <div className="text-4xl">🌤️</div>
                    <div>
                      <div className="text-xs text-slate-400">Current weather report</div>
                      <div className="text-2xl font-black text-white">{weatherReport.current.tempC}°C</div>
                      <div className="text-xs text-indigo-300 font-semibold">{weatherReport.current.condition} · Rain {weatherReport.current.rainProbabilityPercent}%</div>
                    </div>
                  </div>

                  {/* Travel safety warnings */}
                  {weatherReport.warnings && weatherReport.warnings.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-1">
                      <div className="font-bold text-red-200">⚠️ Travel Advisories:</div>
                      {weatherReport.warnings.map((w: string, idx: number) => (
                        <p key={idx}>• {w}</p>
                      ))}
                    </div>
                  )}

                  {/* 7-day forecast grid */}
                  <div>
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">7-Day Local Forecast</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {weatherReport.forecast.map((f: any, idx: number) => (
                        <div key={idx} className="p-3 text-center border border-white/5 rounded-xl bg-white/1 text-xs">
                          <div className="text-slate-500 font-bold">{f.day}</div>
                          {trip?.startDate && (
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{getForecastDate(idx)}</div>
                          )}
                          <div className="text-sm font-black text-white mt-1.5">{f.tempMaxC}° / {f.tempMinC}°</div>
                          <div className="text-[10px] text-indigo-300 mt-1 truncate">{f.condition}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">☔ {f.rainProbabilityPercent}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500 text-sm py-10">Weather information unavailable.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
