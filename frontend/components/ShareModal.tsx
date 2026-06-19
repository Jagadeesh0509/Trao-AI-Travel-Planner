'use client';

import { useState } from 'react';
import { Trip } from '@/types';
import { tripsApi } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

interface ShareModalProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
  onClose: () => void;
}

export default function ShareModal({ trip, onTripUpdated, onClose }: ShareModalProps) {
  const { showToast } = useToast();
  const [isPublic, setIsPublic] = useState(trip.isPublic || false);
  const [saving, setSaving] = useState(false);

  const getShareLink = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/share/${trip._id}`;
  };

  const handleToggleShare = async () => {
    setSaving(true);
    const newStatus = !isPublic;
    try {
      const updated = await tripsApi.update(trip._id, { isPublic: newStatus });
      setIsPublic(newStatus);
      onTripUpdated(updated);
      showToast(
        newStatus ? 'Trip sharing enabled! Link is public.' : 'Trip sharing disabled. Link is private.',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to update sharing settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareLink());
    showToast('Share link copied to clipboard! 📋', 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 glass-strong rounded-2xl p-6 border border-indigo-500/20 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-lg font-black text-white">🔗 Share Trip Itinerary</h3>
            <p className="text-xs text-slate-400 mt-0.5">Let your friends view this itinerary.</p>
          </div>
          <button
            onClick={onClose}
            id="close-share-modal-btn"
            className="text-slate-500 hover:text-white transition-colors text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Share Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
            <div>
              <div className="text-sm font-bold text-white">Public Sharing</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {isPublic
                  ? 'Anyone with the link can view this itinerary'
                  : 'Only you can view this itinerary'}
              </div>
            </div>
            <button
              onClick={handleToggleShare}
              disabled={saving}
              id="share-toggle-switch"
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center ${
                isPublic ? 'bg-indigo-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Share Link Output */}
          {isPublic && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Public Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareLink()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 select-all focus:outline-none"
                  id="share-link-input"
                />
                <button
                  id="copy-share-link-btn"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
