'use client';

import { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface RecommendationsViewProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

interface RecommendationItem {
  name: string;
  category: 'Attraction' | 'Hidden Gem' | 'Restaurant' | 'Cafe' | 'Experience';
  description: string;
  estimatedCostUSD: number;
  whyLoveIt: string;
}

const CATEGORY_COLORS: Record<string, { text: string; bg: string; icon: string }> = {
  'Attraction': { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: '🎡' },
  'Hidden Gem': { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '💎' },
  'Restaurant': { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: '🍔' },
  'Cafe': { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '☕' },
  'Experience': { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🏄' },
};

export default function RecommendationsView({ trip, onTripUpdated }: RecommendationsViewProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(trip.recommendations || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip.recommendations && trip.recommendations.length > 0) {
      setRecommendations(trip.recommendations as any);
    } else {
      loadRecommendations();
    }
  }, [trip]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripsApi.getRecommendations(trip._id);
      setRecommendations(data as any);
      // Update parent trip state with the newly cached recommendations
      onTripUpdated({
        ...trip,
        recommendations: data,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Curating personalized suggestions for {trip.destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>
        <button
          onClick={loadRecommendations}
          className="btn-secondary text-xs px-5 py-2.5"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ✨ AI Travel Recommendations
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated attractions, dining, cafes, and local secrets matching your interests.
          </p>
        </div>
        <button
          id="regenerate-recs-btn"
          onClick={loadRecommendations}
          className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          🔄 Refresh POIs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item, idx) => {
          const cfg = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Attraction;
          
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badge Category */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                    <span>{cfg.icon}</span>
                    <span>{item.category}</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {item.estimatedCostUSD > 0 ? `$${item.estimatedCostUSD}` : 'FREE'}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white mt-3.5">{item.name}</h4>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{item.description}</p>
              </div>

              {/* Personal insight */}
              {item.whyLoveIt && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-300 font-medium">
                  💡 <span className="font-bold text-indigo-200">Personal Insight:</span> {item.whyLoveIt}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <p className="text-center text-slate-500 text-xs py-10">No recommendation items generated.</p>
      )}
    </div>
  );
}
