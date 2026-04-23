'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store';
import { mockPlaces } from '../data/places';
import MapComponent from '../components/Map';
import FilterBar from '../components/FilterBar';
import PlaceDetail from '../components/PlaceDetail';
import ReportModal from '../components/ReportModal';
import { Place } from '../types';
import { calculateDistance, cn, useMediaQuery } from '../lib/utils';
import { Compass, Moon, Sun } from 'lucide-react';
import { Drawer } from 'vaul';

export default function Home() {
  const { 
    selectedPlaceId, 
    setSelectedPlaceId, 
    searchQuery, 
    setSearchQuery,
    selectedCategoryId, 
    setSelectedCategoryId,
    userLocation, 
    setUserLocation,
    nearbyMode,
    setNearbyMode,
    isDarkMode,
    toggleDarkMode
  } = useStore();

  const [reportPlace, setReportPlace] = useState<Place | null>(null);
  
  // Setup responsive layout boolean
  const isMobile = useMediaQuery('(max-width: 639px)');

  // Sync URL to state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('place');
    if (placeId) {
      setSelectedPlaceId(placeId);
    }
  }, [setSelectedPlaceId]);

  // Sync state to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedPlaceId) {
      url.searchParams.set('place', selectedPlaceId);
    } else {
      url.searchParams.delete('place');
    }
    window.history.pushState({}, '', url);
  }, [selectedPlaceId]);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setNearbyMode(true);
        },
        (error) => {
          console.error("Location error:", error);
          alert("Could not get your location. Please check permissions.");
        }
      );
    }
  };

  const filteredPlaces = useMemo(() => {
    let result = mockPlaces;

    if (selectedCategoryId !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategoryId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }

    if (nearbyMode && userLocation) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        return distA - distB;
      });
    }

    return result;
  }, [searchQuery, selectedCategoryId, userLocation, nearbyMode]);

  const selectedPlace = useMemo(() => 
    mockPlaces.find(p => p.id === selectedPlaceId) || null, 
  [selectedPlaceId]);

  return (
    <div className="w-full h-screen overflow-hidden bg-theme-bg text-theme-text-main font-sans relative select-none">
      
      {/* Main Map Area */}
      <div className="absolute inset-0 z-0">
        <MapComponent places={filteredPlaces} />
      </div>
      
      <FilterBar />
      
      {/* Overlay Controls */}
      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex gap-3 z-10">
        <button 
          onClick={toggleDarkMode}
          className="w-12 h-12 liquid-glass rounded-full flex items-center justify-center text-theme-text-main hover:scale-105 transition-all shadow-lg"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          onClick={requestLocation}
          className={cn(
             "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 liquid-overlay",
             nearbyMode 
               ? "bg-theme-accent text-theme-accent-text" 
               : "liquid-glass text-theme-text-main"
          )}
          style={{
            boxShadow: nearbyMode ? `0 4px 16px var(--theme-glow)` : undefined
          }}
          aria-label="Use My Location"
        >
          <Compass size={20} />
        </button>
      </div>
      
      {/* Empty State Overlay if no results */}
      {filteredPlaces.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4">
          <div className="liquid-glass px-6 py-4 rounded-3xl shadow-2xl text-center pointer-events-auto border-theme-border border">
            <p className="text-theme-text-main font-semibold pb-2">No places found</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
              }}
              className="text-theme-text-muted text-sm font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Sidebar / Bottom Sheet */}
      {selectedPlace && (
        isMobile ? (
          <Drawer.Root 
            open={!!selectedPlace} 
            onOpenChange={(open) => !open && setSelectedPlaceId(null)}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-40 transition-opacity" />
              <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[2rem] liquid-glass outline-none h-[85vh] border-t border-theme-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-theme-drawer-line mt-4 mb-2 z-10 relative" />
                <Drawer.Title className="sr-only">{selectedPlace.name}</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Details about {selectedPlace.name} in Hulhumalé.
                </Drawer.Description>
                <div className="flex-1 overflow-y-auto w-full">
                  <PlaceDetail 
                    place={selectedPlace} 
                    onClose={() => setSelectedPlaceId(null)} 
                    onReport={setReportPlace}
                    isMobile={true}
                  />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ) : (
          <div className="absolute bottom-6 right-6 w-[380px] z-20">
            <PlaceDetail 
              place={selectedPlace} 
              onClose={() => setSelectedPlaceId(null)} 
              onReport={setReportPlace}
              isMobile={false}
            />
          </div>
        )
      )}

      {/* Report Modal */}
      {reportPlace && (
        <ReportModal 
          place={reportPlace} 
          isOpen={true} 
          onClose={() => setReportPlace(null)} 
        />
      )}
    </div>
  );
}
