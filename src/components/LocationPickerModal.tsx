import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Search,
  Check,
  Globe,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { UserLocation } from '../types';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
  onDetectGPS: () => void;
}

const PRESET_LOCATIONS: { name: string; state: string; country: string; lat: number; lng: number; tag: string }[] = [
  {
    name: 'Benin City',
    state: 'Edo State',
    country: 'Nigeria',
    lat: 6.3350,
    lng: 5.6037,
    tag: 'Sapele Rd · GRA · Airport Rd · Kada Plaza',
  },
  {
    name: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    lat: 6.5244,
    lng: 3.3792,
    tag: 'Victoria Island · Lekki · Ikeja',
  },
  {
    name: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    lat: 9.0765,
    lng: 7.3986,
    tag: 'Maitama · Wuse 2 · Garki',
  },
  {
    name: 'Port Harcourt',
    state: 'Rivers State',
    country: 'Nigeria',
    lat: 4.8156,
    lng: 7.0498,
    tag: 'Old GRA · Peter Odili · Trans Amadi',
  },
  {
    name: 'London',
    state: 'England',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    tag: 'Soho · Covent Garden · Shoreditch',
  },
  {
    name: 'New York City',
    state: 'NY',
    country: 'United States',
    lat: 40.7128,
    lng: -74.0060,
    tag: 'Manhattan · Brooklyn · Queens',
  },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onDetectGPS,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    setSearching(true);
    setErrorMsg('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        setErrorMsg(`No locations found for "${query}". Try adding a country or city name.`);
        setSearchResults([]);
      }
    } catch {
      setErrorMsg('Failed to lookup location. Please check your network connection.');
    } finally {
      setSearching(false);
    }
  };

  const handlePickResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.suburb || item.display_name.split(',')[0];
    const state = addr.state || addr.province || '';
    const country = addr.country || '';
    const formatted = [city, state, country].filter(Boolean).join(', ');

    onSelectLocation({
      latitude: lat,
      longitude: lng,
      city: formatted || item.display_name,
      isCustom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Discovery Location</h3>
              <p className="text-xs text-slate-500">
                Current: <span className="text-amber-800 font-bold">{currentLocation.city}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Live GPS Detection Button */}
          <button
            type="button"
            onClick={() => {
              onDetectGPS();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 hover:bg-emerald-100/70 text-emerald-950 transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-emerald-800 font-extrabold">
                  Recommended
                </span>
                <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                  Detect Live GPS Location
                </span>
                <p className="text-[11px] text-emerald-700">
                  Uses exact device GPS for hyper-accurate local restaurants
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
              Live GPS
            </span>
          </button>

          {/* Search any city in the world */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Search Any City or Area Worldwide
            </label>
            <form onSubmit={handleGlobalSearch} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. Benin City, Lagos, London, Abuja, Toronto..."
                className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>
          </div>

          {/* Search Results list */}
          {searchResults.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-500">Matching Cities</span>
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handlePickResult(res)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 block truncate">
                      {res.display_name.split(',')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {res.display_name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    Select
                  </span>
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}

          {/* Preset Popular Hubs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Quick Popular Hubs
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_LOCATIONS.map((loc) => {
                const isSelected = currentLocation.city.toLowerCase().includes(loc.name.toLowerCase());
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        latitude: loc.lat,
                        longitude: loc.lng,
                        city: `${loc.name}, ${loc.state}, ${loc.country}`,
                        isCustom: true,
                      });
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{loc.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({loc.country})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {loc.tag}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
