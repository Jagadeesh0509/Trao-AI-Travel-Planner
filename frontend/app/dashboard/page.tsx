'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { tripsApi } from '@/utils/api';
import { Trip } from '@/types';

// Original components
import CreateTripForm from '@/components/CreateTripForm';
import ItineraryCard from '@/components/ItineraryCard';
import HotelCard from '@/components/HotelCard';
import PackingList from '@/components/PackingList';

// New components
import ShareModal from '@/components/ShareModal';
import RenameModal from '@/components/RenameModal';
import PackingRegenModal from '@/components/PackingRegenModal';
import BudgetBreakdown from '@/components/BudgetBreakdown';
import MapComponent from '@/components/MapComponent';
import ChatAssistant from '@/components/ChatAssistant';
import RecommendationsView from '@/components/RecommendationsView';
import WeatherView from '@/components/WeatherView';
import PrintItinerary from '@/components/PrintItinerary';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

type DashboardTab = 'itinerary' | 'hotels' | 'packing' | 'budget' | 'map' | 'chat' | 'recommendations' | 'weather';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  // Trips data state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Layout UI states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('itinerary');
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search, Filter, Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBudget, setFilterBudget] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Modal control states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showPackingRegenModal, setShowPackingRegenModal] = useState(false);
  const [activeManageTrip, setActiveManageTrip] = useState<Trip | null>(null);

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
      // Auto select the first trip on first load
      if (data.length > 0 && !selectedTrip) {
        setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to load trips', err);
      showToast('Failed to load your trip itineraries.', 'error');
    } finally {
      setTripsLoading(false);
    }
  };

  const handleTripCreated = (trip: Trip) => {
    setTrips((prev) => [trip, ...prev]);
    setSelectedTrip(trip);
    setShowCreateForm(false);
    setActiveTab('itinerary');
    showToast('AI travel plan generated successfully! ✈️', 'success');
  };

  const handleTripUpdated = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) => (t._id === updatedTrip._id ? updatedTrip : t)));
    if (selectedTrip?._id === updatedTrip._id) {
      setSelectedTrip(updatedTrip);
    }
  };

  const handleDuplicateTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    showToast('Duplicating trip itinerary...', 'info');
    try {
      const duplicated = await tripsApi.duplicate(tripId);
      setTrips((prev) => [duplicated, ...prev]);
      setSelectedTrip(duplicated);
      showToast('Itinerary duplicated successfully! 📋', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to duplicate trip.', 'error');
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    setDeletingTripId(tripId);
    try {
      await tripsApi.delete(tripId);
      const remaining = trips.filter((t) => t._id !== tripId);
      setTrips(remaining);
      if (selectedTrip?._id === tripId) {
        setSelectedTrip(remaining[0] || null);
      }
      showToast('Trip itinerary deleted.', 'info');
    } catch (err) {
      console.error('Failed to delete trip', err);
      showToast('Failed to delete itinerary.', 'error');
    } finally {
      setDeletingTripId(null);
    }
  };

  const handleToggleExploredItem = async (e: React.MouseEvent | React.ChangeEvent | React.FormEvent, trip: Trip) => {
    e.stopPropagation();
    const updatedStatus = !trip.isCompleted;
    try {
      const updated = await tripsApi.update(trip._id, { isCompleted: updatedStatus });
      handleTripUpdated(updated);
      showToast(
        updatedStatus ? 'Trip marked as completed/visited! 🌍' : 'Trip marked as planned.',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to update trip completion status.', 'error');
    }
  };

  const handleToggleExplored = async () => {
    if (!selectedTrip) return;
    const eventMock = { stopPropagation: () => {} } as any;
    await handleToggleExploredItem(eventMock, selectedTrip);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Filter & Sort core method
  const getFilteredTrips = () => {
    let result = [...trips];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          (t.title && t.title.toLowerCase().includes(q))
      );
    }

    if (filterBudget !== 'All') {
      result = result.filter((t) => t.budgetTier === filterBudget);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  };

  const filteredTrips = getFilteredTrips();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020409]">
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
    { id: 'map', label: 'Route Map', icon: '📍' },
    { id: 'chat', label: 'Assistant AI', icon: '🤖' },
    { id: 'recommendations', label: 'AI Recommends', icon: '✨' },
    { id: 'weather', label: 'Weather', icon: '⛈️' },
  ];

  return (
    <div className="min-h-screen flex flex-col print:bg-white" style={{ background: 'var(--color-bg-base)' }}>
      {/* Printable page layout rendered ONLY during browser print */}
      {selectedTrip && <PrintItinerary trip={selectedTrip} />}

      {/* ── Top Navigation ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 glass-strong sticky top-0 z-30 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-slate-400 hover:text-white transition-colors lg:hidden"
            id="sidebar-toggle-btn"
          >
            ☰
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedTrip(null)}>
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
            className="btn-danger text-xs px-3 py-2 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:hidden">
        {/* ── Sidebar ── */}
        <aside
          className={`
            ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
            transition-all duration-300 border-r border-white/5 flex flex-col
            bg-[var(--color-bg-surface)] fixed lg:relative z-20 h-[calc(100vh-65px)] lg:h-auto
          `}
        >
          <div className="p-4 flex-shrink-0 space-y-2">
            <button
              id="new-trip-btn"
              onClick={() => setShowCreateForm(true)}
              className="btn-primary w-full py-3 text-sm cursor-pointer"
            >
              <span>✈️ New Trip</span>
            </button>
            <button
              id="dashboard-overview-btn"
              onClick={() => {
                setSelectedTrip(null);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs font-bold border flex items-center gap-2 ${
                selectedTrip === null
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  : 'hover:bg-white/3 border-transparent text-slate-400'
              }`}
            >
              📊 <span>Dashboard Overview</span>
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
                      className="w-full text-left p-3 pr-10"
                      onClick={() => {
                        setSelectedTrip(trip);
                        setActiveTab('itinerary');
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                    >
                      <div className="font-bold text-white text-sm truncate">{trip.title || trip.destination}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
                        <span>{trip.durationDays}d · {trip.budgetTier} · </span>
                        <span className="text-emerald-400">${trip.estimatedBudget?.total}</span>
                        {trip.isCompleted && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
                            Visited
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-all gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveManageTrip(trip);
                          setShowRenameModal(true);
                        }}
                        className="text-slate-400 hover:text-white text-xs p-1 rounded hover:bg-white/5"
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <input
                        type="checkbox"
                        checked={!!trip.isCompleted}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleToggleExploredItem(e, trip)}
                        className="w-3.5 h-3.5 accent-emerald-500 border border-white/20 bg-white/5 rounded cursor-pointer mx-1 focus:ring-0 focus:outline-none"
                        title={trip.isCompleted ? "Mark as Planned" : "Mark as Explored"}
                      />
                      <button
                        onClick={(e) => handleDeleteTrip(e, trip._id)}
                        disabled={deletingTripId === trip._id}
                        className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-red-500/10"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
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

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto">
          {selectedTrip === null ? (
            /* Dashboard Overview View */
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
              {/* Analytics metrics */}
              <AnalyticsDashboard
                trips={trips}
                onSelectTrip={(t) => {
                  setSelectedTrip(t);
                  setActiveTab('itinerary');
                }}
                onCreateNewTrip={() => setShowCreateForm(true)}
              />

              {/* My Trips Management Panel */}
              {trips.length > 0 && (
                <div className="card p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">🗄️ My Trip Database</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Manage, search, and duplicate generated itineraries.</p>
                    </div>

                    {/* Sorting dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 uppercase font-bold">Sort</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-2 text-white outline-none cursor-pointer focus:border-indigo-500/50"
                      >
                        <option value="newest" className="bg-[#0f1629] text-white">Newest Created</option>
                        <option value="oldest" className="bg-[#0f1629] text-white">Oldest Created</option>
                      </select>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Search trip destination or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl text-xs px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 sm:col-span-2"
                    />
                    <select
                      value={filterBudget}
                      onChange={(e) => setFilterBudget(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl text-xs px-4 py-3 text-white outline-none cursor-pointer focus:border-indigo-500/50"
                    >
                      <option value="All" className="bg-[#0f1629] text-white">All Budgets</option>
                      <option value="Low" className="bg-[#0f1629] text-white">Budget (Low)</option>
                      <option value="Medium" className="bg-[#0f1629] text-white">Mid-Range (Medium)</option>
                      <option value="High" className="bg-[#0f1629] text-white">Luxury (High)</option>
                    </select>
                  </div>

                  {/* List Grid */}
                  {filteredTrips.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-slate-500 text-sm">No trips match your filters.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredTrips.map((trip) => (
                        <div
                          key={trip._id}
                          onClick={() => {
                            setSelectedTrip(trip);
                            setActiveTab('itinerary');
                          }}
                          className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-indigo-500/20 hover:bg-white/3 transition-all cursor-pointer relative group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold uppercase">
                                  {trip.budgetTier}
                                </span>
                                {trip.isCompleted && (
                                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">
                                    Visited
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveManageTrip(trip);
                                    setShowRenameModal(true);
                                  }}
                                  className="text-[10px] p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                  title="Rename"
                                >
                                  ✏️
                                </button>
                                <input
                                  type="checkbox"
                                  checked={!!trip.isCompleted}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleToggleExploredItem(e, trip)}
                                  className="w-3.5 h-3.5 accent-emerald-500 border border-white/20 bg-white/5 rounded cursor-pointer mx-1 focus:ring-0 focus:outline-none"
                                  title={trip.isCompleted ? "Mark as Planned" : "Mark as Explored"}
                                />
                                <button
                                  onClick={(e) => handleDeleteTrip(e, trip._id)}
                                  className="text-[10px] p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <h4 className="font-bold text-white text-base mt-4 group-hover:text-indigo-400 transition-colors truncate">
                              {trip.title || trip.destination}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{trip.destination}</p>
                          </div>

                          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end">
                            <div>
                              <div className="text-[8px] text-slate-500 uppercase tracking-widest">Duration</div>
                              <div className="text-xs font-bold text-slate-300 mt-0.5">{trip.durationDays} Days</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[8px] text-slate-500 uppercase tracking-widest">Total cost</div>
                              <div className="text-sm font-black text-emerald-400 mt-0.5">
                                ${trip.estimatedBudget?.total?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Selected Trip Details Tabbed Workspace */
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
              {/* Workspace Header */}
              <div className="animate-fade-in">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedTrip(null)}
                      className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      ← Back to Overview
                    </button>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-black text-white">{selectedTrip.title || selectedTrip.destination}</h1>
                      <button
                        onClick={() => {
                          setActiveManageTrip(selectedTrip);
                          setShowRenameModal(true);
                        }}
                        className="text-xs text-slate-500 hover:text-white p-1"
                        title="Rename title"
                      >
                        ✏️
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs sm:text-sm text-slate-400">
                      <span>🌍 {selectedTrip.destination}</span>
                      <span className="text-slate-600">·</span>
                      <span>📅 {selectedTrip.durationDays} {selectedTrip.durationDays === 1 ? 'Day' : 'Days'}</span>
                      <span className="text-slate-600">·</span>
                      <span>💳 {selectedTrip.budgetTier} Budget</span>
                      {selectedTrip.interests.length > 0 && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span>
                            {selectedTrip.interests.slice(0, 2).join(', ')}
                            {selectedTrip.interests.length > 2 && ` +${selectedTrip.interests.length - 2}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 text-left sm:text-right">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Estimated Budget</div>
                      <div className="text-2xl font-black gradient-text">
                        ${selectedTrip.estimatedBudget?.total?.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Header Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        id="toggle-explored-btn"
                        onClick={handleToggleExplored}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border transition-colors ${
                          selectedTrip.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        {selectedTrip.isCompleted ? '✓ Explored' : '⚪ Mark as Explored'}
                      </button>
                      <button
                        id="export-pdf-btn"
                        onClick={handleTriggerPrint}
                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        🖨️ PDF Export
                      </button>
                      <button
                        id="share-itinerary-btn"
                        onClick={() => {
                          setActiveManageTrip(selectedTrip);
                          setShowShareModal(true);
                        }}
                        className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        🔗 Share
                      </button>
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
                    className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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

              {/* Tab Content Components */}
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
                      onOpenRegenerateModal={() => {
                        setActiveManageTrip(selectedTrip);
                        setShowPackingRegenModal(true);
                      }}
                    />
                  </div>
                )}

                {activeTab === 'budget' && (
                  <div className="card p-6">
                    <BudgetBreakdown trip={selectedTrip} />
                  </div>
                )}

                {activeTab === 'map' && (
                  <MapComponent trip={selectedTrip} />
                )}

                {activeTab === 'chat' && (
                  <ChatAssistant
                    trip={selectedTrip}
                    onTripUpdated={handleTripUpdated}
                  />
                )}

                {activeTab === 'recommendations' && (
                  <div className="card p-6">
                    <RecommendationsView
                      trip={selectedTrip}
                      onTripUpdated={handleTripUpdated}
                    />
                  </div>
                )}

                {activeTab === 'weather' && (
                  <div className="card p-6">
                    <WeatherView
                      trip={selectedTrip}
                      onTripUpdated={handleTripUpdated}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Create Trip Modal ── */}
      {showCreateForm && (
        <CreateTripForm
          onTripCreated={handleTripCreated}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* ── Share Modal ── */}
      {showShareModal && activeManageTrip && (
        <ShareModal
          trip={activeManageTrip}
          onTripUpdated={handleTripUpdated}
          onClose={() => {
            setShowShareModal(false);
            setActiveManageTrip(null);
          }}
        />
      )}

      {/* ── Rename Modal ── */}
      {showRenameModal && activeManageTrip && (
        <RenameModal
          trip={activeManageTrip}
          onTripUpdated={handleTripUpdated}
          onClose={() => {
            setShowRenameModal(false);
            setActiveManageTrip(null);
          }}
        />
      )}

      {/* ── Packing List Regenerate Modal ── */}
      {showPackingRegenModal && activeManageTrip && (
        <PackingRegenModal
          trip={activeManageTrip}
          onTripUpdated={handleTripUpdated}
          onClose={() => {
            setShowPackingRegenModal(false);
            setActiveManageTrip(null);
          }}
        />
      )}
    </div>
  );
}
