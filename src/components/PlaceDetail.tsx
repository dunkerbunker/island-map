'use client';

import React, { useState } from 'react';
import { Place } from '@/types';
import { useStore } from '@/store';
import { X, Navigation, Share2, AlertTriangle, Phone, Clock, MapPin, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { generateGoogleMapsDirectionsUrl, copyDeepLink } from '@/lib/utils';
import { categories } from '@/data/places';

interface PlaceDetailProps {
  place: Place;
  onClose: () => void;
  onReport: (place: Place) => void;
  isMobile?: boolean;
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ place, onClose, onReport, isMobile }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    copyDeepLink(place.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryLabel = categories.find(c => c.id === place.categoryId)?.label || 'Place';

  const containerClasses = isMobile 
    ? "w-full flex flex-col pointer-events-auto pb-4"
    : "liquid-glass w-full sm:h-auto sm:max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto border-t border-theme-border";

  return (
    <div className={containerClasses}>
      
      {/* Visual Header / Cover Photo */}
      <div className="h-48 sm:h-56 bg-theme-image-bg relative flex-shrink-0">
        {place.imageUrl ? (
          <img 
            src={place.imageUrl} 
            alt={place.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-theme-text-muted">
            <span className="text-sm font-bold">No photo available</span>
          </div>
        )}
        
        {/* Gradient Overlay for better contrast if image exists */}
        {place.imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-cover-overlay)] to-transparent pointer-events-none" />
        )}

        {!isMobile && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-theme-text-main hover:scale-110 transition-transform shadow-sm"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className={`p-6 flex flex-col flex-1 ${!isMobile ? 'overflow-y-auto' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {place.verified && (
                <span className="flex items-center gap-1 bg-theme-element text-theme-text-main px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-theme-border">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-theme-text-main leading-tight tracking-tight drop-shadow-sm">{place.name}</h2>
            <span className="inline-block px-3 py-1 bg-theme-element text-theme-text-main rounded-full text-[10px] font-bold uppercase whitespace-nowrap mt-2 backdrop-blur-md border border-theme-border">
              {categoryLabel}
            </span>
          </div>
        </div>

        <p className="text-theme-text-main text-sm my-5 leading-relaxed font-bold">
          {place.description}
        </p>
        
        <div className="space-y-4 text-sm mt-auto">
          <div className="flex items-start text-sm text-theme-text-main font-bold">
            <MapPin size={16} className="mr-3 mt-0.5 flex-shrink-0 text-theme-text-muted" />
            <span>{place.address}</span>
          </div>

          {place.openingHours && (
            <div className="flex items-start text-sm text-theme-text-main font-bold">
              <Clock size={16} className="mr-3 mt-0.5 flex-shrink-0 text-theme-text-muted" />
              <span>{place.openingHours}</span>
            </div>
          )}

          {place.phone && (
            <div className="flex items-start text-sm text-theme-text-main font-bold">
              <Phone size={16} className="mr-3 mt-0.5 flex-shrink-0 text-theme-text-muted" />
              <a href={`tel:${place.phone}`} className="hover:text-theme-text-muted transition-colors">
                {place.phone}
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-6 mt-6">
          <a
            href={generateGoogleMapsDirectionsUrl(place.location.lat, place.location.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-theme-accent text-theme-accent-text py-3 rounded-2xl font-bold text-sm hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 border border-transparent"
            style={{ boxShadow: `0 4px 16px var(--theme-glow)` }}
          >
            <Navigation size={18} />
            Directions
          </a>
          <button
            onClick={handleShare}
            className="flex-1 liquid-glass border border-theme-border py-3 rounded-2xl font-bold text-sm text-theme-text-main hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 shadow-sm"
          >
            {copied ? <CheckCircle2 size={18} className="text-theme-text-main" /> : <Share2 size={18} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        <div className="pt-4 border-t border-theme-border flex justify-between items-center mt-auto">
          <div className="text-[10px] text-theme-text-muted uppercase font-bold tracking-widest">Incorrect details?</div>
          <button 
            onClick={() => onReport(place)}
            className="text-[10px] text-theme-danger font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            <AlertTriangle size={12} />
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
