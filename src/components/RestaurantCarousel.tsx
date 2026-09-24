import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Footprints, Car, Gauge } from 'lucide-react';
import { Place, UserLocation } from '../types';
import { RestaurantCard } from './RestaurantCard';

interface RestaurantCarouselProps {
  places: Place[];
  userLocation?: UserLocation | null;
  preferredMode?: 'both' | 'walking' | 'driving';
  onSelectMode?: (mode: 'both' | 'walking' | 'driving') => void;
  favorites: Record<string, boolean>;
  onToggleFavorite: (place: Place) => void;
  onSelect: (place: Place) => void;
  onVisualizeCraving: (place: Place) => void;
}

export const RestaurantCarousel: React.FC<RestaurantCarouselProps> = ({
  places,
  userLocation,
  preferredMode = 'both',
  onSelectMode,
  favorites,
  onToggleFavorite,
  onSelect,
  onVisualizeCraving,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  if (places.length === 0) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
        <h3 className="text-base font-bold text-slate-900">No restaurants found matching your criteria</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try expanding your distance or searching for a specific restaurant name like "Kada Plaza" or "Kilimanjaro".
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Verified Dining Locations
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {places.length} places
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real photos, live hours, and verified Google Maps locations
          </p>
        </div>

        {/* Transport Mode & Carousel Scroll Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onSelectMode && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onSelectMode('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  preferredMode === 'both'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show both walking and driving estimates"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xs:inline">All</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('walking')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {places.map((place) => (
          <div
            key={place.id}
            className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 snap-start"
          >
            <RestaurantCard
              place={place}
              userLocation={userLocation}
              preferredMode={preferredMode}
              onSelectMode={onSelectMode}
              isFavorite={Boolean(favorites[place.id])}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
              onVisualizeCraving={onVisualizeCraving}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
