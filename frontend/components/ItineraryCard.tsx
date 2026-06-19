'use client';

import { useState } from 'react';
import { ItineraryDay, Activity, Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface ItineraryCardProps {
  trip: Trip;
  onTripUpdated: (trip: Trip) => void;
}

const TIME_BADGE: Record<string, string> = {
  Morning: 'badge-morning',
  Afternoon: 'badge-afternoon',
  Evening: 'badge-evening',
};

const TIME_ICON: Record<string, string> = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌙',
};

export default function ItineraryCard({ trip, onTripUpdated }: ItineraryCardProps) {
  const [newActivity, setNewActivity] = useState<Record<number, string>>({});
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [regenerateFeedback, setRegenerateFeedback] = useState<Record<number, string>>({});
  const [showRegenerateInput, setShowRegenerateInput] = useState<Record<number, boolean>>({});
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [isAddingActivity, setIsAddingActivity] = useState<number | null>(null);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleAddActivity = async (dayNum: number) => {
    const activityTitle = newActivity[dayNum]?.trim();
    if (!activityTitle) return;

    setIsAddingActivity(dayNum);

    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          activities: [
            ...day.activities,
            {
              title: activityTitle,
              description: 'Added manually by traveler.',
              estimatedCostUSD: 0,
              timeOfDay: 'Afternoon' as const,
            },
          ],
        };
      }
      return day;
    });

    try {
      const updated = await tripsApi.update(trip._id, { itinerary: updatedItinerary });
      onTripUpdated(updated);
      setNewActivity((prev) => ({ ...prev, [dayNum]: '' }));
    } catch (err) {
      console.error('Failed to add activity', err);
    } finally {
      setIsAddingActivity(null);
    }
  };

  const handleRemoveActivity = async (dayNum: number, actIndex: number) => {
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          activities: day.activities.filter((_, i) => i !== actIndex),
        };
      }
      return day;
    });

    try {
      const updated = await tripsApi.update(trip._id, { itinerary: updatedItinerary });
      onTripUpdated(updated);
    } catch (err) {
      console.error('Failed to remove activity', err);
    }
  };

  const handleRegenerateDay = async (dayNum: number) => {
    setRegeneratingDay(dayNum);
    try {
      const feedback = regenerateFeedback[dayNum] || '';
      const updated = await tripsApi.regenerateDay(trip._id, dayNum, feedback);
      onTripUpdated(updated);
      setShowRegenerateInput((prev) => ({ ...prev, [dayNum]: false }));
      setRegenerateFeedback((prev) => ({ ...prev, [dayNum]: '' }));
    } catch (err) {
      console.error('Failed to regenerate day', err);
    } finally {
      setRegeneratingDay(null);
    }
  };

  return (
    <div className="space-y-4">
      {trip.itinerary.map((day: ItineraryDay) => {
        const isExpanded = expandedDays[day.dayNumber] !== false; // default open
        const isRegenerating = regeneratingDay === day.dayNumber;

        return (
          <div
            key={day.dayNumber}
            className="card overflow-hidden"
            id={`itinerary-day-${day.dayNumber}`}
          >
            {/* Day Header */}
            <button
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
              onClick={() => toggleDay(day.dayNumber)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {day.dayNumber}
                </div>
                <div>
                  <div className="font-bold text-white">Day {day.dayNumber}</div>
                  {day.theme && (
                    <div className="text-xs text-indigo-300 mt-0.5">{day.theme}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{day.activities.length} activities</span>
                <span className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>

            {/* Day Content */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-white/5">
                {isRegenerating ? (
                  <div className="flex items-center justify-center py-10 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <span className="text-slate-400 animate-pulse">Regenerating Day {day.dayNumber}...</span>
                  </div>
                ) : (
                  <>
                    {/* Activities */}
                    <div className="space-y-3 pt-4">
                      {day.activities.map((activity: Activity, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 group hover:border-indigo-500/20 transition-colors"
                          id={`activity-day${day.dayNumber}-${index}`}
                        >
                          <span className="text-lg flex-shrink-0 mt-0.5">{TIME_ICON[activity.timeOfDay] || '📍'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <span className="font-semibold text-white text-sm">{activity.title}</span>
                              <div className="flex items-center gap-2 flex-shrink-0 mt-1 sm:mt-0">
                                <span className={`badge ${TIME_BADGE[activity.timeOfDay] || 'badge-morning'}`}>
                                  {activity.timeOfDay}
                                </span>
                                {activity.estimatedCostUSD > 0 && (
                                  <span className="text-xs text-emerald-400 font-mono">${activity.estimatedCostUSD}</span>
                                )}
                                <button
                                  onClick={() => handleRemoveActivity(day.dayNumber, index)}
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity px-1.5 py-0.5 rounded hover:bg-red-500/10"
                                  title="Remove activity"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            {activity.description && (
                              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{activity.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Activity */}
                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="text"
                        placeholder="Add a custom activity..."
                        value={newActivity[day.dayNumber] || ''}
                        onChange={(e) =>
                          setNewActivity((prev) => ({ ...prev, [day.dayNumber]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleAddActivity(day.dayNumber)}
                        disabled={isAddingActivity === day.dayNumber}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg text-sm px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        id={`add-activity-input-day${day.dayNumber}`}
                      />
                      <button
                        onClick={() => handleAddActivity(day.dayNumber)}
                        disabled={isAddingActivity === day.dayNumber}
                        className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                        id={`add-activity-btn-day${day.dayNumber}`}
                      >
                        {isAddingActivity === day.dayNumber ? '...' : '+ Add'}
                      </button>
                    </div>

                    {/* Regenerate Day */}
                    <div className="mt-4">
                      {showRegenerateInput[day.dayNumber] ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Optional: guide the AI (e.g. more outdoor activities)..."
                            value={regenerateFeedback[day.dayNumber] || ''}
                            onChange={(e) =>
                              setRegenerateFeedback((prev) => ({ ...prev, [day.dayNumber]: e.target.value }))
                            }
                            className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg text-sm px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                            id={`regen-feedback-day${day.dayNumber}`}
                          />
                          <button
                            onClick={() => handleRegenerateDay(day.dayNumber)}
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                            id={`regen-btn-day${day.dayNumber}`}
                          >
                            🔄 Regenerate
                          </button>
                          <button
                            onClick={() => setShowRegenerateInput((prev) => ({ ...prev, [day.dayNumber]: false }))}
                            className="text-slate-500 hover:text-slate-300 text-sm px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRegenerateInput((prev) => ({ ...prev, [day.dayNumber]: true }))}
                          className="text-xs text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                          id={`show-regen-btn-day${day.dayNumber}`}
                        >
                          🔄 Regenerate this day with AI
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
