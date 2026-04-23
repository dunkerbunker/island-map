'use client';

import React, { useRef, useEffect, useState } from 'react';
import MapGL, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Place } from '@/types';
import { useStore } from '@/store';
import { MapPin, Landmark, TreePine, Utensils, Umbrella, Moon, Stethoscope, ShoppingCart, GraduationCap, Building, Bed } from 'lucide-react';
import useSupercluster from 'use-supercluster';
import { BBox, GeoJsonProperties } from 'geojson';
import { motion, AnimatePresence } from 'motion/react';

interface MapProps {
  places: Place[];
}

const iconMap: Record<string, React.ReactNode> = {
  banks: <Landmark size={22} />,
  parks: <TreePine size={22} />,
  restaurants: <Utensils size={22} />,
  beaches: <Umbrella size={22} />,
  mosques: <Moon size={22} />,
  medical: <Stethoscope size={22} />,
  shopping: <ShoppingCart size={22} />,
  schools: <GraduationCap size={22} />,
  government: <Building size={22} />,
  hotels: <Bed size={22} />,
  default: <MapPin size={22} />
};

const MapComponent: React.FC<MapProps> = ({ places }) => {
  const { selectedPlaceId, setSelectedPlaceId, isDarkMode } = useStore();
  const mapRef = useRef<MapRef | null>(null);

  const [bounds, setBounds] = useState<BBox | undefined>(undefined);
  const [zoom, setZoom] = useState(14);

  // Bounds for Hulhumalé to keep user focused
  const maxBounds: [number, number, number, number] = [
    73.515, 4.195, // SW
    73.565, 4.245 // NE
  ];

  // When selected place changes, fly to it
  useEffect(() => {
    if (selectedPlaceId && mapRef.current) {
      const selectedPlace = places.find(p => p.id === selectedPlaceId);
      if (selectedPlace) {
        mapRef.current.flyTo({
          center: [selectedPlace.location.lng, selectedPlace.location.lat],
          zoom: 16,
          duration: 1000
        });
      }
    }
  }, [selectedPlaceId, places]);

  // Determine map style based on theme
  const mapStyle = isDarkMode
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  const points = places.map(place => ({
    type: 'Feature' as const,
    properties: {
      cluster: false,
      placeId: place.id,
      category: place.categoryId,
      name: place.name
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [place.location.lng, place.location.lat]
    }
  }));

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 45, maxZoom: 20 }
  });

  return (
    <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: 73.5414,
          latitude: 4.2185,
          zoom: 14,
        }}
        maxBounds={maxBounds}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        onMove={evt => {
          setZoom(evt.viewState.zoom);
          if (mapRef.current) {
            const bounds = mapRef.current.getMap().getBounds();
            setBounds([
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth()
            ]);
          }
        }}
        onLoad={() => {
          if (mapRef.current) {
            setZoom(mapRef.current.getZoom());
            const bounds = mapRef.current.getMap().getBounds();
            setBounds([
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth()
            ]);
          }
        }}
        onClick={(e) => {
          // Deselect if clicking on empty map
          if (e.defaultPrevented) return;
          setSelectedPlaceId(null);
        }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties as GeoJsonProperties & { cluster?: boolean; point_count?: number };

          if (isCluster && pointCount) {
            return (
              <Marker key={`cluster-${cluster.id}`} latitude={latitude} longitude={longitude}>
                <motion.div 
                  initial={{ scale: 0, scaleX: 1.5, scaleY: 0.5, opacity: 0 }}
                  animate={{ scale: 1, scaleX: 1, scaleY: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 180, 
                    damping: 8,
                    mass: 0.9
                  }}
                  className="flex items-center justify-center bg-theme-accent text-theme-accent-text rounded-full shadow-lg ring-4 ring-theme-ring cursor-pointer"
                  style={{
                    width: `${40 + (pointCount / points.length) * 40}px`,
                    height: `${40 + (pointCount / points.length) * 40}px`,
                    fontWeight: '900',
                    fontSize: '18px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const expansionZoom = Math.min(
                      supercluster?.getClusterExpansionZoom(cluster.id as number) || 20,
                      20
                    );
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 500
                    });
                  }}
                >
                  <span className="relative z-10">{pointCount}</span>
                </motion.div>
              </Marker>
            );
          }

          const placeId = cluster.properties?.placeId;
          const isSelected = selectedPlaceId === placeId;
          const category = cluster.properties?.category || 'default';

          return (
            <Marker
              key={placeId}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent?.stopPropagation();
                setSelectedPlaceId(placeId);
              }}
              style={{ zIndex: isSelected ? 10 : 1 }}
            >
                <motion.div
                  initial={{ scale: 0, scaleX: 0.5, scaleY: 1.5, opacity: 0 }}
                  animate={{ 
                    scale: isSelected ? 1.15 : 0.9, 
                    scaleX: 1, 
                    scaleY: 1,
                    opacity: 1, 
                    y: isSelected ? -12 : 0 
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    mass: 0.7
                  }}
                  className="alias-marker-droplet relative flex flex-col items-center"
                >
                  <div 
                    className={`flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ${
                      isSelected 
                        ? 'bg-theme-accent text-theme-accent-text px-6 py-3 ring-4 ring-theme-border-focus shadow-2xl rounded-2xl' 
                        : 'w-12 h-12 liquid-glass text-theme-text-main hover:scale-110 rounded-full shadow-md'
                    }`}
                  >
                  <div className="relative z-10 font-bold shrink-0 flex items-center gap-2">
                    {iconMap[category] || iconMap.default}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }} 
                          animate={{ opacity: 1, width: 'auto' }} 
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm tracking-tight whitespace-nowrap overflow-hidden"
                        >
                          {cluster.properties?.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: -1 }}
                      exit={{ opacity: 0, scale: 0, y: -10 }}
                      className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] relative z-0 filter drop-shadow-md"
                      style={{ borderTopColor: 'var(--theme-accent)' }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Marker>
          );
        })}
      </MapGL>
    </div>
  );
};

export default MapComponent;
