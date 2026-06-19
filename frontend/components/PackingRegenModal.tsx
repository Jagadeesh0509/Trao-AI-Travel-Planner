'use client';

import { useState } from 'react';
import { Trip } from '@/types';
import { tripsApi } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

interface PackingRegenModalProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
  onClose: () => void;
}

const STYLES = ['Leisure', 'Adventure', 'Business', 'Backpacking', 'Family'];
const SEASONS = ['Summer', 'Winter', 'Spring', 'Autumn'];
const WEATHER_TYPES = ['Mild', 'Hot', 'Cold', 'Rainy', 'Snowy'];

export default function PackingRegenModal({ trip, onTripUpdated, onClose }: PackingRegenModalProps) {
  const { showToast } = useToast();
  const [style, setStyle] = useState(trip.travelStyle || 'Leisure');
  const [season, setSeason] = useState(trip.season || 'Summer');
  const [weather, setWeather] = useState('Mild');
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const updated = await tripsApi.regeneratePacking(trip._id, {
        travelStyle: style,
        season,
        weather,
      });
      onTripUpdated(updated);
      showToast('Packing list regenerated successfully! 🧳', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to regenerate packing list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 glass-strong rounded-3xl p-6 border border-indigo-500/20 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-white">🧳 Customize AI Packing List</h3>
            <p className="text-xs text-slate-400 mt-0.5">Regenerate items tailored to your travel options.</p>
          </div>
          <button
            onClick={onClose}
            id="close-packing-regen-btn"
            className="text-slate-500 hover:text-white transition-colors text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Style */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Travel Style</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    style === s
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Season</label>
            <div className="flex flex-wrap gap-1.5">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    season === s
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Weather */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Expected Weather</label>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER_TYPES.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    weather === w
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-slate-400 text-xs animate-pulse">AI is compiling packing list...</p>
          </div>
        ) : (
          <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-packing-regen-btn"
              onClick={handleRegenerate}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Regenerate Packing List ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
