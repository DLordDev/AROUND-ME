export interface Place {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number;
  priceText: string;
  address: string;
  distanceMiles: number;
  distanceText: string;
  openNow: boolean;
  hoursText: string;
  phone: string;
  photos: string[];
  photoUrl: string;
  features: string[];
  highlights: string[];
  lat: number;
  lng: number;
  googleMapsUrl: string;
  summary: string;
  websiteUri?: string;
  facebookUrl?: string;
  facebookHandle?: string;
  instagramUrl?: string;
}

export interface GroundingLink {
  title: string;
  uri: string;
  reviewSnippet?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  isCustom?: boolean;
}

export interface SearchFilterState {
  openNow: boolean;
  priceLevel: string; // 'all' | '$' | '$$' | '$$$'
  maxDistanceMiles: number;
  cuisine: string;
  dietary: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioBase64?: string;
  action?: 'filter_cheaper' | 'filter_closer' | 'filter_open_now' | 'filter_walkable' | 'filter_quick_drive';
}
