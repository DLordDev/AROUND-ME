import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  MicOff,
  SlidersHorizontal,
  Map,
  List,
  Sparkles,
  Compass,
  Globe,
  BrainCircuit,
  X,
  Volume2,
  VolumeX,
  Store,
  LayoutGrid,
  MapPin,
} from 'lucide-react';
import { SearchFilterState, UserLocation } from '../types';

interface HeroSearchProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (customQuery?: string) => void;
  loading: boolean;
  viewMode: 'carousel' | 'map' | 'list';
  setViewMode: (mode: 'carousel' | 'map' | 'list') => void;
  searchMode: 'maps' | 'search' | 'thinking';
  setSearchMode: (mode: 'maps' | 'search' | 'thinking') => void;
  filters: SearchFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  userLocation?: UserLocation;
  onQuickSwitchLocation?: (city: string, lat: number, lng: number) => void;
  onOpenLocationModal?: () => void;
}

const SUGGESTED_CHIPS = [
  'Good food & dining',
  'Ice cream around me',
  'Kada Plaza Restaurant',
  'Mat-Ice Ice Cream & Bakery',
  'Kilimanjaro',
  'Chicken Republic',
  'The Secret Garden',
  'Shawarma & Grills',
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  query,
  setQuery,
  onSearch,
  loading,
  viewMode,
  setViewMode,
  searchMode,
  setSearchMode,
  filters,
  setFilters,
  isVoiceActive,
  setIsVoiceActive,
  voiceEnabled,
  setVoiceEnabled,
  userLocation,
  onQuickSwitchLocation,
  onOpenLocationModal,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API for optional voice recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceActive(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setQuery(transcript);
        if (event.results[0].isFinal) {
          setIsVoiceActive(false);
          onSearch(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onSearch, setIsVoiceActive, setQuery]);

  const toggleVoice = () => {
    if (!speechSupported) {
      alert('Voice recognition is not available in this browser. Please use text search.');
      return;
    }
    if (isVoiceActive) {
      recognitionRef.current?.stop();
      setIsVoiceActive(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsVoiceActive(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch();
  };

  return (
    <section className="relative pt-6 sm:pt-8 pb-4 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Main Headline */}
      <div className="space-y-2.5 mb-5">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          find what you're craving, <br />
          <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
            around you.
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-normal">
          Type any restaurant name, cravings, or speak naturally. Powered by Google Maps Platform for verified dining and exact photos.
        </p>
      </div>

      {/* Quick Location Switcher Bar (Benin City <-> Lagos & GPS) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 flex-wrap text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1 text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          Location:
        </span>
        <button
          type="button"
          onClick={() => onQuickSwitchLocation?.('Benin City, Edo State, Nigeria', 6.3350, 5.6037)}
          className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border text-xs ${
            userLocation?.city.toLowerCase().includes('benin')
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Switch to Benin City, Edo State"
        >
          Benin City (Default)
        </button>
        <button
          type="button"
          onClick={() => onQuickSwitchLocation?.('Victoria Island, Lagos State, Nigeria', 6.4281, 3.4219)}
          className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border text-xs ${
            userLocation?.city.toLowerCase().includes('lagos')
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Switch to Lagos State"
        >
          Lagos State
        </button>
        {onOpenLocationModal && (
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="px-2.5 py-1 rounded-full font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-[11px]"
          >
            Switch City...
          </button>
        )}
      </div>

      {/* Main Search Bar Form */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-3">
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-slate-200 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/15 shadow-md hover:shadow-lg transition-all">
          <div className="pl-3.5 sm:pl-4 text-slate-400">
            <Search className="w-5 h-5 text-amber-600" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a craving (e.g. good food, ice cream) or restaurant name..."
            className="w-full py-3.5 sm:py-4 pl-3 pr-24 sm:pr-28 text-xs sm:text-base bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              className={`p-2 sm:p-2.5 rounded-xl mr-1.5 sm:mr-2 transition-all cursor-pointer ${
                isVoiceActive
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
              }`}
              title={isVoiceActive ? 'Listening... Speak now' : 'Search by Voice'}
            >
              {isVoiceActive ? (
                <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="mr-1.5 sm:mr-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {/* Listening Voice Indicator */}
        {isVoiceActive && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Listening to your voice... Speak now
          </div>
        )}
      </form>

      {/* Suggested Discovery Chips */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap max-w-3xl mx-auto mb-5">
        <span className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Store className="w-3.5 h-3.5 text-amber-500" />
          Suggestions:
        </span>
        {SUGGESTED_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              setQuery(chip);
              onSearch(chip);
            }}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 font-semibold transition-all shadow-2xs cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Controls Bar: Search Mode / Filters / View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto pt-2 border-t border-slate-200">
        {/* Search Mode Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setSearchMode('maps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              searchMode === 'maps'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Maps Places</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              searchMode === 'search'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>Web Grounded</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('thinking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              searchMode === 'thinking'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
            <span>Deep Think</span>
          </button>
        </div>

        {/* Right side: Filter toggle & View Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showFilters || filters.openNow || filters.priceLevel !== 'all'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* View Switcher: Carousel / List / Map */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`p-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Carousel View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Carousel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Interactive Map"
            >
              <Map className="w-4 h-4" />
              <span className="hidden md:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg text-left max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Search Filters</h3>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  openNow: false,
                  priceLevel: 'all',
                  maxDistanceMiles: 10,
                  cuisine: '',
                  dietary: '',
                })
              }
              className="text-xs text-amber-600 hover:text-amber-800 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Open Now Toggle */}
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={filters.openNow}
                onChange={(e) => setFilters({ ...filters, openNow: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-bold text-slate-800">Open Right Now</span>
            </label>

            {/* Price Level */}
            <div className="space-y-1">
              <span className="font-bold text-slate-600">Price Level</span>
              <select
                value={filters.priceLevel}
                onChange={(e) => setFilters({ ...filters, priceLevel: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="all">Any Price</option>
                <option value="$">$ Budget Friendly</option>
                <option value="$$">$$ Moderate</option>
                <option value="$$$">$$$ Fine Dining</option>
              </select>
            </div>

            {/* Max Distance */}
            <div className="space-y-1">
              <span className="font-bold text-slate-600">
                Max Distance: {filters.maxDistanceMiles} miles
              </span>
              <input
                type="range"
                min="1"
                max="30"
                value={filters.maxDistanceMiles}
                onChange={(e) =>
                  setFilters({ ...filters, maxDistanceMiles: Number(e.target.value) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            {/* Dietary Preference */}
            <div className="space-y-1">
              <span className="font-bold text-slate-600">Dietary Needs</span>
              <select
                value={filters.dietary}
                onChange={(e) => setFilters({ ...filters, dietary: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="">No Restrictions</option>
                <option value="Halal">Halal</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
