/**
 * /js/auth.js - Google Identity Services (GIS) Authentication Module
 * 
 * Provides robust Google Sign-In using the latest official Google Identity Services library.
 * - Initializes GIS client with OAuth Client ID
 * - Renders official Google Sign-In button
 * - Safely decodes credential JWT on the client
 * - Persists authenticated session in localStorage
 * - Seamless sign-in, profile avatar display, and logout
 */

const AppAuth = {
  user: null,
  isInitialized: false,

  /**
   * Initializes authentication on page load
   */
  async init() {
    // 1. Restore existing session from localStorage
    this.restoreSession();

    // 2. Wait for Google Identity Services (GIS) script to load
    this.waitForGis(() => {
      this.initGis();
    });

    // 3. Update the UI based on restored user state
    this.updateAuthUI();
  },

  /**
   * Restores user state from localStorage
   */
  restoreSession() {
    try {
      const stored = localStorage.getItem('aroundme_user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse user session from localStorage', e);
      localStorage.removeItem('aroundme_user');
      this.user = null;
    }
  },

  /**
   * Polls until window.google.accounts.id is available
   */
  waitForGis(callback, maxAttempts = 35) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('Google Identity Services script took too long to load.');
      }
    }, 150);
  },

  /**
   * Initializes GIS with client ID and callback
   */
  initGis() {
    if (!window.google?.accounts?.id) return;

    const clientId = window.AppConfig?.googleClientId;
    if (!clientId) {
      console.warn('Google Client ID is missing. Check /js/config.js');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      this.isInitialized = true;
      this.renderGoogleButton();
    } catch (err) {
      console.error('Failed to initialize Google Identity Services:', err);
    }
  },

  /**
   * Renders the standard Google Sign-In button
   */
  renderGoogleButton() {
    const btnContainer = document.getElementById('googleSignInBtn');
    if (!btnContainer || !window.google?.accounts?.id) return;

    btnContainer.innerHTML = '';

    try {
      window.google.accounts.id.renderButton(btnContainer, {
        type: 'standard',
        theme: 'filled_black',
        size: 'medium',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
      });
    } catch (e) {
      console.error('Failed to render Google button:', e);
    }
  },

  /**
   * Handles the JWT credential response returned by Google Identity Services
   */
  handleCredentialResponse(response) {
    if (!response || !response.credential) {
      console.error('Invalid credential response from Google');
      return;
    }

    try {
      const payload = this.parseJwt(response.credential);
      if (!payload || !payload.sub) {
        throw new Error('Failed to parse Google JWT');
      }

      this.user = {
        id: payload.sub,
        name: payload.name || 'Explorer',
        givenName: payload.given_name || payload.name?.split(' ')[0] || 'Explorer',
        email: payload.email,
        picture: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=F59E0B&color=fff`,
        idToken: response.credential,
        loginTime: new Date().toISOString()
      };

      // Save user session in localStorage
      localStorage.setItem('aroundme_user', JSON.stringify(this.user));

      // Update UI elements
      this.updateAuthUI();

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('aroundme_auth_change', { detail: { user: this.user } }));

      this.showToast(`Welcome back, ${this.user.givenName}!`);
    } catch (err) {
      console.error('Error handling Google credential:', err);
      this.showToast('Login failed. Please try again.');
    }
  },

  /**
   * Safely decodes a JWT token with UTF-8 character support
   */
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('JWT parse error', e);
      return null;
    }
  },

  /**
   * Signs the user out, clears storage, and updates UI
   */
  signOut() {
    this.user = null;
    localStorage.removeItem('aroundme_user');

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }

    this.updateAuthUI();
    this.renderGoogleButton();

    window.dispatchEvent(new CustomEvent('aroundme_auth_change', { detail: { user: null } }));
    this.showToast('Signed out successfully.');
  },

  /**
   * Updates header authentication UI (shows avatar and name or sign-in button)
   */
  updateAuthUI() {
    const signedInContainer = document.getElementById('userProfileContainer');
    const signedOutContainer = document.getElementById('googleSignInBtn');
    const userNameEl = document.getElementById('userNameDisplay');
    const userAvatarEl = document.getElementById('userAvatarImg');

    if (this.user) {
      if (signedInContainer) signedInContainer.style.display = 'flex';
      if (signedOutContainer) signedOutContainer.style.display = 'none';

      if (userNameEl) userNameEl.textContent = this.user.givenName || this.user.name;
      if (userAvatarEl) {
        userAvatarEl.src = this.user.picture;
        userAvatarEl.alt = this.user.name;
      }
    } else {
      if (signedInContainer) signedInContainer.style.display = 'none';
      if (signedOutContainer) signedOutContainer.style.display = 'block';
    }
  },

  /**
   * Lightweight toast notification
   */
  showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
};

window.AppAuth = AppAuth;

document.addEventListener('DOMContentLoaded', () => {
  AppAuth.init();

  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AppAuth.signOut();
    });
  }
});
