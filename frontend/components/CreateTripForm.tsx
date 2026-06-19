'use client';

import { useState } from 'react';
import { BudgetTier, CreateTripFormData, Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface CreateTripFormProps {
  onTripCreated: (trip: Trip) => void;
  onClose: () => void;
}

const INTEREST_OPTIONS = [
  '🍜 Food & Cuisine', '🏛️ Culture & History', '🌿 Nature & Hiking',
  '🛍️ Shopping', '🎨 Art & Museums', '🎭 Nightlife & Entertainment',
  '🏖️ Beaches & Water', '⛪ Architecture', '📸 Photography',
  '🧘 Wellness & Spa', '🎡 Theme Parks', '🚵 Adventure Sports',
];

const BUDGET_TIERS: { value: BudgetTier; label: string; desc: string; color: string }[] = [
  { value: 'Low', label: '🎒 Budget', desc: 'Hostels & street food', color: 'emerald' },
  { value: 'Medium', label: '🏨 Mid-Range', desc: '3-star hotels & dining', color: 'indigo' },
  { value: 'High', label: '💎 Luxury', desc: '5-star & fine dining', color: 'amber' },
];

export default function CreateTripForm({ onTripCreated, onClose }: CreateTripFormProps) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Medium');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generationStep, setGenerationStep] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination.');
      return;
    }
    setError('');
    setIsGenerating(true);

    const steps = [
      '🧠 Analyzing destination...',
      '🗺️ Building day-by-day itinerary...',
      '🏨 Curating hotel recommendations...',
      '💰 Estimating budget breakdown...',
      '🧳 Generating packing checklist...',
    ];

    let stepIndex = 0;
    setGenerationStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGenerationStep(steps[stepIndex]);
    }, 2000);

    try {
      const formData = {
        destination: destination.trim(),
        durationDays,
        budgetTier,
        startDate: new Date(startDate),
        interests: selectedInterests.map((i) => i.replace(/^[^\s]+\s/, '')), // strip emoji prefix
      };

      const trip = await tripsApi.generate(formData);
      clearInterval(stepInterval);
      onTripCreated(trip);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : 'Failed to generate trip. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl mx-4 glass-strong rounded-3xl p-8 border border-indigo-500/30 animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Plan a New Trip</h2>
            <p className="text-slate-400 text-sm">AI will generate your complete itinerary in seconds.</p>
          </div>
          <button
            onClick={onClose}
            id="close-create-trip-btn"
            className="text-slate-500 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-7">
          {/* Destination */}
          <div>
            <label className="input-label">Destination 🌍</label>
            <input
              id="trip-destination-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-field text-lg"
              placeholder="e.g. Tokyo, Japan"
              disabled={isGenerating}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="input-label">Duration — {durationDays} {durationDays === 1 ? 'Day' : 'Days'} 📅</label>
            <div className="flex items-center gap-4 mt-3">
              <input
                id="trip-duration-slider"
                type="range"
                min={1}
                max={14}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                disabled={isGenerating}
                className="flex-1 h-2 appearance-none rounded-full bg-indigo-500/20 accent-indigo-500 cursor-pointer"
              />
              <div className="w-12 text-center py-1.5 px-2 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-sm">
                {durationDays}d
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1 day</span>
              <span>14 days</span>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="input-label">Start Date 📅</label>
            <input
              id="trip-start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field text-sm"
              disabled={isGenerating}
            />
          </div>

          {/* Budget Tier */}
          <div>
            <label className="input-label">Budget Tier 💳</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {BUDGET_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  id={`budget-tier-${tier.value.toLowerCase()}`}
                  onClick={() => setBudgetTier(tier.value)}
                  disabled={isGenerating}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    budgetTier === tier.value
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-lg mb-1">{tier.label}</div>
                  <div className="text-xs text-slate-400">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="input-label">Interests ({selectedInterests.length} selected)</label>
            <div className="flex flex-wrap gap-2 mt-3">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  id={`interest-${interest.replace(/[^a-z]/gi, '-').toLowerCase()}`}
                  onClick={() => toggleInterest(interest)}
                  disabled={isGenerating}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-indigo-500/25 border border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
              </div>
              <div className="text-center">
                <p className="text-indigo-300 font-semibold animate-pulse">{generationStep}</p>
                <p className="text-slate-500 text-xs mt-1">This may take 15–30 seconds</p>
              </div>
            </div>
          ) : (
            <button
              id="generate-trip-btn"
              onClick={handleSubmit}
              className="btn-primary w-full py-4 text-base"
            >
              <span>✨ Generate My AI Itinerary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
