import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Place, UserLocation } from '../types';
import { getTravelEstimates } from '../utils/travelTime';
import { fetchRoutePath, RouteData } from '../utils/routeService';
import { Footprints, Car, X, ExternalLink, Navigation2, Loader2, Sparkles } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  userLocation: UserLocation;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onOpenDetails?: (place: Place) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  userLocation,
  selectedPlace,
  onSelectPlace,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routeLayersRef = useRef<L.Layer[]>([]);

  const [routeMode, setRouteMode] = useState<'walking' | 'driving'>('walking');
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

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
  }, []);

  // Update center if user location changes and no place is selected
  useEffect(() => {
    if (mapInstanceRef.current && !selectedPlace) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
    }
  }, [userLocation.latitude, userLocation.longitude]);

  // Render Markers (User and Places)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // 1. User Location Pin (pulsing emerald badge)
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="position: relative; width: 26px; height: 26px;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(16, 185, 129, 0.45); animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 26px; height: 26px; border-radius: 9999px; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 800;">
            📍
          </div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; padding: 2px;">
          <div style="font-weight: 800; color: #059669; font-size: 13px;">Your Location</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${userLocation.city}</div>
        </div>`
      );
    markersRef.current['__user__'] = userMarker;

    // 2. Restaurant Markers
    const bounds = L.latLngBounds([[userLocation.latitude, userLocation.longitude]]);

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const markerColor = isSelected ? '#b45309' : '#ea580c';

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
            <span style="font-weight: 600;">${place.name.slice(0, 15)}</span>
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
        <div style="width: 230px; font-family: sans-serif;">
          <img src="${place.photoUrl}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${place.name}</div>
          <div style="font-size: 11px; color: #d97706; margin-top: 2px; font-weight: 600;">${place.cuisine} · ${place.priceText} · ★ ${place.rating.toFixed(1)}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">📍 ${place.address}</div>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <div style="flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 4px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; text-align: center;">
              🚶 ${estimates.walkBadge}
            </div>
            <div style="flex: 1; background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; padding: 4px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; text-align: center;">
              🚗 ${estimates.driveBadge}
            </div>
          </div>
          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; pt-2;">
            <span style="font-size: 10px; color: #64748b;">${estimates.distanceFormatted} away</span>
            <a href="${place.googleMapsUrl}" target="_blank" style="font-size: 10px; font-weight: 700; color: #d97706; text-decoration: underline;">Google Maps &rarr;</a>
          </div>
        </div>
      `);

      markersRef.current[place.id] = marker;
      bounds.extend([place.lat, place.lng]);
    });

    // If no route is active and we have places, fit all bounds
    if (!selectedPlace && places.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [places, userLocation, selectedPlace, onSelectPlace]);

  // Draw Route whenever selectedPlace or routeMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous route polylines
    routeLayersRef.current.forEach((layer) => layer.remove());
    routeLayersRef.current = [];

    if (!selectedPlace) {
      setActiveRoute(null);
      return;
    }

    let isCancelled = false;
    setRouteLoading(true);

    fetchRoutePath(
      userLocation.latitude,
      userLocation.longitude,
      selectedPlace.lat,
      selectedPlace.lng,
      routeMode
    )
      .then((route) => {
        if (isCancelled || !mapInstanceRef.current) return;
        setActiveRoute(route);
        setRouteLoading(false);

        const latLngs = route.coordinates;
        if (latLngs.length === 0) return;

        // Draw layered polylines based on mode
        if (routeMode === 'driving') {
          // Driving: Strong navy road casing with vibrant sapphire center
          const casing = L.polyline(latLngs, {
            color: '#1e293b',
            weight: 7,
            opacity: 0.7,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(mapInstanceRef.current);

          const inner = L.polyline(latLngs, {
            color: '#2563eb',
            weight: 4.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(mapInstanceRef.current);

          routeLayersRef.current.push(casing, inner);
        } else {
          // Walking: Emerald path with energetic dash pattern
          const glow = L.polyline(latLngs, {
            color: '#064e3b',
            weight: 7,
            opacity: 0.35,
            lineCap: 'round',
          }).addTo(mapInstanceRef.current);

          const inner = L.polyline(latLngs, {
            color: '#10b981',
            weight: 4,
            opacity: 1,
            dashArray: '7, 9',
            lineCap: 'round',
          }).addTo(mapInstanceRef.current);

          routeLayersRef.current.push(glow, inner);
        }

        // Add a midway route badge tag on map
        const midIdx = Math.floor(latLngs.length / 2);
        const midPoint = latLngs[midIdx];
        if (midPoint) {
          const badgeIcon = L.divIcon({
            className: 'route-eta-badge',
            html: `
              <div style="
                background: ${routeMode === 'walking' ? '#065f46' : '#1e40af'};
                color: white;
                font-size: 10px;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 12px;
                border: 2px solid white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <span>${routeMode === 'walking' ? '🚶' : '🚗'} ${route.durationFormatted}</span>
                <span style="opacity: 0.8; font-weight: 500;">(${route.distanceFormatted})</span>
              </div>
            `,
            iconSize: [90, 24],
            iconAnchor: [45, 12],
          });

          const badgeMarker = L.marker(midPoint, { icon: badgeIcon }).addTo(mapInstanceRef.current);
          routeLayersRef.current.push(badgeMarker);
        }

        // Auto-fit to view both user location and destination route
        const routeBounds = L.latLngBounds(latLngs);
        routeBounds.extend([userLocation.latitude, userLocation.longitude]);
        routeBounds.extend([selectedPlace.lat, selectedPlace.lng]);
        mapInstanceRef.current.fitBounds(routeBounds, {
          padding: [70, 70],
          maxZoom: 16,
        });

        // Open popup on destination marker
        const marker = markersRef.current[selectedPlace.id];
        if (marker) {
          marker.openPopup();
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error drawing route on Leaflet:', err);
          setRouteLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedPlace, routeMode, userLocation.latitude, userLocation.longitude]);

  const handleClearRoute = () => {
    routeLayersRef.current.forEach((layer) => layer.remove());
    routeLayersRef.current = [];
    setActiveRoute(null);
    onSelectPlace(null);

    // Reset view to bounds of all places
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([[userLocation.latitude, userLocation.longitude]]);
      places.forEach((p) => bounds.extend([p.lat, p.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-2 sm:my-3">
      <div className="relative w-full h-[520px] sm:h-[560px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Top Route / Mode Navigation Bar */}
        <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-[1000] max-w-lg">
          {selectedPlace ? (
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-3.5 shadow-lg border border-slate-200/90 text-slate-800 space-y-2.5 transition-all">
              {/* Header with Title & Close */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <Navigation2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {selectedPlace.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedPlace.cuisine} · {selectedPlace.address}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearRoute}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  title="Clear Route Path"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Walking vs Driving Mode Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold border border-slate-200 flex-1">
                  <button
                    type="button"
                    onClick={() => setRouteMode('walking')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md transition-all cursor-pointer ${
                      routeMode === 'walking'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Walking Path</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRouteMode('driving')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md transition-all cursor-pointer ${
                      routeMode === 'driving'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Driving Path</span>
                  </button>
                </div>
              </div>

              {/* Route Summary & External Nav Action */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                {routeLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Calculating real path...</span>
                  </div>
                ) : activeRoute ? (
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {activeRoute.durationFormatted}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">
                      {activeRoute.distanceFormatted}
                    </span>
                    {activeRoute.isFallback && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        est.
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500">Ready to route</span>
                )}

                <div className="flex items-center gap-2">
                  {onOpenDetails && (
                    <button
                      type="button"
                      onClick={() => onOpenDetails(selectedPlace)}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                    >
                      Photos & Reviews
                    </button>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${selectedPlace.lat},${selectedPlace.lng}&travelmode=${routeMode === 'walking' ? 'walking' : 'driving'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    <span>Google Maps Navigation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-xl px-3.5 py-2 shadow-md border border-slate-200/90 text-xs text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                <strong>Interactive Map:</strong> Click any restaurant to draw walking or driving directions from your location.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
