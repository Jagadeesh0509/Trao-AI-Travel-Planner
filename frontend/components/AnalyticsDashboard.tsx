'use client';

import { Trip } from '@/types';

interface AnalyticsDashboardProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onCreateNewTrip: () => void;
}

export default function AnalyticsDashboard({ trips, onSelectTrip, onCreateNewTrip }: AnalyticsDashboardProps) {
  // 1. Total trips planned
  const totalTrips = trips.length;

  // 2. Countries explored (estimate unique country names from destination text for completed trips)
  const getUniqueCountriesCount = () => {
    const countries = new Set<string>();
    trips.forEach((t) => {
      if (t.isCompleted) {
        const parts = t.destination.split(',');
        const country = parts[parts.length - 1]?.trim();
        if (country) {
          countries.add(country);
        }
      }
    });
    return countries.size;
  };

  // 3. Total estimated budget
  const totalBudget = trips.reduce((sum, t) => sum + (t.estimatedBudget?.total || 0), 0);

  // 4. Upcoming trips (trips starting after today)
  const getUpcomingTripsCount = () => {
    const now = new Date();
    return trips.filter((t) => t.startDate && new Date(t.startDate) > now).length;
  };

  // 5. Recent trips (top 3 newest)
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getFormatDate = (dateString?: string) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-white">✈️ Travel Analytics Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor your travel history, upcoming adventures, and budget metrics.</p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trips */}
        <div className="card p-5 bg-white/2 border border-white/5 relative overflow-hidden group hover:border-indigo-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Trips</span>
              <h3 className="text-3xl font-black text-white mt-1.5">{totalTrips}</h3>
            </div>
            <span className="text-2xl p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">🗺️</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 font-semibold">Trips successfully planned</div>
        </div>

        {/* Countries Explored */}
        <div className="card p-5 bg-white/2 border border-white/5 relative overflow-hidden group hover:border-emerald-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Countries Explored</span>
              <h3 className="text-3xl font-black text-white mt-1.5">{getUniqueCountriesCount()}</h3>
            </div>
            <span className="text-2xl p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">🌍</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 font-semibold">Unique regions visited</div>
        </div>

        {/* Total Estimated Budget */}
        <div className="card p-5 bg-white/2 border border-white/5 relative overflow-hidden group hover:border-pink-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Investment</span>
              <h3 className="text-3xl font-black text-white mt-1.5">${totalBudget.toLocaleString()}</h3>
            </div>
            <span className="text-2xl p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">💰</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 font-semibold">Estimated travel capital</div>
        </div>

        {/* Upcoming Trips */}
        <div className="card p-5 bg-white/2 border border-white/5 relative overflow-hidden group hover:border-amber-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Upcoming Trips</span>
              <h3 className="text-3xl font-black text-white mt-1.5">{getUpcomingTripsCount()}</h3>
            </div>
            <span className="text-2xl p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">⏳</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 font-semibold">Trips scheduled in future</div>
        </div>
      </div>

      {/* Grid: Create New + Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Create Trip CTA card */}
        <div className="lg:col-span-4 card p-6 bg-gradient-to-br from-indigo-900/40 via-purple-900/10 to-transparent border border-indigo-500/20 flex flex-col justify-between text-left relative overflow-hidden min-h-[220px]">
          <div className="bg-orb bg-orb-1 opacity-20 scale-[0.6] -top-[100px] -left-[100px]" />
          <div>
            <h4 className="text-lg font-black text-white mb-2">Plan your next escape ✈️</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[240px]">
              Let our AI build custom daily routes, itemized cost guides, and checklist details for any city in the world.
            </p>
          </div>
          <button
            onClick={onCreateNewTrip}
            id="analytics-new-trip-btn"
            className="btn-primary py-3 w-full text-xs cursor-pointer animate-pulse-glow"
          >
            <span>✨ Create New Trip</span>
          </button>
        </div>

        {/* Recent Trips list */}
        <div className="lg:col-span-8 card p-6">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            ✈️ Recent Travel Plans
          </h4>
          
          {recentTrips.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-xs">No generated itineraries found. Generate your first plan to start tracking analytics!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => onSelectTrip(trip)}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-indigo-500/20 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                      {trip.title || trip.destination}
                    </div>
                    <div className="flex gap-2 text-slate-500 text-[10px] mt-1">
                      <span>📅 {getFormatDate(trip.startDate)}</span>
                      <span>·</span>
                      <span>⏱️ {trip.durationDays} days</span>
                      <span>·</span>
                      <span className="text-emerald-400">${trip.estimatedBudget?.total?.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-slate-600 group-hover:text-indigo-400 transition-colors text-xs font-bold">
                    Open →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
