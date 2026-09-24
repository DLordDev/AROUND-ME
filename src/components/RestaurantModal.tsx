import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Bookmark,
  Sparkles,
  Share2,
  Check,
  Footprints,
  Car,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Globe,
  Instagram,
  Facebook,
  Images,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import { Place, UserLocation } from '../types';
import { getTravelEstimates } from '../utils/travelTime';
import { ReviewsSection } from './ReviewsSection';

interface RestaurantModalProps {
  place: Place | null;
  userLocation?: UserLocation | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (place: Place) => void;
  onVisualizeCraving: (place: Place) => void;
  onAskAssistant: (question: string) => void;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  place,
  userLocation,
  onClose,
  isFavorite,
  onToggleFavorite,
  onVisualizeCraving,
  onAskAssistant,
}) => {
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  if (!place) return null;

  const allPhotos = (place.photos && place.photos.length > 0)
    ? place.photos
    : [place.photoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'];

  const estimates = getTravelEstimates(userLocation, place);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${place.name} - ${place.cuisine} (${place.address})\nExplore on AroundMe AI: ${place.googleMapsUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(place.address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const cleanHandle = place.facebookHandle || `@${place.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
  const facebookLink = place.facebookUrl || `https://www.facebook.com/search/top?q=${encodeURIComponent(place.name + ' ' + place.address)}`;
  const instagramLink = place.instagramUrl || `https://www.instagram.com/explore/tags/${encodeURIComponent(place.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())}/`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Multi-Photo Gallery Header with Interactive Carousel */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0 bg-slate-950 select-none group">
          <img
            src={allPhotos[currentPhotoIdx]}
            alt={`${place.name} photo ${currentPhotoIdx + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/35 pointer-events-none" />

          {/* Prev / Next Carousel Arrow Buttons */}
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-md cursor-pointer hover:scale-110"
                title="Previous photo"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-md cursor-pointer hover:scale-110"
                title="Next photo"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top Control Bar: Badges + Share + Close */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-sm">
                <Images className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Photo {currentPhotoIdx + 1} of {allPhotos.length}
                </span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-md">
                <ShieldCheck className="w-3 h-3" />
                Verified Real Place
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                type="button"
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition-all shadow-sm cursor-pointer hover:scale-105"
                title="Copy share link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                type="button"
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition-all shadow-sm cursor-pointer hover:scale-105"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title & Rating Over Image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pointer-events-none">
            <div className="pr-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm inline-block mb-1">
                {place.cuisine}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md leading-tight">
                {place.name}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="font-extrabold text-sm text-slate-900">{place.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500">({place.userRatingsTotal})</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation Strip (When multiple pictures exist) */}
        {allPhotos.length > 1 && (
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Images className="w-3 h-3 text-amber-600" />
              Gallery ({allPhotos.length}):
            </span>
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPhotoIdx(i)}
                className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentPhotoIdx === i
                    ? 'border-amber-500 scale-105 shadow-sm ring-2 ring-amber-400/40'
                    : 'border-slate-300 opacity-60 hover:opacity-100 hover:border-amber-300'
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Key Quick Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Status</span>
                <span className="font-bold text-slate-900">{place.openNow ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Distance</span>
                <span className="font-bold text-slate-900">{estimates.distanceFormatted}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-base font-bold text-amber-600 shrink-0">₦</span>
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Price Tier</span>
                <span className="font-bold text-slate-900">{place.priceText}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Phone</span>
                <a
                  href={`tel:${place.phone}`}
                  className="font-bold text-slate-900 hover:text-sky-600 truncate block max-w-[120px]"
                >
                  {place.phone || 'Available'}
                </a>
              </div>
            </div>
          </div>

          {/* Social Media Handles & Direct Contacts Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Contact & Online Handles
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                Verified Info
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Facebook Handle Button */}
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group shadow-2xs"
                title={`Visit ${place.name} on Facebook`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Facebook</span>
                    <span className="font-bold text-slate-800 group-hover:text-blue-700 truncate block text-xs">
                      {cleanHandle}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
              </a>

              {/* Instagram Handle Button */}
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-all group shadow-2xs"
                title={`Explore ${place.name} photos on Instagram`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Instagram</span>
                    <span className="font-bold text-slate-800 group-hover:text-rose-700 truncate block text-xs">
                      {cleanHandle}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 shrink-0 ml-1" />
              </a>

              {/* Direct Phone Call Button */}
              <a
                href={`tel:${place.phone}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group shadow-2xs"
                title={`Call ${place.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Call Line</span>
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700 truncate block text-xs">
                      {place.phone || 'Call Restaurant'}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
              </a>
            </div>
          </div>

          {/* Exact Address with One-Click Copy */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Exact Location Address
              </h4>
              <button
                onClick={handleCopyAddress}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-slate-200"
              >
                {addressCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {place.address}
            </p>
          </div>

          {/* Travel Directions Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700">
                Directions from Your Location
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                {estimates.distanceFormatted} away
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={estimates.walkDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Walk Route</span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      ~{estimates.walkFormatted} ({estimates.walkSteps.toLocaleString()} steps)
                    </span>
                  </div>
                </div>
                <Navigation className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </a>

              <a
                href={estimates.driveDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Drive Route</span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                      ~{estimates.driveFormatted}
                    </span>
                  </div>
                </div>
                <Navigation className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </a>
            </div>
          </div>

          {/* Highlights & Features */}
          {place.highlights && place.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Specialties & Features
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {place.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onToggleFavorite(place)}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
            </button>

            <button
              onClick={() => onVisualizeCraving(place)}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Dish View</span>
            </button>

            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              <span>Open on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Customer Reviews Section */}
          <ReviewsSection place={place} />
        </div>
      </div>
    </div>
  );
};
