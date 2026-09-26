/**
 * /js/config.js - Application Configuration
 * Pure Vanilla JavaScript configuration module.
 * No build tools required.
 */

const AppConfig = {
  // Backend API base path (uses server proxy so secret API keys remain safe on server)
  apiBaseUrl: '/api',

  // Google Client ID for Google Identity Services (GIS) Sign-In
  googleClientId: '716617446825-v665jsuh1nfl0o9l9gbupu78gtbckq4q.apps.googleusercontent.com',

  // Default discovery location
  defaultLocation: {
    city: 'Benin City',
    state: 'Edo State',
    country: 'Nigeria',
    latitude: 6.3350,
    longitude: 5.6037
  },

  // Popular preset locations for instant switching
  presetLocations: [
    { city: 'Benin City', label: 'Benin City, Edo', lat: 6.3350, lng: 5.6037 },
    { city: 'Lagos', label: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792 },
    { city: 'Abuja', label: 'Abuja, FCT', lat: 9.0765, lng: 7.3986 },
    { city: 'Port Harcourt', label: 'Port Harcourt, Rivers', lat: 4.8156, lng: 7.0498 },
    { city: 'London', label: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { city: 'New York', label: 'New York, USA', lat: 40.7128, lng: -74.0060 }
  ],

  // Real, authentic architectural/venue photographs used ONLY as a fallback if Google Places returns 0 photos.
  // (NEVER AI-generated fake images!)
  fallbackPlaceholders: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80'
  ],

  /**
   * Initializes config by dynamically fetching server-side /api/config if available
   */
  async init() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/config`);
      if (res.ok) {
        const serverConfig = await res.json();
        if (serverConfig.googleClientId) {
          this.googleClientId = serverConfig.googleClientId;
        }
      }
    } catch (e) {
      // Fallback to configured default
    }
    return this;
  }
};

window.AppConfig = AppConfig;
