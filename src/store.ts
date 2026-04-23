import { create } from 'zustand';
import { Place } from '@/types';

interface MapState {
  selectedPlaceId: string | null;
  searchQuery: string;
  selectedCategoryId: string;
  isDarkMode: boolean;
  userLocation: { lat: number; lng: number } | null;
  nearbyMode: boolean;
  
  setSelectedPlaceId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (id: string) => void;
  toggleDarkMode: () => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  setNearbyMode: (mode: boolean) => void;
}

export const useStore = create<MapState>((set) => ({
  selectedPlaceId: null,
  searchQuery: '',
  selectedCategoryId: 'all',
  isDarkMode: false,
  userLocation: null,
  nearbyMode: false,
  
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setNearbyMode: (mode) => set({ nearbyMode: mode }),
}));
