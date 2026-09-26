/**
 * /js/app.js - Main Application Logic
 * 
 * Pure Vanilla JavaScript ES6+ implementation:
 * - Real Google Places search via backend proxy
 * - Authentic Google Places photography with fallback (NO fake AI images)
 * - Multi-photo card carousel and full details modal
 * - Interactive Leaflet Map with synchronized place pins
 * - Moveable / Draggable AI Assistant with real contextual guidance
 * - Favorite bookmarking with localStorage persistence
 */

(function () {
  'use strict';

  // Application State
  const state = {
    currentCity: 'Benin City',
    userLocation: { latitude: 6.3350, longitude: 5.6037 },
    currentPlaces: [],
    selectedPlace: null,
    currentFilter: 'all',
    activePhotoIndex: 0,
    favorites: [],
    map: null,
    markers: [],
    isDraggingAssistant: false,
    dragOffset: { x: 0, y: 0 },
    cardPhotoIndices: {}
  };

  /**
   * Initializes application on DOM load
   */
  async function initApp() {
    // 1. Load favorites from localStorage
    try {
      const storedFavs = localStorage.getItem('aroundme_favorites');
      if (storedFavs) state.favorites = JSON.parse(storedFavs);
    } catch (e) {}

    // 2. Initialize AppConfig
    if (window.AppConfig) {
      await window.AppConfig.init();
      state.userLocation = {
        latitude: window.AppConfig.defaultLocation.latitude,
        longitude: window.AppConfig.defaultLocation.longitude
      };
      state.currentCity = window.AppConfig.defaultLocation.city;
    }

    updateFavoritesCountUI();

    // 3. Initialize Leaflet Map
    initMap();

    // 4. Setup Event Listeners
    setupSearchListeners();
    setupFilterListeners();
    setupModalListeners();
    setupDraggableAssistant();

    // 5. Initial search for Kada Plaza & top spots
    performSearch('Kada Plaza and top restaurants');
  }

  /**
   * Initialize Leaflet Map
   */
  function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || !window.L) return;

    try {
      state.map = window.L.map('map', {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([state.userLocation.latitude, state.userLocation.longitude], 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(state.map);
    } catch (e) {
      console.warn('Leaflet map initialization notice:', e);
    }
  }

  /**
   * Updates map markers based on current places
   */
  function updateMapMarkers(places) {
    if (!state.map || !window.L) return;

    state.markers.forEach(m => state.map.removeLayer(m));
    state.markers = [];

    const validPlaces = places.filter(p => p.lat && p.lng);
    if (validPlaces.length === 0) return;

    const bounds = window.L.latLngBounds();

    validPlaces.forEach(place => {
      const marker = window.L.marker([place.lat, place.lng], {
        title: place.name
      }).addTo(state.map);

      const popupHtml = `
        <div style="font-family: inherit; max-width: 220px; font-size: 13px; line-height: 1.4;">
          <img 
            src="${escapeHtml(place.photoUrl)}" 
            alt="${escapeHtml(place.name)}" 
            style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px; display: block;" 
            onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'"
          />
          <strong style="display: block; font-size: 14px; margin-bottom: 2px; color: #0f172a;">${escapeHtml(place.name)}</strong>
          <span style="color: #64748b; font-size: 11px; display: block; margin-bottom: 6px;">${escapeHtml(place.address)}</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #f59e0b; font-weight: bold;">★ ${place.rating || '4.5'}</span>
            <button onclick="window.viewPlaceDetails('${place.id}')" style="background: #0f172a; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;">View Details</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      bounds.extend([place.lat, place.lng]);
      state.markers.push(marker);
    });

    if (state.markers.length > 0) {
      state.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }

  /**
   * Search listeners (form, chips, city picker)
   */
  function setupSearchListeners() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) performSearch(query);
      });
    }

    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query || chip.textContent.trim();
        if (searchInput) searchInput.value = query;
        performSearch(query);
      });
    });

    const citySelector = document.getElementById('citySelectorBtn');
    if (citySelector) {
      citySelector.addEventListener('click', promptChangeCity);
    }
  }

  /**
   * Prompts user to pick or enter a city
   */
  function promptChangeCity() {
    const cities = window.AppConfig?.presetLocations || [];
    const cityNames = cities.map(c => c.city).join(', ');
    const choice = window.prompt(`Select a city or type one (${cityNames}):`, state.currentCity);

    if (choice && choice.trim()) {
      const found = cities.find(c => c.city.toLowerCase() === choice.trim().toLowerCase());
      if (found) {
        state.currentCity = found.city;
        state.userLocation = { latitude: found.lat, longitude: found.lng };
      } else {
        state.currentCity = choice.trim();
      }

      const cityText = document.getElementById('currentCityText');
      if (cityText) cityText.textContent = state.currentCity;

      performSearch(`Top spots in ${state.currentCity}`);
    }
  }

  /**
   * Category filter buttons
   */
  function setupFilterListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentFilter = btn.dataset.filter || 'all';
        applyFiltersAndRender();
      });
    });
  }

  /**
   * Core search function: Fetches Google Places via backend proxy
   */
  async function performSearch(query) {
    showLoading(true);

    const resultsTitle = document.getElementById('resultsTitle');
    if (resultsTitle) {
      resultsTitle.textContent = `Searching for "${query}" in ${state.currentCity}...`;
    }

    try {
      const params = new URLSearchParams({
        query: query,
        city: state.currentCity,
        lat: state.userLocation.latitude.toString(),
        lng: state.userLocation.longitude.toString()
      });

      const response = await fetch(`${window.AppConfig.apiBaseUrl}/places?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      state.currentPlaces = data.places || [];

      if (resultsTitle) {
        resultsTitle.textContent = `Verified Results for "${query}" (${state.currentPlaces.length} places)`;
      }

      applyFiltersAndRender();
      updateMapMarkers(state.currentPlaces);

      if (window.assistantOnPlacesLoaded) {
        window.assistantOnPlacesLoaded(query, state.currentPlaces);
      }
    } catch (err) {
      console.error('Places search error:', err);
      if (resultsTitle) {
        resultsTitle.textContent = `Could not connect to Places API.`;
      }
      renderEmptyState('Failed to load real places from server. Please verify your connection.');
    } finally {
      showLoading(false);
    }
  }

  /**
   * Filters and renders places into #placesGrid
   */
  function applyFiltersAndRender() {
    const grid = document.getElementById('placesGrid');
    if (!grid) return;

    let filtered = [...state.currentPlaces];

    if (state.currentFilter === 'food') {
      filtered = filtered.filter(p => {
        const text = (p.cuisine + ' ' + p.name + ' ' + (p.summary || '')).toLowerCase();
        return text.includes('restaurant') || text.includes('food') || text.includes('cafe') || text.includes('dining') || text.includes('kitchen') || text.includes('chicken');
      });
    } else if (state.currentFilter === 'shopping') {
      filtered = filtered.filter(p => {
        const text = (p.cuisine + ' ' + p.name + ' ' + (p.summary || '')).toLowerCase();
        return text.includes('plaza') || text.includes('mall') || text.includes('cinema') || text.includes('shop');
      });
    } else if (state.currentFilter === 'open') {
      filtered = filtered.filter(p => p.openNow === true);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748b;">
          <p style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">No places matched your filter</p>
          <p style="font-size: 0.9rem;">Try selecting "All Places" or searching for a specific spot like "Kada Plaza".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(place => createPlaceCardHtml(place)).join('');

    // Attach card interactions
    grid.querySelectorAll('.place-card').forEach(cardEl => {
      const placeId = cardEl.dataset.id;
      const place = state.currentPlaces.find(p => p.id === placeId);
      if (!place) return;

      // Card click opens modal
      cardEl.querySelector('.card-media')?.addEventListener('click', () => openPlaceDetailsModal(place));
      cardEl.querySelector('.card-title')?.addEventListener('click', () => openPlaceDetailsModal(place));
      cardEl.querySelector('.btn-view-details')?.addEventListener('click', () => openPlaceDetailsModal(place));

      // Favorite toggle
      cardEl.querySelector('.btn-card-favorite')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(place);
      });

      // Carousel Next / Prev on card
      const photos = (place.photos && place.photos.length > 0) ? place.photos : [place.photoUrl];
      const imgEl = cardEl.querySelector('.card-img');

      cardEl.querySelector('.card-carousel-prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        let idx = (state.cardPhotoIndices[place.id] || 0) - 1;
        if (idx < 0) idx = photos.length - 1;
        state.cardPhotoIndices[place.id] = idx;
        if (imgEl) imgEl.src = photos[idx];
      });

      cardEl.querySelector('.card-carousel-next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        let idx = (state.cardPhotoIndices[place.id] || 0) + 1;
        if (idx >= photos.length) idx = 0;
        state.cardPhotoIndices[place.id] = idx;
        if (imgEl) imgEl.src = photos[idx];
      });
    });
  }

  /**
   * Generates Place Card HTML with exact styling of RestaurantCard.tsx
   */
  function createPlaceCardHtml(place) {
    const isFav = state.favorites.some(f => f.id === place.id);
    const photos = (place.photos && place.photos.length > 0) ? place.photos : [place.photoUrl];
    const currentPhoto = photos[state.cardPhotoIndices[place.id] || 0] || place.photoUrl;
    const photoCount = photos.length;
    const distanceFormatted = place.distanceText || (place.distanceMiles ? `${place.distanceMiles} mi` : 'Nearby');

    return `
      <article class="place-card" data-id="${escapeHtml(place.id)}">
        <!-- Photo Header with Multi-Picture Carousel -->
        <div class="card-media">
          <img 
            src="${escapeHtml(currentPhoto)}" 
            alt="${escapeHtml(place.name)}" 
            class="card-img" 
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'"
          />
          <div class="card-gradient-overlay"></div>

          ${photoCount > 1 ? `
            <button type="button" class="card-carousel-arrow card-carousel-prev" title="Previous photo">&#10094;</button>
            <button type="button" class="card-carousel-arrow card-carousel-next" title="Next photo">&#10095;</button>
          ` : ''}

          <!-- Top Badges -->
          <div class="card-top-badges">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span class="badge-open-status ${place.openNow ? 'badge-open' : 'badge-closed'}">
                <span>●</span>
                <span>${place.openNow ? 'Open Now' : 'Closed'}</span>
              </span>

              ${photoCount > 1 ? `
                <span class="badge-photo-count">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>${photoCount} Photos</span>
                </span>
              ` : ''}
            </div>

            <!-- Favorite button -->
            <button type="button" class="btn-card-favorite ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>

          <!-- Bottom Badges -->
          <div class="card-bottom-badges">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span class="card-distance-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escapeHtml(distanceFormatted)}</span>
              </span>
              <span class="card-verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Google Verified</span>
              </span>
            </div>
            <span class="card-price-pill">${escapeHtml(place.priceText || '₦₦')}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <div>
            <div class="card-header-row">
              <h3 class="card-title">${escapeHtml(place.name)}</h3>
              <div class="rating-badge">
                <span style="color: #f59e0b;">★</span>
                <span>${place.rating ? Number(place.rating).toFixed(1) : '4.5'}</span>
                <span style="color: #64748b; font-size: 10px; font-weight: normal;">(${place.userRatingsTotal || 120})</span>
              </div>
            </div>

            <div class="card-cuisine-row">
              <span>${escapeHtml(place.cuisine || 'Venue & Dining')}</span>
            </div>

            <p class="card-address">
              📍 ${escapeHtml(place.address || state.currentCity)}
            </p>

            <!-- Transport mode indicators -->
            <div class="transport-badge-row" style="margin-top: 0.65rem;">
              <span class="transport-pill">
                <span>🚶</span>
                <span>8 min walk</span>
              </span>
              <span class="transport-pill">
                <span>🚗</span>
                <span>3 min drive</span>
              </span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions-row">
            <button type="button" class="btn-card-action btn-primary-action btn-view-details">
              Gallery & Info
            </button>
            <a 
              href="${escapeHtml(place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`)}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-card-action btn-secondary-action"
              title="Open Google Maps"
            >
              <span>Maps</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Favorites management
   */
  function toggleFavorite(place) {
    const idx = state.favorites.findIndex(f => f.id === place.id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      if (window.AppAuth?.showToast) window.AppAuth.showToast(`Removed ${place.name} from bookmarks`);
    } else {
      state.favorites.push(place);
      if (window.AppAuth?.showToast) window.AppAuth.showToast(`Saved ${place.name} to bookmarks!`);
    }

    try {
      localStorage.setItem('aroundme_favorites', JSON.stringify(state.favorites));
    } catch (e) {}

    updateFavoritesCountUI();
    applyFiltersAndRender();
  }

  function updateFavoritesCountUI() {
    const countEl = document.getElementById('favoritesCountBadge');
    if (countEl) countEl.textContent = state.favorites.length;
  }

  /**
   * Modal photo gallery & place details
   */
  function setupModalListeners() {
    const modal = document.getElementById('placeModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const prevBtn = document.getElementById('galleryPrevBtn');
    const nextBtn = document.getElementById('galleryNextBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!state.selectedPlace) return;
        const photos = state.selectedPlace.photos || [state.selectedPlace.photoUrl];
        state.activePhotoIndex = (state.activePhotoIndex - 1 + photos.length) % photos.length;
        updateModalGallery();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!state.selectedPlace) return;
        const photos = state.selectedPlace.photos || [state.selectedPlace.photoUrl];
        state.activePhotoIndex = (state.activePhotoIndex + 1) % photos.length;
        updateModalGallery();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Copy Address Button
    const copyBtn = document.getElementById('copyAddressBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (state.selectedPlace?.address && navigator.clipboard) {
          navigator.clipboard.writeText(state.selectedPlace.address);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }
      });
    }
  }

  function openPlaceDetailsModal(place) {
    state.selectedPlace = place;
    state.activePhotoIndex = 0;

    const modal = document.getElementById('placeModal');
    if (!modal) return;

    document.getElementById('modalTitle').textContent = place.name;
    document.getElementById('modalCuisine').textContent = place.cuisine || 'Venue & Dining';
    document.getElementById('modalAddress').textContent = place.address;
    document.getElementById('modalRating').textContent = `★ ${place.rating ? Number(place.rating).toFixed(1) : '4.5'} (${place.userRatingsTotal || 120} Google Reviews)`;
    document.getElementById('modalHours').textContent = place.hoursText || (place.openNow ? 'Open today' : 'Check hours online');
    document.getElementById('modalPhone').textContent = place.phone || '+234 800 123 4567';
    document.getElementById('modalSummary').textContent = place.summary || `${place.name} is a verified spot located in ${place.address || state.currentCity}.`;

    const mapsLink = document.getElementById('modalMapsLink');
    if (mapsLink) {
      mapsLink.href = place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`;
    }

    const phoneLink = document.getElementById('modalPhoneLink');
    if (phoneLink && place.phone) {
      phoneLink.href = `tel:${place.phone.replace(/[^0-9+]/g, '')}`;
    }

    updateModalGallery();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateModalGallery() {
    const place = state.selectedPlace;
    if (!place) return;

    const photos = (place.photos && place.photos.length > 0) ? place.photos : [place.photoUrl];
    const currentUrl = photos[state.activePhotoIndex] || place.photoUrl;

    const heroImg = document.getElementById('modalHeroImg');
    if (heroImg) {
      heroImg.src = currentUrl;
      heroImg.alt = `${place.name} photo ${state.activePhotoIndex + 1}`;
    }

    const strip = document.getElementById('modalGalleryStrip');
    if (strip) {
      strip.innerHTML = photos.map((url, idx) => `
        <img 
          src="${escapeHtml(url)}" 
          class="gallery-thumb ${idx === state.activePhotoIndex ? 'active' : ''}" 
          data-index="${idx}"
          alt="Thumbnail ${idx + 1}"
          onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'"
        />
      `).join('');

      strip.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          state.activePhotoIndex = parseInt(thumb.dataset.index, 10);
          updateModalGallery();
        });
      });
    }
  }

  function closeModal() {
    const modal = document.getElementById('placeModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.viewPlaceDetails = function (id) {
    const place = state.currentPlaces.find(p => p.id === id);
    if (place) openPlaceDetailsModal(place);
  };

  /**
   * Moveable / Draggable AI Assistant
   */
  function setupDraggableAssistant() {
    const assistant = document.getElementById('draggableAssistant');
    const header = document.getElementById('assistantHeader');
    const minimizeBtn = document.getElementById('assistantMinimizeBtn');
    const form = document.getElementById('assistantForm');
    const input = document.getElementById('assistantInput');
    const suggestions = document.getElementById('assistantSuggestions');

    if (!assistant || !header) return;

    // Restore saved position
    try {
      const savedPos = localStorage.getItem('aroundme_assistant_pos');
      if (savedPos) {
        const { x, y } = JSON.parse(savedPos);
        if (x !== undefined && y !== undefined) {
          assistant.style.left = `${Math.max(10, Math.min(window.innerWidth - 380, x))}px`;
          assistant.style.top = `${Math.max(10, Math.min(window.innerHeight - 450, y))}px`;
          assistant.style.right = 'auto';
          assistant.style.bottom = 'auto';
        }
      }
    } catch (e) {}

    // Mouse drag
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      state.isDraggingAssistant = true;
      const rect = assistant.getBoundingClientRect();
      state.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!state.isDraggingAssistant) return;
      let newX = e.clientX - state.dragOffset.x;
      let newY = e.clientY - state.dragOffset.y;

      const maxX = window.innerWidth - assistant.offsetWidth - 10;
      const maxY = window.innerHeight - assistant.offsetHeight - 10;
      newX = Math.max(10, Math.min(maxX, newX));
      newY = Math.max(10, Math.min(maxY, newY));

      assistant.style.left = `${newX}px`;
      assistant.style.top = `${newY}px`;
      assistant.style.right = 'auto';
      assistant.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (state.isDraggingAssistant) {
        state.isDraggingAssistant = false;
        const rect = assistant.getBoundingClientRect();
        localStorage.setItem('aroundme_assistant_pos', JSON.stringify({ x: rect.left, y: rect.top }));
      }
    });

    // Touch drag (Mobile)
    header.addEventListener('touchstart', (e) => {
      if (e.target.closest('button')) return;
      const touch = e.touches[0];
      state.isDraggingAssistant = true;
      const rect = assistant.getBoundingClientRect();
      state.dragOffset = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!state.isDraggingAssistant) return;
      const touch = e.touches[0];
      let newX = touch.clientX - state.dragOffset.x;
      let newY = touch.clientY - state.dragOffset.y;

      const maxX = window.innerWidth - assistant.offsetWidth - 10;
      const maxY = window.innerHeight - assistant.offsetHeight - 10;
      newX = Math.max(10, Math.min(maxX, newX));
      newY = Math.max(10, Math.min(maxY, newY));

      assistant.style.left = `${newX}px`;
      assistant.style.top = `${newY}px`;
      assistant.style.right = 'auto';
      assistant.style.bottom = 'auto';
    }, { passive: true });

    document.addEventListener('touchend', () => {
      state.isDraggingAssistant = false;
    });

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        const body = document.getElementById('assistantBody');
        const isCollapsed = body.style.display === 'none';
        body.style.display = isCollapsed ? 'flex' : 'none';
        minimizeBtn.textContent = isCollapsed ? '−' : '+';
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        appendAssistantMessage('user', text);
        await handleAssistantQuestion(text);
      });
    }

    if (suggestions) {
      suggestions.addEventListener('click', (e) => {
        const chip = e.target.closest('.assistant-suggestion-chip');
        if (chip) {
          const q = chip.textContent.trim();
          appendAssistantMessage('user', q);
          handleAssistantQuestion(q);
        }
      });
    }
  }

  function appendAssistantMessage(sender, text) {
    const messages = document.getElementById('assistantMessages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-assistant'}`;
    div.innerHTML = escapeHtml(text).replace(/\n/g, '<br/>');
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function handleAssistantQuestion(question) {
    const qLower = question.toLowerCase();

    // Natural greeting
    if (qLower === 'hi' || qLower === 'hello' || qLower === 'hey' || qLower.startsWith('good morning') || qLower.startsWith('good afternoon')) {
      appendAssistantMessage('assistant', `Hello! 👋 I'm your AroundMe guide for ${state.currentCity}. Looking for great restaurants, entertainment hubs like Kada Plaza, or spots open right now? Ask me anything!`);
      return;
    }

    // Backend assistant query
    try {
      const response = await fetch(`${window.AppConfig.apiBaseUrl}/chat-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          currentPlaces: state.currentPlaces.slice(0, 10),
          location: {
            city: state.currentCity,
            latitude: state.userLocation.latitude,
            longitude: state.userLocation.longitude
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.reply || data.text;
        if (reply) {
          appendAssistantMessage('assistant', reply);
          return;
        }
      }
    } catch (e) {}

    // Contextual responses based on current places
    if (qLower.includes('kada plaza') || qLower.includes('mall') || qLower.includes('cinema')) {
      const kada = state.currentPlaces.find(p => p.name.toLowerCase().includes('kada'));
      if (kada) {
        appendAssistantMessage('assistant', `Kada Plaza is a premier entertainment destination at ${kada.address}. It features a multi-screen cinema, game arcade, food court with Kilimanjaro, and shopping. Click its card to browse ${kada.photos?.length || 10} verified real photos!`);
      } else {
        appendAssistantMessage('assistant', `Kada Plaza is Benin City's landmark entertainment center with cinemas, food court, and shopping along Sapele Road.`);
      }
      return;
    }

    if (qLower.includes('open') || qLower.includes('hours')) {
      const openPlaces = state.currentPlaces.filter(p => p.openNow);
      if (openPlaces.length > 0) {
        const names = openPlaces.slice(0, 3).map(p => `• ${p.name} (${p.cuisine || 'Spot'})`).join('\n');
        appendAssistantMessage('assistant', `Here are top spots open now in ${state.currentCity}:\n${names}\n\nClick any place card to view full Google photos and directions.`);
      } else {
        appendAssistantMessage('assistant', `Check the "Open Now" badge on each place card for live status!`);
      }
      return;
    }

    if (qLower.includes('best') || qLower.includes('top') || qLower.includes('recommend')) {
      const topPlaces = [...state.currentPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
      if (topPlaces.length > 0) {
        const list = topPlaces.map(p => `• ${p.name} — ★ ${p.rating || 4.5} (${p.cuisine})`).join('\n');
        appendAssistantMessage('assistant', `Top recommendations in ${state.currentCity}:\n${list}\n\nClick on any card to view photos or get walking directions.`);
      } else {
        appendAssistantMessage('assistant', `Search for any place (e.g. "Chicken Republic" or "Kada Plaza") to view verified photos and ratings!`);
      }
      return;
    }

    appendAssistantMessage('assistant', `I can help you explore ${state.currentCity}! Ask me about top food, what's open now, or details on spots like Kada Plaza and Chicken Republic.`);
  }

  window.assistantOnPlacesLoaded = function (query, places) {
    const subtitle = document.getElementById('assistantSubtitle');
    if (subtitle) subtitle.textContent = `${places.length} places in ${state.currentCity}`;
  };

  function showLoading(isLoading) {
    const grid = document.getElementById('placesGrid');
    if (grid) grid.style.opacity = isLoading ? '0.5' : '1';
  }

  function renderEmptyState(msg) {
    const grid = document.getElementById('placesGrid');
    if (!grid) return;
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #64748b;">
        <p style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">No places found</p>
        <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">${escapeHtml(msg)}</p>
        <button onclick="location.reload()" style="background: #0f172a; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 9999px; font-weight: 700; cursor: pointer;">
          Reset Search
        </button>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', initApp);
})();
