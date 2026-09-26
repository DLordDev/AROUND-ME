import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  Bookmark,
  User as UserIcon,
  LogOut,
  Sliders,
  History,
  Menu,
  X,
  ChevronDown,
  Compass,
  Search,
  Volume2,
  VolumeX,
  Navigation,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserLocation } from '../types';
import { DynamicCompassLogo } from './DynamicCompassLogo';

interface NavbarProps {
  userLocation: UserLocation;
  onRefreshLocation: () => void;
  onOpenLocationPicker?: () => void;
  favoritesCount: number;
  onOpenUserDrawer: (tab: 'favorites' | 'history' | 'preferences') => void;
  isSearching?: boolean;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onSearchRestaurant?: (name: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userLocation,
  onRefreshLocation,
  onOpenLocationPicker,
  favoritesCount,
  onOpenUserDrawer,
  isSearching = false,
  voiceEnabled = true,
  onToggleVoice,
  onSearchRestaurant,
}) => {
  const { currentUser, setAuthModalOpen, setProfileModalOpen, logout } = useAuth();
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickRestaurantInput, setQuickRestaurantInput] = useState('');

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRestaurantInput.trim() && onSearchRestaurant) {
      onSearchRestaurant(quickRestaurantInput.trim());
      setQuickRestaurantInput('');
      setHamburgerOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs w-full overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
          {/* Brand with Dynamic Compass Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <DynamicCompassLogo size="sm" isSearching={isSearching} />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900">
                  AroundMe
                </span>
                <span className="px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black tracking-wider uppercase bg-amber-500 text-white shadow-xs">
                  AI
                </span>
              </div>
              <span className="hidden md:block text-[10px] text-slate-500 font-medium">
                Verified Restaurant Discovery
              </span>
            </div>
          </div>

          {/* Professional Top Location Bar (Responsive & Constrained) */}
          <div className="flex items-center justify-center flex-1 min-w-0 max-w-[170px] sm:max-w-xs md:max-w-md mx-1 sm:mx-2">
            <button
              onClick={onOpenLocationPicker || onRefreshLocation}
              type="button"
              className="w-full min-w-0 flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 transition-all shadow-xs group cursor-pointer"
              title={`Discovery Location: ${userLocation.city} - Click to switch city or detect GPS`}
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                  {userLocation.city.split(',')[0]}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200 shrink-0 flex items-center gap-0.5 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <span className="hidden sm:inline">Change</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Voice Toggle */}
            {onToggleVoice && (
              <button
                onClick={onToggleVoice}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  voiceEnabled
                    ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title={voiceEnabled ? 'Voice Narration is ON' : 'Voice Narration is OFF'}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Voice ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>Voice OFF</span>
                  </>
                )}
              </button>
            )}

            {/* Favorites Button */}
            <button
              onClick={() => onOpenUserDrawer('favorites')}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Saved</span>
              {favoritesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User Profile / Google Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  type="button"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate font-semibold">
                    {currentUser.displayName?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs text-slate-700"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => setProfileModalOpen(true)}
                      className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-900 flex items-center gap-2.5 font-bold"
                    >
                      <UserIcon className="w-4 h-4 text-amber-600" />
                      <span>Edit Profile & Payouts</span>
                    </button>
                    <button
                      onClick={() => onOpenUserDrawer('favorites')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span>Saved Favorites</span>
                    </button>
                    <button
                      onClick={() => onOpenUserDrawer('history')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                    >
                      <History className="w-4 h-4 text-sky-500" />
                      <span>Search History</span>
                    </button>
                    <button
                      onClick={() => onOpenUserDrawer('preferences')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                    >
                      <Sliders className="w-4 h-4 text-emerald-500" />
                      <span>Dietary Preferences</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In / Profile</span>
              </button>
            )}
          </div>

          {/* Prominent Working Hamburger Menu Button (Visible Everywhere) */}
          <button
            onClick={() => setHamburgerOpen(!hamburgerOpen)}
            type="button"
            className="shrink-0 flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            title="Menu & Features"
          >
            {hamburgerOpen ? (
              <X className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" />
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              Menu
            </span>
          </button>
        </div>
      </header>

      {/* Hamburger Slide-Over / Drawer Panel */}
      {hamburgerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setHamburgerOpen(false)}
          />

          {/* Slide-out Menu Card */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <DynamicCompassLogo size="sm" isSearching={isSearching} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">AroundMe AI Menu</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Smart Restaurant Explorer</p>
                </div>
              </div>
              <button
                onClick={() => setHamburgerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-5 flex-1">
              {/* User Profile Card */}
              {currentUser ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || ''}
                        className="w-10 h-10 rounded-full object-cover border border-amber-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                        {currentUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setProfileModalOpen(true);
                        setHamburgerOpen(false);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Profile & Payouts"
                    >
                      <UserIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setHamburgerOpen(false);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setHamburgerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  <span>Sign In / Profile</span>
                </button>
              )}

              {/* Instant Restaurant Name Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Find Specific Restaurant by Name
                </label>
                <form onSubmit={handleQuickSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={quickRestaurantInput}
                    onChange={(e) => setQuickRestaurantInput(e.target.value)}
                    placeholder="e.g. Kada Plaza, Kilimanjaro..."
                    className="w-full pl-9 pr-14 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition-colors"
                  >
                    Find
                  </button>
                </form>
              </div>

              {/* Current Discovery Location Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    Current Location
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live GPS
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {userLocation.city}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onOpenLocationPicker?.();
                      setHamburgerOpen(false);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-amber-800 text-[11px] font-bold text-center transition-colors"
                  >
                    Change City / Country
                  </button>
                  <button
                    onClick={() => {
                      onRefreshLocation();
                      setHamburgerOpen(false);
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold text-center transition-colors"
                  >
                    Refresh GPS
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onOpenUserDrawer('favorites');
                    setHamburgerOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <span>Saved Favorites</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onOpenUserDrawer('history');
                    setHamburgerOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <span>Search History</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenUserDrawer('preferences');
                    setHamburgerOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <span>Dietary & Taste Preferences</span>
                  </div>
                </button>
              </div>

              {/* Voice Narration Settings */}
              {onToggleVoice && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {voiceEnabled ? (
                      <Volume2 className="w-4 h-4 text-amber-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800">Voice Assistant</p>
                      <p className="text-[10px] text-slate-500">Read discovery recommendations</p>
                    </div>
                  </div>
                  <button
                    onClick={onToggleVoice}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                      voiceEnabled
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {voiceEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}

              {/* Verified Google Maps Platform Status */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-900">
                    Google Maps Platform Integrated
                  </p>
                  <p className="text-[10px] text-emerald-700 leading-relaxed">
                    Places data and exact real-location photography are fetched directly from verified Google Maps.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                AroundMe AI • Exact Real-World Places Data
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
