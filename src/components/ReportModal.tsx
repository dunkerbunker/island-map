'use client';

import React, { useState } from 'react';
import { Place } from '@/types';
import { X, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ place, isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('wrong-location');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save to localStorage
    const existingReports = JSON.parse(localStorage.getItem('map-reports') || '[]');
    existingReports.push({
      placeId: place.id,
      placeName: place.name,
      reason,
      notes,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('map-reports', JSON.stringify(existingReports));
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setNotes('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-overlay backdrop-blur-md">
      <div className="liquid-glass rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-transparent dark:border-white/10">
        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <CheckCircle2 size={48} className="text-theme-text-main mb-4" />
            <h3 className="text-xl font-extrabold text-theme-text-main mb-2 tracking-tight">Report Submitted</h3>
            <p className="text-theme-text-muted font-medium">Thank you for helping keep the map accurate.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-5 border-b border-theme-border relative overflow-hidden">
              <h3 className="text-lg font-extrabold text-theme-text-main relative z-10 tracking-tight">Report Issue</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-theme-text-main hover:scale-110 transition-transform relative z-10 shadow-sm border border-theme-border">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="text-sm font-medium text-theme-text-muted">
                Reporting issue for <span className="font-extrabold text-theme-text-main">{place.name}</span>
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-theme-text-main">What's wrong?</label>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-2xl border border-theme-border bg-theme-element px-4 py-3 text-sm font-medium text-theme-text-main focus:ring-2 focus:ring-theme-border-focus focus:outline-none backdrop-blur-md transition-all"
                >
                  <option value="wrong-location">Wrong location on map</option>
                  <option value="closed">Permanently closed</option>
                  <option value="incorrect-details">Incorrect details (hours, phone)</option>
                  <option value="duplicate">Duplicate place</option>
                  <option value="spam">Spam or inappropriate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-theme-text-main">Additional notes (optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border border-theme-border bg-theme-element px-4 py-3 text-sm font-medium text-theme-text-main focus:ring-2 focus:ring-theme-border-focus focus:outline-none backdrop-blur-md min-h-[100px] transition-all placeholder-theme-placeholder"
                  placeholder="Provide any helpful details..."
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-5 py-3 font-bold text-sm text-theme-text-main liquid-glass hover:-translate-y-0.5 rounded-2xl transition-transform border border-transparent dark:border-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-5 py-3 font-bold text-sm text-theme-text-invert bg-theme-danger hover:bg-theme-danger-hover shadow-md hover:-translate-y-0.5 rounded-2xl transition-transform"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
