'use client';

import { useState } from 'react';
import { Trip } from '@/types';
import { tripsApi } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

interface RenameModalProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
  onClose: () => void;
}

export default function RenameModal({ trip, onTripUpdated, onClose }: RenameModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(trip.title || trip.destination);
  const [saving, setSaving] = useState(false);

  const handleRename = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      showToast('Title cannot be empty.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await tripsApi.update(trip._id, { title: trimmed });
      onTripUpdated(updated);
      showToast('Trip renamed successfully! ✏️', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to rename trip.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 glass-strong rounded-2xl p-6 border border-indigo-500/20 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-lg font-black text-white">✏️ Rename Trip</h3>
            <p className="text-xs text-slate-400 mt-0.5">Give your travel plan a custom name.</p>
          </div>
          <button
            onClick={onClose}
            id="close-rename-modal-btn"
            className="text-slate-500 hover:text-white transition-colors text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Trip Name</label>
            <input
              id="rename-trip-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm font-semibold"
              placeholder="e.g. Summer Vacation 2026"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-trip-rename-btn"
            onClick={handleRename}
            disabled={saving || !title.trim()}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
