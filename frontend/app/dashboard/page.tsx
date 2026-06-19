'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/utils/api';
import { Trip } from '@/types';
import CreateTripForm from '@/components/CreateTripForm';
import ItineraryCard from '@/components/ItineraryCard';
import PackingList from '@/components/PackingList';
import HotelCard from '@/components/HotelCard';

type DashboardTab = 'itinerary' | 'hotels' | 'packing' | 'budget';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('itinerary');
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Close sidebar on mobile/tablet initially
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch trips on mount
  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    setTripsLoading(true);
    try {
      const data = await tripsApi.getAll();
      setTrips(data);
      if (data.length > 0 && !selectedTrip) {
        setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to load trips', err);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleTripCreated = (trip: Trip) => {
    setTrips((prev) => [trip, ...prev]);
    setSelectedTrip(trip);
    setShowCreateForm(false);
    setActiveTab('itinerary');
  };

  const handleTripUpdated = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) => (t._id === updatedTrip._id ? updatedTrip : t)));
    setSelectedTrip(updatedTrip);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    setDeletingTripId(tripId);
    try {
      await tripsApi.delete(tripId);
      const remaining = trips.filter((t) => t._id !== tripId);
      setTrips(remaining);
      if (selectedTrip?._id === tripId) {
        setSelectedTrip(remaining[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete trip', err);
    } finally {
      setDeletingTripId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const TABS: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'itinerary', label: 'Itinerary', icon: '🗺️' },
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'packing', label: 'Packing', icon: '🧳' },
    { id: 'budget', label: 'Budget', icon: '💰' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-base)' }}>
      {/* ── Top Navigation ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 glass-strong sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-slate-400 hover:text-white transition-colors lg:hidden"
            id="sidebar-toggle-btn"
          >
            ☰
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              T
            </div>
            <span className="font-black text-white text-lg">Trao</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-white">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>
          <button
            id="dashboard-logout-btn"
            onClick={handleLogout}
            className="btn-danger text-xs px-3 py-2"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`
            ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
            transition-all duration-300 border-r border-white/5 flex flex-col
            bg-[var(--color-bg-surface)] fixed lg:relative z-20 h-[calc(100vh-65px)] lg:h-auto
          `}
        >
          <div className="p-4 flex-shrink-0">
            <button
              id="new-trip-btn"
              onClick={() => setShowCreateForm(true)}
              className="btn-primary w-full py-3 text-sm"
            >
              <span>✈️ New Trip</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest px-2 mb-3">
              Your Trips ({trips.length})
            </div>

            {tripsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-3">✈️</div>
                <p className="text-slate-500 text-sm">No trips yet.</p>
                <p className="text-slate-600 text-xs mt-1">Click &quot;New Trip&quot; to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    className={`group relative rounded-xl transition-all cursor-pointer ${
                      selectedTrip?._id === trip._id
                        ? 'bg-indigo-500/15 border border-indigo-500/30'
                        : 'hover:bg-white/3 border border-transparent'
                    }`}
                    id={`trip-list-item-${trip._id}`}
                  >
                    <button
                      className="w-full text-left p-3"
                      onClick={() => {
                        setSelectedTrip(trip);
                        setActiveTab('itinerary');
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                    >
                      <div className="font-bold text-white text-sm truncate">{trip.destination}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {trip.durationDays}d · {trip.budgetTier} ·{' '}
                        <span className="text-emerald-400">${trip.estimatedBudget.total}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      disabled={deletingTripId === trip._id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs px-2 py-1 rounded transition-all"
                      title="Delete trip"
                      id={`delete-trip-btn-${trip._id}`}
                    >
                      {deletingTripId === trip._id ? '...' : '🗑️'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {!selectedTrip ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center">
              <div className="text-7xl mb-6 animate-bounce">✈️</div>
              <h2 className="text-2xl font-black text-white mb-3">Ready to explore the world?</h2>
              <p className="text-slate-400 mb-8 max-w-sm">
                Create your first AI-generated trip and get a complete day-by-day itinerary in seconds.
              </p>
              <button
                id="empty-state-new-trip-btn"
                onClick={() => setShowCreateForm(true)}
                className="btn-primary px-8 py-4 text-base animate-pulse-glow"
              >
                <span>✨ Generate Your First Trip</span>
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
              {/* Trip Header */}
              <div className="mb-6 animate-fade-in">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-white">{selectedTrip.destination}</h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-sm text-slate-400">
                        📅 {selectedTrip.durationDays} {selectedTrip.durationDays === 1 ? 'Day' : 'Days'}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-sm text-slate-400">
                        💳 {selectedTrip.budgetTier} Budget
                      </span>
                      {selectedTrip.interests.length > 0 && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-sm text-slate-400">
                            {selectedTrip.interests.slice(0, 2).join(', ')}
                            {selectedTrip.interests.length > 2 && ` +${selectedTrip.interests.length - 2}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Total Budget</div>
                      <div className="text-2xl font-black gradient-text">
                        ${selectedTrip.estimatedBudget.total?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/5 mb-6 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
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

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === 'itinerary' && (
                  <ItineraryCard
                    trip={selectedTrip}
                    onTripUpdated={handleTripUpdated}
                  />
                )}

                {activeTab === 'hotels' && (
                  <div className="card p-6">
                    <HotelCard hotels={selectedTrip.hotels} />
                  </div>
                )}

                {activeTab === 'packing' && (
                  <div className="card p-6">
                    <PackingList
                      trip={selectedTrip}
                      onTripUpdated={handleTripUpdated}
                    />
                  </div>
                )}

                {activeTab === 'budget' && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                      💰 Budget Breakdown
                    </h3>

                    <div className="space-y-4">
                      {[
                        { label: 'Transport & Flights', key: 'transport', icon: '✈️' },
                        { label: 'Accommodation', key: 'accommodation', icon: '🏨' },
                        { label: 'Food & Dining', key: 'food', icon: '🍽️' },
                        { label: 'Activities & Sightseeing', key: 'activities', icon: '🎭' },
                      ].map(({ label, key, icon }) => {
                        const value = selectedTrip.estimatedBudget[key as keyof typeof selectedTrip.estimatedBudget] as number;
                        const total = selectedTrip.estimatedBudget.total || 1;
                        const pct = Math.round((value / total) * 100);

                        return (
                          <div key={key}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-sm text-slate-300 flex items-center gap-2">
                                {icon} {label}
                              </span>
                              <span className="font-bold text-white">${value.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="text-right text-xs text-slate-600 mt-0.5">{pct}% of total</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-white">Grand Total</span>
                        <span className="text-3xl font-black gradient-text">
                          ${selectedTrip.estimatedBudget.total?.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        * Estimates based on {selectedTrip.budgetTier.toLowerCase()} budget travel in {selectedTrip.destination}. Actual costs may vary.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Create Trip Modal ──────────────────────────────────────────── */}
      {showCreateForm && (
        <CreateTripForm
          onTripCreated={handleTripCreated}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
