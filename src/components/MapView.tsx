import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place, UserLocation } from '../types';
import { getTravelEstimates } from '../utils/travelTime';

interface MapViewProps {
  places: Place[];
  userLocation: UserLocation;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  userLocation,
  selectedPlace,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 14,
        zoomControl: false,
      });

      // Add Zoom Control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Light modern map tiles (CartoDB Voyager)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // 1. User Location Pin (pulsing emerald blue)
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 24px; height: 24px; border-radius: 9999px; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-weight: 700; color: #059669; font-size: 13px;">Your Location</div><div style="color: #64748b; font-size: 11px;">${userLocation.city}</div>`
      );

    // 2. Restaurant Markers
    const bounds = L.latLngBounds([[userLocation.latitude, userLocation.longitude]]);

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const markerColor = isSelected ? '#d97706' : '#ea580c';

      const icon = L.divIcon({
        className: 'custom-venue-pin',
        html: `
          <div style="
            background: ${markerColor};
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid white;
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            <span>★ ${place.rating.toFixed(1)}</span>
            <span style="font-weight: 600;">${place.name.slice(0, 16)}</span>
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .on('click', () => {
          onSelectPlace(place);
        });

      const estimates = getTravelEstimates(userLocation, place);

      marker.bindPopup(`
        <div style="width: 220px; font-family: sans-serif;">
          <img src="${place.photoUrl}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${place.name}</div>
          <div style="font-size: 11px; color: #d97706; margin-top: 2px; font-weight: 600;">${place.cuisine} · ${place.priceText} · ★ ${place.rating.toFixed(1)}</div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a href="${estimates.walkDirectionsUrl}" target="_blank" style="flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 4px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; text-decoration: none; text-align: center;">
              🚶 ${estimates.walkBadge}
            </a>
            <a href="${estimates.driveDirectionsUrl}" target="_blank" style="flex: 1; background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; padding: 4px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; text-decoration: none; text-align: center;">
              🚗 ${estimates.driveBadge}
            </a>
          </div>
          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: #64748b;">${estimates.distanceFormatted} away</span>
            <a href="${place.googleMapsUrl}" target="_blank" style="font-size: 10px; font-weight: 700; color: #d97706; text-decoration: underline;">Google Maps &rarr;</a>
          </div>
        </div>
      `);

      markersRef.current[place.id] = marker;
      bounds.extend([place.lat, place.lng]);
    });

    if (places.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [places, userLocation, selectedPlace, onSelectPlace]);

  // Center on selected place when changed
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedPlace.lat, selectedPlace.lng], 16, {
        animate: true,
      });
      const marker = markersRef.current[selectedPlace.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedPlace]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
