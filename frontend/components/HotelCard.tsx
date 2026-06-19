'use client';

import { Hotel } from '@/types';

interface HotelCardProps {
  hotels: Hotel[];
}

const TIER_BADGE: Record<string, { text: string; class: string }> = {
  Low: { text: '🎒 Budget', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  Medium: { text: '🏨 Mid-Range', class: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  High: { text: '💎 Luxury', class: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
};

function StarRating({ rating }: { rating: string }) {
  // Parse "4.5/5" or "4.2" format
  const num = parseFloat(rating?.split('/')[0] || '0');
  const stars = Math.round(num);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= stars ? 'text-amber-400' : 'text-slate-700'} style={{ fontSize: 12 }}>
          ★
        </span>
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating}</span>
    </div>
  );
}

export default function HotelCard({ hotels }: HotelCardProps) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🏨 <span>Recommended Hotels</span>
        <span className="text-xs text-slate-500 font-normal ml-1">({hotels.length} options)</span>
      </h3>

      <div className="space-y-3">
        {hotels.map((hotel, index) => {
          const tierBadge = TIER_BADGE[hotel.tier] || TIER_BADGE.Medium;

          return (
            <div
              key={hotel._id || index}
              id={`hotel-card-${index}`}
              className="p-4 rounded-xl bg-white/3 border border-white/8 hover:border-indigo-500/20 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{hotel.name}</span>
                    {index === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-semibold">
                        Top Pick
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    <StarRating rating={hotel.rating} />
                  </div>

                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {hotel.amenities.slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-lg font-black text-white">${hotel.estimatedCostNightUSD}</div>
                  <div className="text-[10px] text-slate-500">per night</div>
                  <div className={`mt-1 text-[10px] px-2 py-0.5 rounded-full border ${tierBadge.class}`}>
                    {tierBadge.text}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
