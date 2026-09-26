import React, { useState } from 'react';
import {
  Star,
  MapPin,
  ExternalLink,
  Bookmark,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Images,
  Phone,
  Facebook,
} from 'lucide-react';
import { Place, UserLocation } from '../types';
import { getTravelEstimates } from '../utils/travelTime';
import { TransportModeBadge } from './TransportModeBadge';
import { getVerifiedVenuePhotos } from '../data/verifiedRestaurantPhotos';

interface RestaurantCardProps {
  place: Place;
  userLocation?: UserLocation | null;
  preferredMode?: 'both' | 'walking' | 'driving';
  onSelectMode?: (mode: 'walking' | 'driving') => void;
  isFavorite: boolean;
  onToggleFavorite: (place: Place) => void;
  onSelect: (place: Place) => void;
  onVisualizeCraving: (place: Place) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  place,
  userLocation,
  preferredMode = 'both',
  onSelectMode,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onVisualizeCraving,
}) => {
  const estimates = getTravelEstimates(userLocation, place);
  const [photoIndex, setPhotoIndex] = useState(0);

  const verified = getVerifiedVenuePhotos(place.name, place.cuisine, userLocation?.city || '');
  const allPhotos =
    place.photos && place.photos.length >= 6 && !place.photos[0].includes('photo-1555396273')
      ? place.photos
      : verified.photos;

  const currentPhoto = allPhotos[photoIndex] || place.photoUrl;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Photo Header with Interactive Multi-Picture Carousel */}
      <div
        className="relative h-48 sm:h-52 w-full overflow-hidden cursor-pointer bg-slate-900 select-none"
        onClick={() => onSelect(place)}
      >
        <img
          src={currentPhoto}
          alt={`${place.name} photo ${photoIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/25" />

        {/* Carousel mini arrow navigation (visible on hover) */}
        {allPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-md"
              title="Previous photo"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-md"
              title="Next photo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Multi-Photo Count Pill & Open Status */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs flex items-center gap-1 ${
                place.openNow
                  ? 'bg-emerald-600/95 text-white'
                  : 'bg-slate-800/90 text-slate-200'
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{place.openNow ? 'Open Now' : 'Closed'}</span>
            </span>

            {allPhotos.length > 1 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/85 text-white backdrop-blur-md border border-white/15 flex items-center gap-1 shadow-xs">
                <Images className="w-2.5 h-2.5 text-amber-400" />
                <span>{allPhotos.length} Photos</span>
              </span>
            )}
          </div>

          {/* Favorite Bookmark */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(place);
            }}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isFavorite
                ? 'bg-amber-500 text-white scale-110 shadow-amber-500/40'
                : 'bg-white/90 text-slate-700 hover:text-amber-600 hover:bg-white'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Distance & Verified Badge */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs text-white pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm border border-white/20 flex items-center gap-1 text-[10px]">
              <MapPin className="w-3 h-3 text-amber-400" />
              {estimates.distanceFormatted}
            </span>
            <span className="font-semibold px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-sm text-[9px] flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Google Verified
            </span>
          </div>
          <span className="font-bold text-amber-300 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm border border-white/20 text-[11px]">
            {place.priceText}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelect(place)}
              className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
            >
              {place.name}
            </h3>
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-bold text-amber-800">{place.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-500">({place.userRatingsTotal})</span>
            </div>
          </div>

          {/* Cuisine & Social Handles */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-amber-700 font-semibold truncate">
              {place.cuisine}
            </p>
            {place.facebookHandle && (
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0 flex items-center gap-0.5">
                <Facebook className="w-2.5 h-2.5" />
                <span className="truncate max-w-[80px]">{place.facebookHandle}</span>
              </span>
            )}
          </div>

          {/* Address */}
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {place.address}
          </p>

          {/* Highlights tags */}
          {place.highlights && place.highlights.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              {place.highlights.slice(0, 2).map((h, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Transport Mode Indicators: Walk & Drive with travel time estimates */}
          <div className="mt-3">
            <TransportModeBadge
              estimates={estimates}
              preferredMode={preferredMode}
              onSelectMode={onSelectMode}
            />
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => onVisualizeCraving(place)}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 transition-colors bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 cursor-pointer"
            title="Generate AI preview visualization of signature dishes"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>AI Dish View</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelect(place)}
              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Gallery & Info
            </button>
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg font-medium"
              title="Open in Google Maps"
            >
              <span>Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
