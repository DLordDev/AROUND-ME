import React from 'react';
import { Footprints, Car, Gauge } from 'lucide-react';
import { Place, UserLocation } from '../types';
import { RestaurantCard } from './RestaurantCard';

interface ListViewProps {
  places: Place[];
  userLocation?: UserLocation | null;
  preferredMode?: 'both' | 'walking' | 'driving';
  onSelectMode?: (mode: 'both' | 'walking' | 'driving') => void;
  favorites: Record<string, boolean>;
  onToggleFavorite: (place: Place) => void;
  onSelect: (place: Place) => void;
  onVisualizeCraving: (place: Place) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  places,
  userLocation,
  preferredMode = 'both',
  onSelectMode,
  favorites,
  onToggleFavorite,
  onSelect,
  onVisualizeCraving,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-2 sm:my-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">All Verified Restaurants</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {places.length} places
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Exact Google Maps locations with travel times, live hours, and photos
          </p>
        </div>

        {/* Transport Mode Toggle */}
        {onSelectMode && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onSelectMode('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                preferredMode === 'both'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show both walking and driving estimates"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-600" />
              <span>All Modes</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('walking')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                preferredMode === 'walking'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
              title="Highlight walking estimates"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('driving')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                preferredMode === 'driving'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
              title="Highlight driving estimates"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {places.map((place) => (
          <RestaurantCard
            key={place.id}
            place={place}
            userLocation={userLocation}
            preferredMode={preferredMode}
            onSelectMode={(mode) => onSelectMode?.(mode)}
            isFavorite={Boolean(favorites[place.id])}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelect}
            onVisualizeCraving={onVisualizeCraving}
          />
        ))}
      </div>
    </div>
  );
};
