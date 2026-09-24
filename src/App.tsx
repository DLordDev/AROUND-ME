/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { RestaurantCarousel } from './components/RestaurantCarousel';
import { ListView } from './components/ListView';
import { MapView } from './components/MapView';
import { RestaurantModal } from './components/RestaurantModal';
import { DishVisualizerModal } from './components/DishVisualizerModal';
import { FloatingAssistant } from './components/FloatingAssistant';
import { UserDrawer } from './components/UserDrawer';
import { LocationPickerModal } from './components/LocationPickerModal';
import { GroundingSources } from './components/GroundingSources';
import { Footer } from './components/Footer';
import { MessageSquare, Star, Sparkles, UtensilsCrossed } from 'lucide-react';
import {
  Place,
  UserLocation,
  SearchFilterState,
  GroundingLink,
} from './types';
import {
  addFavorite,
  removeFavorite,
  subscribeToFavorites,
  recordSearchHistory,
  subscribeToRecentReviews,
  RestaurantReview,
} from './firebase/firestoreService';

function MainApp() {
  const { currentUser } = useAuth();

  // Search State: initial empty query so diner can directly type what they want
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [summary, setSummary] = useState('');
  const [groundingLinks, setGroundingLinks] = useState<GroundingLink[]>([]);
  const [searchSource, setSearchSource] = useState<'google_maps' | 'google_search' | 'deep_thinking'>('google_maps');

  // Location State: Default Benin City, Edo State, Nigeria; detects actual browser GPS with high accuracy
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: 6.3350,
    longitude: 5.6037,
    city: 'Benin City, Edo State, Nigeria',
    isCustom: false,
  });

  // Location Picker Modal
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Recent community reviews
  const [recentCommunityReviews, setRecentCommunityReviews] = useState<RestaurantReview[]>([]);

  // Controls State
  const [viewMode, setViewMode] = useState<'carousel' | 'map' | 'list'>('carousel');
  const [searchMode, setSearchMode] = useState<'maps' | 'search' | 'thinking'>('maps');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<SearchFilterState>({
    openNow: false,
    priceLevel: 'all',
    maxDistanceMiles: 10,
    cuisine: '',
    dietary: '',
  });

  // Transport mode indicator preference ('both' | 'walking' | 'driving')
  const [transportMode, setTransportMode] = useState<'both' | 'walking' | 'driving'>('both');

  // Selected place for details modal & visualizer
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [visualizingPlace, setVisualizingPlace] = useState<Place | null>(null);

  // User Drawer State
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [userDrawerTab, setUserDrawerTab] = useState<'favorites' | 'history' | 'preferences'>('favorites');
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  // Detect User GPS Location
  const detectLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            // Reverse geocode city name using free Nominatim
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );
            const data = await res.json();
            const addr = data.address || {};
            const cityPart = addr.city || addr.town || addr.suburb || addr.village;
            const statePart = addr.state;
            const countryPart = addr.country;
            const parts = [cityPart, statePart, countryPart].filter(Boolean);
            const cityName = parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            setUserLocation({
              latitude: lat,
              longitude: lng,
              city: cityName,
              isCustom: false,
            });
          } catch {
            setUserLocation({
              latitude: lat,
              longitude: lng,
              city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              isCustom: false,
            });
          }
        },
        (err) => {
          console.warn('Geolocation access declined or unavailable:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Subscribe to live community reviews
  useEffect(() => {
    const unsub = subscribeToRecentReviews((revs) => {
      setRecentCommunityReviews(revs);
    }, 6);
    return () => unsub();
  }, []);

  // Subscribe to Favorites in Firestore
  useEffect(() => {
    if (!currentUser) {
      setFavoritesMap({});
      return;
    }
    const unsub = subscribeToFavorites(currentUser.uid, (favs) => {
      const map: Record<string, boolean> = {};
      favs.forEach((f) => {
        map[f.placeId] = true;
      });
      setFavoritesMap(map);
    });
    return () => unsub();
  }, [currentUser]);

  // Quick Switch City helper
  const handleQuickSwitchLocation = (city: string, lat: number, lng: number) => {
    setUserLocation({
      latitude: lat,
      longitude: lng,
      city,
      isCustom: true,
    });
  };

  // Execute Discovery Search
  const executeSearch = useCallback(
    async (customSearchQuery?: string, isAutoInitial = false) => {
      const q = (customSearchQuery !== undefined
        ? customSearchQuery
        : (query.trim() || 'Top rated popular restaurants and dining spots')).trim();

      setLoading(true);
      try {
        const response = await fetch('/api/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            location: userLocation,
            filters,
            mode: searchMode,
          }),
        });

        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();

        setPlaces(data.places || []);
        setSummary(data.summary || '');
        setGroundingLinks(data.groundingLinks || []);
        setSearchSource(data.searchSource || 'google_maps');

        // Record search in Firestore if authenticated and user manually typed
        if (currentUser && data.places?.length > 0 && query.trim()) {
          recordSearchHistory(currentUser.uid, q, data.places.length);
        }

        // Voice read summary ONLY when explicitly enabled AND NOT on automatic initial background load
        if (!isAutoInitial && voiceEnabled && isVoiceActive && data.summary && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            `Found ${data.places.length} places for ${q}. Here are the top recommendations.`
          );
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error('Failed to discover places:', err);
      } finally {
        setLoading(false);
      }
    },
    [query, userLocation, filters, searchMode, currentUser, voiceEnabled, isVoiceActive]
  );

  // Initial load or location change (loads places in background without audio)
  useEffect(() => {
    executeSearch(undefined, true);
  }, [userLocation.latitude, userLocation.longitude]);

  // Toggle Favorite
  const handleToggleFavorite = async (place: Place) => {
    if (!currentUser) {
      setUserDrawerTab('favorites');
      setUserDrawerOpen(true);
      return;
    }

    const isFav = Boolean(favoritesMap[place.id]);
    try {
      if (isFav) {
        await removeFavorite(currentUser.uid, place.id);
      } else {
        await addFavorite(currentUser.uid, {
          placeId: place.id,
          name: place.name,
          rating: place.rating,
          userRatingsTotal: place.userRatingsTotal,
          address: place.address,
          photoUrl: place.photoUrl,
          cuisine: place.cuisine,
          priceLevel: place.priceLevel,
          lat: place.lat,
          lng: place.lng,
          openNow: place.openNow,
          googleMapsUrl: place.googleMapsUrl,
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Assistant Action handler (filters current result set)
  const handleAssistantAction = (
    action: 'filter_cheaper' | 'filter_closer' | 'filter_open_now' | 'filter_walkable' | 'filter_quick_drive',
    placeIds?: string[]
  ) => {
    if (action === 'filter_walkable') {
      setTransportMode('walking');
      const walkable = [...places].filter((p) => p.distanceMiles <= 0.8);
      if (walkable.length > 0) {
        setSelectedPlace(walkable[0]);
      } else {
        const sorted = [...places].sort((a, b) => a.distanceMiles - b.distanceMiles);
        if (sorted[0]) setSelectedPlace(sorted[0]);
      }
    } else if (action === 'filter_quick_drive') {
      setTransportMode('driving');
      const sorted = [...places].sort((a, b) => a.distanceMiles - b.distanceMiles);
      if (sorted[0]) setSelectedPlace(sorted[0]);
    } else if (action === 'filter_cheaper') {
      setFilters((prev) => ({ ...prev, priceLevel: '$' }));
      const cheapSpots = places.filter((p) => p.priceLevel <= 1);
      if (cheapSpots.length > 0) {
        setSelectedPlace(cheapSpots[0]);
      }
    } else if (action === 'filter_closer') {
      const sorted = [...places].sort((a, b) => a.distanceMiles - b.distanceMiles);
      setPlaces(sorted);
      if (sorted[0]) setSelectedPlace(sorted[0]);
    } else if (action === 'filter_open_now') {
      setFilters((prev) => ({ ...prev, openNow: true }));
      const openSpots = places.filter((p) => p.openNow);
      if (openSpots.length > 0) {
        setSelectedPlace(openSpots[0]);
      }
    } else if (placeIds && placeIds.length > 0) {
      const match = places.find((p) => placeIds.includes(p.id));
      if (match) setSelectedPlace(match);
    }
  };

  // Filtered places according to current filters
  const filteredPlaces = places.filter((place) => {
    if (filters.openNow && !place.openNow) return false;
    if (filters.priceLevel !== 'all' && place.priceText !== filters.priceLevel) {
      if (filters.priceLevel === '$' && place.priceLevel > 1) return false;
      if (filters.priceLevel === '$$' && place.priceLevel > 2) return false;
    }
    if (filters.maxDistanceMiles && place.distanceMiles > filters.maxDistanceMiles) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden selection:bg-amber-500 selection:text-white">
      {/* Subtle warm restaurant background atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-amber-50/25 via-white to-slate-50/50" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Navbar */}
        <Navbar
          userLocation={userLocation}
          onRefreshLocation={detectLocation}
          onOpenLocationPicker={() => setLocationModalOpen(true)}
          favoritesCount={Object.keys(favoritesMap).length}
          onOpenUserDrawer={(tab) => {
            setUserDrawerTab(tab);
            setUserDrawerOpen(true);
          }}
          isSearching={loading}
          onSearchRestaurant={(restaurantName) => {
            setQuery(restaurantName);
            executeSearch(restaurantName);
          }}
        />

        {/* Main Content */}
        <main className="flex-1 pb-20">
          {/* Hero & Search Header */}
          <HeroSearch
            query={query}
            setQuery={setQuery}
            onSearch={(customQ) => executeSearch(customQ, false)}
            loading={loading}
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            filters={filters}
            setFilters={setFilters}
            isVoiceActive={isVoiceActive}
            setIsVoiceActive={setIsVoiceActive}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            userLocation={userLocation}
            onQuickSwitchLocation={handleQuickSwitchLocation}
            onOpenLocationModal={() => setLocationModalOpen(true)}
          />

          {/* Verified Grounding Banner */}
          <GroundingSources
            links={groundingLinks}
            summary={summary}
            source={searchSource}
            voiceEnabled={voiceEnabled}
          />

          {/* View Mode Switching: Carousel / Map / List */}
          {viewMode === 'carousel' ? (
            <RestaurantCarousel
              places={filteredPlaces}
              userLocation={userLocation}
              preferredMode={transportMode}
              onSelectMode={setTransportMode}
              favorites={favoritesMap}
              onToggleFavorite={handleToggleFavorite}
              onSelect={setSelectedPlace}
              onVisualizeCraving={setVisualizingPlace}
            />
          ) : viewMode === 'map' ? (
            <MapView
              places={filteredPlaces}
              userLocation={userLocation}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
            />
          ) : (
            <ListView
              places={filteredPlaces}
              userLocation={userLocation}
              preferredMode={transportMode}
              onSelectMode={setTransportMode}
              favorites={favoritesMap}
              onToggleFavorite={handleToggleFavorite}
              onSelect={setSelectedPlace}
              onVisualizeCraving={setVisualizingPlace}
            />
          )}

          {/* Community Reviews Showcase */}
          {recentCommunityReviews.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Recent Diner Reviews</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Live Community
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authentic feedback and dish recommendations from verified diners
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCommunityReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all shadow-xs space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {rev.placeName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          {rev.userPhoto ? (
                            <img
                              src={rev.userPhoto}
                              alt={rev.userName}
                              className="w-4 h-4 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                              {rev.userName.charAt(0)}
                            </span>
                          )}
                          <span className="font-semibold text-slate-700">{rev.userName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-800">{rev.rating}.0</span>
                      </div>
                    </div>

                    {rev.dishesOrdered && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md font-semibold">
                        <span className="text-amber-900 font-bold">Ordered: </span>
                        {rev.dishesOrdered}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Global Footer */}
        <Footer
          currentLocation={userLocation}
          onQuickSearch={(q) => {
            setQuery(q);
            executeSearch(q);
          }}
          onQuickSwitchLocation={handleQuickSwitchLocation}
          onOpenLocationModal={() => setLocationModalOpen(true)}
        />

        {/* Floating AI Concierge Assistant */}
        <FloatingAssistant
          currentPlaces={filteredPlaces}
          currentQuery={query}
          userLocation={userLocation}
          onFilterAction={handleAssistantAction}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
        />

        {/* Restaurant Full Detail Modal (includes customer review form) */}
        <RestaurantModal
          place={selectedPlace}
          userLocation={userLocation}
          onClose={() => setSelectedPlace(null)}
          isFavorite={Boolean(selectedPlace && favoritesMap[selectedPlace.id])}
          onToggleFavorite={handleToggleFavorite}
          onVisualizeCraving={(p) => {
            setSelectedPlace(null);
            setVisualizingPlace(p);
          }}
          onAskAssistant={() => {}}
        />

        {/* Global Location Picker Modal */}
        <LocationPickerModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          currentLocation={userLocation}
          onSelectLocation={(loc) => {
            setUserLocation(loc);
            executeSearch(query);
          }}
          onDetectGPS={detectLocation}
        />

        {/* High Quality Dish Craving Visualizer (1K, 2K, 4K) */}
        <DishVisualizerModal
          place={visualizingPlace}
          onClose={() => setVisualizingPlace(null)}
        />

        {/* User Drawer (Favorites, Search History, Dietary Preferences) */}
        <UserDrawer
          isOpen={userDrawerOpen}
          onClose={() => setUserDrawerOpen(false)}
          activeTab={userDrawerTab}
          setActiveTab={setUserDrawerTab}
          onSelectFavorite={(place) => setSelectedPlace(place)}
          onReSearch={(q) => {
            setQuery(q);
            executeSearch(q);
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
