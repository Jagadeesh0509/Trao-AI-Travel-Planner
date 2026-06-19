'use client';

import { useEffect, useRef, useState } from 'react';
import { Trip } from '@/types';

interface MapComponentProps {
  trip: Trip;
}

export default function MapComponent({ trip }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = all days
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current || !trip.mapMarkers || trip.mapMarkers.length === 0) return;

    // Dynamically import Leaflet only on the client side
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Clear previous map if it exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Filter markers based on selected day
      const markers = trip.mapMarkers || [];
      const filteredMarkers = markers.filter(
        (m) => selectedDay === 0 || m.type === 'hotel' || m.dayNumber === selectedDay
      );

      if (filteredMarkers.length === 0) return;

      // Find average lat/lng to center map
      const avgLat = filteredMarkers.reduce((sum, m) => sum + m.lat, 0) / filteredMarkers.length;
      const avgLng = filteredMarkers.reduce((sum, m) => sum + m.lng, 0) / filteredMarkers.length;

      if (!mapContainerRef.current) return;
      // Create map instance
      const map = L.map(mapContainerRef.current).setView([avgLat, avgLng], 13);
      mapInstanceRef.current = map;

      // Add dark-themed CartoDB Voyager map tiles (looks very luxurious and dark-mode friendly!)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Create Custom SVG Pins
      const createCustomIcon = (color: string, numberText?: string) => {
        return L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.71573 0 0 6.71573 0 15C0 24.375 12.8571 36.5625 14.1964 37.7679C14.6429 38.0714 15.3571 38.0714 15.8036 37.7679C17.1429 36.5625 30 24.375 30 15C30 6.71573 23.2843 0 15 0Z" fill="${color}"/>
                <circle cx="15" cy="15" r="7" fill="#0b0f19" />
              </svg>
              ${numberText ? `<span class="absolute top-[8px] text-[10px] font-black text-white">${numberText}</span>` : ''}
            </div>
          `,
          className: 'custom-leaflet-icon',
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          popupAnchor: [0, -35]
        });
      };

      const hotelIcon = createCustomIcon('#eab308'); // gold for hotel
      const activityIcon = (day: number) => createCustomIcon('#6366f1', day.toString()); // indigo with day number for activities

      markersRef.current = [];
      const latLngsForRoute: [number, number][] = [];

      filteredMarkers.forEach((marker) => {
        const isHotel = marker.type === 'hotel';
        const icon = isHotel ? hotelIcon : activityIcon(marker.dayNumber || 1);

        const mapMarker = L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="color: #0b0f19; font-family: sans-serif; font-size: 13px; font-weight: 600; padding: 4px;">
              <div style="font-size: 10px; color: ${isHotel ? '#a16207' : '#4f46e5'}; text-transform: uppercase; margin-bottom: 2px;">
                ${isHotel ? '🏨 Recommended Hotel' : `📅 Day ${marker.dayNumber} Activity`}
              </div>
              <div style="font-weight: 700; color: #1e293b;">${marker.name}</div>
            </div>
          `);

        markersRef.current.push(mapMarker);

        // Only include activities in route line (day-wise route visualization)
        if (!isHotel) {
          latLngsForRoute.push([marker.lat, marker.lng]);
        }
      });

      // Fit map bounds to show all markers
      if (filteredMarkers.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      }

      // Draw polyline route connecting activities
      if (latLngsForRoute.length > 1) {
        const polyline = L.polyline(latLngsForRoute, {
          color: '#818cf8',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(map);

        // Add a smooth dash animation using custom class or CSS style
        const path = polyline.getElement();
        if (path) {
          path.classList.add('animate-dash');
        }
        polylineRef.current = polyline;
      }
    };

    initMap();

    // Clean up
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip, selectedDay, isMounted]);

  if (!isMounted) {
    return (
      <div className="w-full h-[450px] bg-white/3 rounded-2xl flex items-center justify-center border border-white/5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading map components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🗺️ Interactive Route Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize your hotel and day-by-day sightseeing destinations.
          </p>
        </div>

        {/* Day selection pill tabs */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-white/5 border border-white/5 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedDay === 0
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Days
          </button>
          {Array.from({ length: trip.durationDays }, (_, i) => i + 1).map((dayNum) => (
            <button
              key={dayNum}
              onClick={() => setSelectedDay(dayNum)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedDay === dayNum
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Day {dayNum}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet map wrapper */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <div ref={mapContainerRef} className="w-full h-[450px] z-10" />
        
        {/* Map Legend overlay */}
        <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-[#0b0f19]/90 border border-white/10 backdrop-blur-md flex flex-col gap-2 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 inline-block border border-yellow-300" />
            <span className="text-[11px] font-bold text-slate-200">Recommended Hotels</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 inline-block border border-indigo-300" />
            <span className="text-[11px] font-bold text-slate-200">Trip Activities</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 border-t border-dashed border-indigo-400 inline-block" />
            <span className="text-[11px] font-bold text-slate-200">Route Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
