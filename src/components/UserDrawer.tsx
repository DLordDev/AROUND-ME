import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  History,
  Sliders,
  LogOut,
  User as UserIcon,
  Trash2,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  FavoriteRestaurant,
  SearchHistoryItem,
  UserPreferences,
  removeFavorite,
  subscribeToFavorites,
  subscribeToSearchHistory,
  savePreferences,
  getPreferences,
} from '../firebase/firestoreService';
import { Place } from '../types';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'favorites' | 'history' | 'preferences';
  setActiveTab: (tab: 'favorites' | 'history' | 'preferences') => void;
  onSelectFavorite: (place: Place) => void;
  onReSearch: (query: string) => void;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onSelectFavorite,
  onReSearch,
}) => {
  const { currentUser, signInWithGoogle, logout } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    userId: '',
    dietaryRestrictions: '',
    pricePreference: 'all',
    maxDistanceMiles: 10,
    updatedAt: '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Subscribe to Favorites & History when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setHistory([]);
      return;
    }

    const unsubFav = subscribeToFavorites(currentUser.uid, (data) => {
      setFavorites(data);
    });

    const unsubHist = subscribeToSearchHistory(currentUser.uid, (data) => {
      setHistory(data);
    });

    getPreferences(currentUser.uid).then((p) => {
      if (p) setPreferences(p);
    });

    return () => {
      unsubFav();
      unsubHist();
    };
  }, [currentUser]);

  const handleRemoveFavorite = async (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      await removeFavorite(currentUser.uid, placeId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await savePreferences(currentUser.uid, preferences);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const renderTabBody = () => {
    if (!currentUser) {
      return (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Bookmark className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Sign In Required</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Connect with Google Sign-In to sync saved restaurants, search history, and dining preferences across devices.
          </p>
          <button
            onClick={() => signInWithGoogle()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-amber-400" />
            <span>Sign In with Google</span>
          </button>
        </div>
      );
    }

    if (activeTab === 'favorites') {
      if (favorites.length === 0) {
        return (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No saved restaurants yet.</p>
            <p className="text-[11px] text-slate-400">
              Click the bookmark icon on any restaurant card to save it.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id || fav.placeId}
              onClick={() => {
                onSelectFavorite({
                  id: fav.placeId,
                  name: fav.name,
                  rating: fav.rating || 4.5,
                  userRatingsTotal: fav.userRatingsTotal || 100,
                  cuisine: fav.cuisine || 'Restaurant',
                  priceLevel: fav.priceLevel || 2,
                  priceText: '$$',
                  address: fav.address || '',
                  distanceMiles: 1.0,
                  distanceText: 'Nearby',
                  openNow: fav.openNow !== undefined ? fav.openNow : true,
                  hoursText: 'Open',
                  phone: '',
                  photos: fav.photoUrl ? [fav.photoUrl] : [],
                  photoUrl: fav.photoUrl || '',
                  features: [],
                  highlights: [],
                  lat: fav.lat || 37.77,
                  lng: fav.lng || -122.41,
                  googleMapsUrl:
                    fav.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fav.name)}`,
                  summary: `${fav.name} saved in your favorites.`,
                });
                onClose();
              }}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                {fav.photoUrl ? (
                  <img
                    src={fav.photoUrl}
                    alt={fav.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
                    {fav.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-amber-600 transition-colors line-clamp-1">
                    {fav.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{fav.cuisine}</p>
                  <p className="text-[10px] text-amber-600 font-bold">
                    ★ {fav.rating?.toFixed(1) || '4.5'}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => handleRemoveFavorite(e, fav.placeId)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Remove favorite"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'history') {
      if (history.length === 0) {
        return (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No search history recorded yet.</p>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onReSearch(item.query);
                onClose();
              }}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600 line-clamp-1">
                    "{item.query}"
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()} · {item.resultCount} places found
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            Dietary Restrictions
          </label>
          <input
            type="text"
            value={preferences.dietaryRestrictions}
            onChange={(e) =>
              setPreferences({ ...preferences, dietaryRestrictions: e.target.value })
            }
            placeholder="e.g. Halal, Vegetarian, Nut allergy..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Google Maps & Gemini will prioritize restaurants matching these requirements.
          </p>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            Default Search Radius
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="25"
              value={preferences.maxDistanceMiles}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  maxDistanceMiles: Number(e.target.value),
                })
              }
              className="w-full accent-amber-500"
            />
            <span className="font-bold text-amber-700 w-12 text-right">
              {preferences.maxDistanceMiles} mi
            </span>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            Preferred Price Range
          </label>
          <div className="flex gap-2">
            {['all', '$', '$$', '$$$'].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setPreferences({ ...preferences, pricePreference: tier })}
                className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  preferences.pricePreference === tier
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tier === 'all' ? 'Any' : tier}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </form>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || ''}
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {currentUser?.displayName || 'Guest User'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser?.email || 'Sign in to sync your data'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-amber-500 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Favorites ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-amber-500 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {renderTabBody()}
        </div>

        {/* Drawer Footer */}
        {currentUser && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Cloud Database Connected</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
