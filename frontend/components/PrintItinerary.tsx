'use client';

import { Trip } from '@/types';

interface PrintItineraryProps {
  trip: Trip;
}

export default function PrintItinerary({ trip }: PrintItineraryProps) {
  // Helper to format travel dates
  const getTravelDates = () => {
    if (!trip.startDate) return 'Flexible';
    const start = new Date(trip.startDate);
    const end = new Date(start.getTime() + (trip.durationDays - 1) * 24 * 60 * 60 * 1000);
    
    const format = (d: Date) => d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${format(start)} – ${format(end)}`;
  };

  return (
    <div className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto font-sans leading-relaxed" id="printable-itinerary-document">
      {/* Document Header */}
      <div className="border-b-4 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              T
            </span>
            <span className="font-black text-2xl tracking-tight text-indigo-900">TRAO TRAVELS</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Travel Intelligence Document</p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{trip.destination}</h1>
          <p className="text-sm text-indigo-700 font-bold mt-1">📅 {getTravelDates()} · ({trip.durationDays} Days)</p>
        </div>
      </div>

      {/* Travel Summary */}
      <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
        <h2 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-3">🌍 Trip Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Destination</div>
            <div className="font-bold text-slate-800">{trip.destination}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Duration</div>
            <div className="font-bold text-slate-800">{trip.durationDays} Days</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Budget Tier</div>
            <div className="font-bold text-slate-800">{trip.budgetTier} Budget</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Total Budget Estimate</div>
            <div className="font-bold text-indigo-700">${trip.estimatedBudget.total?.toLocaleString()} USD</div>
          </div>
        </div>
        {trip.climateNotes && (
          <div className="text-xs text-slate-600 mt-2">
            <span className="font-bold text-slate-700">Climate Note:</span> {trip.climateNotes} ({trip.season} Season)
          </div>
        )}
      </div>

      {/* Recommended Hotels */}
      <div className="mb-8">
        <h2 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4">🏨 Selected Accommodations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trip.hotels.map((hotel, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="font-bold text-slate-800 text-sm">{hotel.name}</div>
              <div className="text-xs text-slate-500 mt-1">⭐ {hotel.rating} · {hotel.tier} Tier</div>
              <div className="text-xs font-bold text-indigo-700 mt-2">${hotel.estimatedCostNightUSD} / night</div>
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Itinerary */}
      <div className="mb-8 page-break-before">
        <h2 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4">🗺️ Day-by-Day Itinerary</h2>
        <div className="space-y-6">
          {trip.itinerary.map((day) => (
            <div key={day.dayNumber} className="border border-slate-200 rounded-2xl p-5 bg-white avoid-break">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-3">
                <span className="font-black text-sm text-indigo-900 uppercase tracking-wide">Day {day.dayNumber}</span>
                {day.theme && <span className="text-xs text-indigo-600 font-bold">{day.theme}</span>}
              </div>

              <div className="space-y-4">
                {day.activities.map((act, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <span className="font-bold text-slate-400 w-16 uppercase text-[10px] mt-0.5">{act.timeOfDay}</span>
                    <div className="flex-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{act.title}</span>
                        {act.estimatedCostUSD > 0 && <span className="text-indigo-600 font-mono">${act.estimatedCostUSD}</span>}
                      </div>
                      {act.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{act.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget & Packing List Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 page-break-before">
        {/* Cost Summary */}
        <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 avoid-break">
          <h2 className="text-base font-black text-slate-800 border-b border-slate-200 pb-2 mb-3">💰 Estimated Cost Analysis</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: 'Accommodation', val: trip.estimatedBudget.accommodation },
                { label: 'Transport & Flights', val: trip.estimatedBudget.transport },
                { label: 'Food & Dining', val: trip.estimatedBudget.food },
                { label: 'Activities & Sightseeing', val: trip.estimatedBudget.activities },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200/50">
                  <td className="py-2.5 text-slate-600">{item.label}</td>
                  <td className="py-2.5 font-bold text-right text-slate-800">${item.val?.toLocaleString()} USD</td>
                </tr>
              ))}
              <tr className="font-bold text-base text-indigo-900">
                <td className="pt-3">Grand Total</td>
                <td className="pt-3 text-right">${trip.estimatedBudget.total?.toLocaleString()} USD</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Packing List Summary */}
        <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 avoid-break">
          <h2 className="text-base font-black text-slate-800 border-b border-slate-200 pb-2 mb-3">🧳 Packing Checklist</h2>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            {trip.packingList.slice(0, 16).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border border-slate-400 flex items-center justify-center flex-shrink-0 text-[8px]">
                  {item.isPacked ? '✓' : ''}
                </span>
                <span className="truncate">{item.item}</span>
              </div>
            ))}
          </div>
          {trip.packingList.length > 16 && (
            <p className="text-[10px] text-slate-400 mt-3 text-right">+ {trip.packingList.length - 16} more checklist items</p>
          )}
        </div>
      </div>

      {/* Document Footer */}
      <div className="border-t border-slate-200 mt-12 pt-6 text-center text-[10px] text-slate-400">
        Generated by Trao Travel Planner. Visit trao-travels.com to view or edit this itinerary live.
      </div>
    </div>
  );
}
