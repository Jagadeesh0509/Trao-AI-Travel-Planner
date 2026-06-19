'use client';

import { PackingItem, PackingCategory, Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface PackingListProps {
  trip: Trip;
  onTripUpdated: (trip: Trip) => void;
}

const CATEGORY_CONFIG: Record<PackingCategory, { icon: string; color: string; bg: string }> = {
  Documents: { icon: '📋', color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20' },
  Clothing: { icon: '👕', color: 'text-pink-300', bg: 'bg-pink-500/10 border-pink-500/20' },
  Gear: { icon: '🎒', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' },
  Other: { icon: '📦', color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/20' },
};

const CATEGORY_ORDER: PackingCategory[] = ['Documents', 'Clothing', 'Gear', 'Other'];

export default function PackingList({ trip, onTripUpdated }: PackingListProps) {
  const handleToggle = async (itemId: string) => {
    const updatedPacking = trip.packingList.map((item: PackingItem) =>
      item._id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );

    try {
      const updated = await tripsApi.update(trip._id, { packingList: updatedPacking });
      onTripUpdated(updated);
    } catch (err) {
      console.error('Failed to toggle packing item', err);
    }
  };

  const totalItems = trip.packingList.length;
  const packedItems = trip.packingList.filter((i) => i.isPacked).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // Group items by category
  const grouped: Record<PackingCategory, PackingItem[]> = {
    Documents: [],
    Clothing: [],
    Gear: [],
    Other: [],
  };

  trip.packingList.forEach((item) => {
    const cat = (item.category as PackingCategory) || 'Other';
    if (grouped[cat]) grouped[cat].push(item);
    else grouped.Other.push(item);
  });

  return (
    <div>
      {/* Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-black text-white">⛈️ AI Packing Assistant</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {trip.climateNotes || `Smart checklist for ${trip.destination}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black gradient-text">{progressPercent}%</div>
            <div className="text-xs text-slate-500">{packedItems}/{totalItems} packed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {progressPercent === 100 && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold text-center animate-fade-in">
            🎉 All packed! You&apos;re ready for your adventure!
          </div>
        )}
      </div>

      {/* Season & Climate */}
      {trip.season && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5">
          <span className="text-2xl">
            {trip.season === 'Summer' ? '☀️' : trip.season === 'Winter' ? '❄️' : trip.season === 'Spring' ? '🌸' : '🍂'}
          </span>
          <div>
            <div className="text-sm font-semibold text-white">{trip.season} Season</div>
            <div className="text-xs text-slate-400">{trip.destination}</div>
          </div>
        </div>
      )}

      {/* Items by Category */}
      <div className="space-y-5">
        {CATEGORY_ORDER.map((category) => {
          const items = grouped[category];
          if (!items || items.length === 0) return null;
          const config = CATEGORY_CONFIG[category];
          const catPacked = items.filter((i) => i.isPacked).length;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span className={`text-sm font-bold ${config.color}`}>{category}</span>
                </div>
                <span className="text-xs text-slate-500">{catPacked}/{items.length}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => item._id && handleToggle(item._id)}
                    id={`packing-item-${item._id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      item.isPacked
                        ? 'bg-emerald-500/8 border-emerald-500/20 opacity-70'
                        : `${config.bg} border`
                    }`}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        item.isPacked
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {item.isPacked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <span
                      className={`text-sm flex-1 ${
                        item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item.item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {trip.packingList.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          <div className="text-4xl mb-3">🧳</div>
          <p>Packing list will appear after trip generation.</p>
        </div>
      )}
    </div>
  );
}
