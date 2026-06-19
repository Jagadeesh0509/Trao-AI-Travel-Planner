'use client';

import { useState } from 'react';
import { Trip } from '@/types';

interface BudgetBreakdownProps {
  trip: Trip;
}

export default function BudgetBreakdown({ trip }: BudgetBreakdownProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const budget = trip.estimatedBudget;
  const categories = [
    { label: 'Accommodation', value: budget.accommodation || 0, color: '#6366f1', icon: '🏨' },
    { label: 'Transportation', value: budget.transport || 0, color: '#06b6d4', icon: '✈️' },
    { label: 'Food & Dining', value: budget.food || 0, color: '#ec4899', icon: '🍽️' },
    { label: 'Activities', value: budget.activities || 0, color: '#a855f7', icon: '🎭' },
  ];

  const totalExpense = categories.reduce((sum, c) => sum + c.value, 0);
  const emergencyBuffer = Math.round(totalExpense * 0.1); // 10% emergency buffer
  const grandTotal = totalExpense + emergencyBuffer;

  // Pie Chart calculations
  let accumulatedAngle = 0;
  const pieSlices = categories.map((cat, idx) => {
    const percentage = totalExpense > 0 ? cat.value / totalExpense : 0;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    // SVG coordinates helper
    const getCoordinatesForPercent = (percent: number) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    const startPercent = startAngle / 360;
    const endPercent = accumulatedAngle / 360;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    const largeArcFlag = percentage > 0.5 ? 1 : 0;

    // Path command
    const pathData = totalExpense > 0 && percentage < 1
      ? `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
      : percentage === 1
        ? 'M 0 -1 A 1 1 0 1 1 0 1 A 1 1 0 1 1 0 -1 Z'
        : 'M 0 0';

    return {
      ...cat,
      percentage: Math.round(percentage * 100),
      pathData,
      idx,
    };
  });

  const getOptimizationSuggestions = () => {
    const dest = trip.destination;
    if (trip.budgetTier === 'Low') {
      return [
        `🎟️ Multi-Day Transit Passes: Purchase a local travel pass (like a JR pass or Metro card) in ${dest} to save up to 40% on transportation costs.`,
        `🍙 Street Food & Convenience Stores: Grab lunches or breakfast items at local convenience markets or street food stalls to keep dining costs low.`,
        `⛲ Free Attractions: Plan around free walking tours, public gardens, and open plazas which cost nothing but offer great photo ops.`,
        `🛌 Hostel Bookings: Always ask about group rates or look for hostels that offer free shared breakfast.`,
      ];
    } else if (trip.budgetTier === 'Medium') {
      return [
        `📅 Advance Accommodations: Book your hotel rooms at least 3-4 weeks early to avoid peak booking surges in ${dest}.`,
        `🍽️ Lunch Special Menus: Dine at upscale restaurants during lunch hours when they offer the same meals as dinner for 30-50% cheaper.`,
        `🚕 Smart Transfers: Use local ride-hailing applications (like Uber or Grab) or express airport trains instead of private airport taxis.`,
        `🎭 Package Sights: Look for combined entry city passes if you plan to visit more than three major museums or landmarks.`,
      ];
    } else {
      return [
        `🚘 Private Transfers: Rent a private chauffeur service for sightseeing days to avoid losing time waiting for taxis or transfers.`,
        `⭐ Michelin Dining: Reserve gourmet dining slots in ${dest} at least 4-6 weeks in advance, as tables book up rapidly.`,
        `🎟️ VIP Skip-The-Line: Upgrade to fast-track or private guided tours for major attractions to skip the lines completely.`,
        `🛡️ Premium Lounge Passes: Check if your premium credit card offers airport lounge access or private concierge help for booking events.`,
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            💰 Detailed Budget Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized cost breakdown and cost optimization tips.
          </p>
        </div>
      </div>

      {/* Grid: Pie Chart + List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Pie Chart SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-52 h-52">
            <svg
              viewBox="-1 -1 2 2"
              className="w-full h-full transform -rotate-90 select-none drop-shadow-xl"
              style={{ overflow: 'visible' }}
            >
              {pieSlices.map((slice, i) => (
                <path
                  key={i}
                  d={slice.pathData}
                  fill={slice.color}
                  opacity={hoveredIdx === null || hoveredIdx === slice.idx ? 1 : 0.6}
                  className="transition-all duration-300 cursor-pointer origin-center hover:scale-[1.04]"
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
              {/* Inner Cutout for Donut style */}
              <circle cx="0" cy="0" r="0.65" fill="#0f1629" />
            </svg>

            {/* Inner text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Base</span>
              <span className="text-xl font-black text-white">${totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="md:col-span-7 space-y-3.5">
          {pieSlices.map((slice, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                hoveredIdx === slice.idx
                  ? 'bg-white/5 border-white/10 scale-[1.01]'
                  : 'bg-white/2 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{slice.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{slice.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{slice.percentage}% of base budget</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-white">${slice.value.toLocaleString()}</div>
                <div
                  className="w-16 h-1 rounded-full mt-1.5 align-right ml-auto"
                  style={{ backgroundColor: slice.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Base Travel Expense</div>
          <div className="text-lg font-black text-white mt-1">${totalExpense.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-1">Flights, hotels & attractions</p>
        </div>
        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-left">
          <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Emergency Buffer (10%)</div>
          <div className="text-lg font-black text-indigo-300 mt-1">${emergencyBuffer.toLocaleString()}</div>
          <p className="text-[10px] text-indigo-400/70 mt-1">For unplanned medical/delays</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-left">
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Recommended Cash</div>
          <div className="text-lg font-black text-emerald-300 mt-1">${grandTotal.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-400/70 mt-1">Base + emergency cushion</p>
        </div>
      </div>

      {/* Cost Optimization Suggestions */}
      <div className="p-5 rounded-xl bg-white/3 border border-white/5 mt-6">
        <h4 className="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-3">AI Budget Insights & Tips</h4>
        <div className="space-y-3">
          {getOptimizationSuggestions().map((tip, idx) => (
            <div key={idx} className="flex gap-3 text-xs text-slate-300 leading-relaxed items-start">
              <span className="flex-shrink-0 mt-0.5">•</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
