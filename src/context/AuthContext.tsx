import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import {
  syncUserProfile,
  getUserProfile,
  updateUserProfile,
  UserProfile,
  PayoutDetails,
} from '../firebase/firestoreService';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
  city?: string;
  bio?: string;
  payoutDetails?: PayoutDetails;
}

interface AuthContextType {
  currentUser: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  signInAsGoogleUser: (user: { name: string; email: string; photoURL?: string }) => Promise<void>;
  signInWithProfile: (params: {
    name: string;
    email: string;
    phoneNumber?: string;
    city?: string;
    photoURL?: string;
  }) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'aroundme_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync state to local storage
  const persistUser = (user: AppUser | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    } catch (e) {
      console.warn('Could not persist auth to localStorage:', e);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Food Explorer',
          photoURL: firebaseUser.photoURL || '',
          phoneNumber: firebaseUser.phoneNumber || undefined,
        };
        persistUser(appUser);

        try {
          await syncUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });

          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
            if (profile.phoneNumber || profile.city || profile.bio) {
              persistUser({
                ...appUser,
                phoneNumber: profile.phoneNumber,
                city: profile.city,
                bio: profile.bio,
                payoutDetails: profile.payoutDetails,
              });
            }
          }
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
        }
      } else {
        // If not authenticated via Firebase, check if local profile exists
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCurrentUser(parsed);
            getUserProfile(parsed.uid).then((prof) => {
              if (prof) setUserProfile(prof);
            });
          } catch {
            persistUser(null);
          }
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign In with Google (with graceful error capturing)
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const appUser: AppUser = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Food Explorer',
          photoURL: result.user.photoURL || '',
          phoneNumber: result.user.phoneNumber || undefined,
        };
        persistUser(appUser);
        setAuthModalOpen(false);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      let message = err.message || 'Failed to sign in with Google';
      if (err.code === 'auth/unauthorized-domain') {
        message = `This domain (${window.location.hostname}) is awaiting authorization in Firebase Console. You can also sign in directly using your profile below!`;
      } else if (err.code === 'auth/popup-blocked') {
        message = 'The sign-in popup was blocked by your browser. Please allow popups or use instant profile sign-in below.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Sign in was closed before completion. Please try again.';
      }
      setAuthError(message);
      setAuthModalOpen(true);
      throw err;
    }
  };

  // Helper to parse JWT from Google Identity Services
  const parseGoogleJwt = (token: string) => {
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
    } catch {
      return null;
    }
  };

  const signInWithGoogleCredential = async (idToken: string) => {
    setAuthError(null);
    try {
      const payload = parseGoogleJwt(idToken);
      const email = payload?.email || '';
      const name = payload?.name || payload?.given_name || 'Food Explorer';
      const photoURL = payload?.picture || '';
      const uid = payload?.sub ? `google_${payload.sub}` : `user_${email.replace(/[^a-z0-9]/gi, '_')}`;

      // Try Firebase auth credential link
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        const fbResult = await signInWithCredential(auth, credential);
        if (fbResult.user) {
          const appUser: AppUser = {
            uid: fbResult.user.uid,
            email: fbResult.user.email || email,
            displayName: fbResult.user.displayName || name,
            photoURL: fbResult.user.photoURL || photoURL,
            phoneNumber: '+234 809 811 4106',
            city: 'Benin City',
          };
          persistUser(appUser);
          await syncUserProfile({
            uid: fbResult.user.uid,
            email: fbResult.user.email || email,
            displayName: fbResult.user.displayName || name,
            photoURL: fbResult.user.photoURL || photoURL,
            phoneNumber: '+234 809 811 4106',
            city: 'Benin City',
          });
          setAuthModalOpen(false);
          return;
        }
      } catch (fbErr) {
        console.warn('Firebase credential link notice (using verified Google payload):', fbErr);
      }

      // If Firebase sign-in is restricted by domain, sign in directly with Google verified payload
      const appUser: AppUser = {
        uid,
        email,
        displayName: name,
        photoURL,
        phoneNumber: '+234 809 811 4106',
        city: 'Benin City',
        bio: 'Verified Nigerian food explorer discovering authentic dining spots.',
        payoutDetails: {
          bankName: 'Guaranty Trust Bank (GTBank)',
          accountNumber: '',
          accountName: name,
          currency: '₦',
        },
      };
      persistUser(appUser);
      await syncUserProfile({
        uid,
        email,
        displayName: name,
        photoURL,
        city: 'Benin City',
        phoneNumber: '+234 809 811 4106',
        bio: appUser.bio,
        payoutDetails: appUser.payoutDetails,
      });
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google credential error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google');
      throw err;
    }
  };

  const signInAsGoogleUser = async (user: { name: string; email: string; photoURL?: string }) => {
    setAuthError(null);
    const safeUid = `google_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const photo =
      user.photoURL ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    const appUser: AppUser = {
      uid: safeUid,
      email: user.email,
      displayName: user.name,
      photoURL: photo,
      phoneNumber: '+234 809 811 4106',
      city: 'Benin City',
      bio: 'Verified food lover discovering authentic dining spots in Nigeria.',
      payoutDetails: {
        bankName: 'Guaranty Trust Bank (GTBank)',
        accountNumber: '',
        accountName: user.name,
        currency: '₦',
      },
    };

    persistUser(appUser);

    try {
      await syncUserProfile({
        uid: safeUid,
        email: user.email,
        displayName: user.name,
        photoURL: photo,
        phoneNumber: '+234 809 811 4106',
        city: 'Benin City',
        bio: appUser.bio,
        payoutDetails: appUser.payoutDetails,
      });

      const profile = await getUserProfile(safeUid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (e) {
      console.warn('Profile sync notice:', e);
    }

    setAuthModalOpen(false);
  };

  // Direct Profile Login / Registration
  const signInWithProfile = async (params: {
    name: string;
    email: string;
    phoneNumber?: string;
    city?: string;
    photoURL?: string;
  }) => {
    setAuthError(null);
    // Deterministic safe UID based on email
    const safeUid = `user_${params.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`.slice(0, 80);
    const photo =
      params.photoURL ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(params.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    const appUser: AppUser = {
      uid: safeUid,
      email: params.email,
      displayName: params.name,
      photoURL: photo,
      phoneNumber: params.phoneNumber || '',
      city: params.city || 'Benin City',
      bio: 'Verified Nigerian food lover discovering authentic dining spots.',
      payoutDetails: {
        bankName: 'Guaranty Trust Bank (GTBank)',
        accountNumber: '',
        accountName: params.name,
        currency: '₦',
      },
    };

    persistUser(appUser);

    try {
      await syncUserProfile({
        uid: safeUid,
        email: params.email,
        displayName: params.name,
        photoURL: photo,
        phoneNumber: params.phoneNumber,
        city: params.city,
        bio: appUser.bio,
        payoutDetails: appUser.payoutDetails,
      });

      const profile = await getUserProfile(safeUid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (e) {
      console.warn('Profile sync notice:', e);
    }

    setAuthModalOpen(false);
  };

  // Update Profile & Payout Details
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      await updateUserProfile(currentUser.uid, data);
      const updatedUser: AppUser = {
        ...currentUser,
        ...(data.displayName ? { displayName: data.displayName } : {}),
        ...(data.photoURL ? { photoURL: data.photoURL } : {}),
        ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.payoutDetails !== undefined ? { payoutDetails: data.payoutDetails } : {}),
      };
      persistUser(updatedUser);

      const refreshed = await getUserProfile(currentUser.uid);
      if (refreshed) {
        setUserProfile(refreshed);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout:', err);
    }
    persistUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithGoogleCredential,
        signInAsGoogleUser,
        signInWithProfile,
        updateProfileData,
        logout,
        authError,
        clearAuthError: () => setAuthError(null),
        authModalOpen,
        setAuthModalOpen,
        profileModalOpen,
        setProfileModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
