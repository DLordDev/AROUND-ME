import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';

export interface PayoutDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  city?: string;
  bio?: string;
  payoutDetails?: PayoutDetails;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteRestaurant {
  id?: string;
  userId: string;
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  address?: string;
  photoUrl?: string;
  cuisine?: string;
  priceLevel?: number;
  lat?: number;
  lng?: number;
  openNow?: boolean;
  googleMapsUrl?: string;
  createdAt: string;
}

export interface SearchHistoryItem {
  id?: string;
  userId: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface UserPreferences {
  userId: string;
  dietaryRestrictions: string;
  pricePreference: string;
  maxDistanceMiles: number;
  updatedAt: string;
}

// 1. User Profile
export async function syncUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  city?: string | null;
  bio?: string | null;
  payoutDetails?: PayoutDetails | null;
}): Promise<void> {
  if (!user.uid || !user.email) return;
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    const now = new Date().toISOString();
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Food Explorer',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || 'Benin City',
        bio: user.bio || 'Passionate Nigerian foodie exploring authentic restaurants.',
        payoutDetails: user.payoutDetails || {
          bankName: 'Guaranty Trust Bank (GTBank)',
          accountNumber: '',
          accountName: user.displayName || '',
          currency: '₦',
        },
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const data = existing.data();
      await setDoc(
        userDocRef,
        {
          displayName: user.displayName || data.displayName,
          photoURL: user.photoURL || data.photoURL,
          ...(user.phoneNumber !== undefined ? { phoneNumber: user.phoneNumber } : {}),
          ...(user.city !== undefined ? { city: user.city } : {}),
          ...(user.bio !== undefined ? { bio: user.bio } : {}),
          ...(user.payoutDetails !== undefined ? { payoutDetails: user.payoutDetails } : {}),
          updatedAt: now,
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const now = new Date().toISOString();
    await setDoc(
      userDocRef,
      {
        ...data,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// 2. Favorites
export async function addFavorite(userId: string, restaurant: Omit<FavoriteRestaurant, 'userId' | 'createdAt'>): Promise<void> {
  const safeDocId = restaurant.placeId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  const path = `users/${userId}/favorites/${safeDocId}`;
  try {
    const favRef = doc(db, 'users', userId, 'favorites', safeDocId);
    await setDoc(favRef, {
      ...restaurant,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeFavorite(userId: string, placeId: string): Promise<void> {
  const safeDocId = placeId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  const path = `users/${userId}/favorites/${safeDocId}`;
  try {
    const favRef = doc(db, 'users', userId, 'favorites', safeDocId);
    await deleteDoc(favRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToFavorites(
  userId: string,
  onUpdate: (favorites: FavoriteRestaurant[]) => void,
  onError?: (err: unknown) => void
) {
  const path = `users/${userId}/favorites`;
  const favCol = collection(db, 'users', userId, 'favorites');
  return onSnapshot(
    favCol,
    (snapshot) => {
      const favs: FavoriteRestaurant[] = [];
      snapshot.forEach((docSnap) => {
        favs.push({ id: docSnap.id, ...(docSnap.data() as FavoriteRestaurant) });
      });
      onUpdate(favs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 3. Search History
export async function recordSearchHistory(userId: string, searchQuery: string, count: number): Promise<void> {
  if (!searchQuery.trim()) return;
  const historyId = `search_${Date.now()}`;
  const path = `users/${userId}/search_history/${historyId}`;
  try {
    const docRef = doc(db, 'users', userId, 'search_history', historyId);
    await setDoc(docRef, {
      userId,
      query: searchQuery.trim().slice(0, 500),
      timestamp: new Date().toISOString(),
      resultCount: count,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToSearchHistory(
  userId: string,
  onUpdate: (history: SearchHistoryItem[]) => void,
  onError?: (err: unknown) => void
) {
  const path = `users/${userId}/search_history`;
  const historyCol = collection(db, 'users', userId, 'search_history');
  const q = query(historyCol, orderBy('timestamp', 'desc'), limit(15));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: SearchHistoryItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as SearchHistoryItem) });
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 4. Preferences
export async function savePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
  const path = `users/${userId}/preferences/default`;
  try {
    const prefRef = doc(db, 'users', userId, 'preferences', 'default');
    await setDoc(
      prefRef,
      {
        userId,
        dietaryRestrictions: prefs.dietaryRestrictions || '',
        pricePreference: prefs.pricePreference || 'all',
        maxDistanceMiles: prefs.maxDistanceMiles || 10,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getPreferences(userId: string): Promise<UserPreferences | null> {
  const path = `users/${userId}/preferences/default`;
  try {
    const prefRef = doc(db, 'users', userId, 'preferences', 'default');
    const snap = await getDoc(prefRef);
    if (snap.exists()) {
      return snap.data() as UserPreferences;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// 5. Community Restaurant Reviews
export interface RestaurantReview {
  id?: string;
  placeId: string;
  placeName: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  dishesOrdered?: string;
  createdAt: string;
}

export async function submitRestaurantReview(
  review: Omit<RestaurantReview, 'id' | 'createdAt'>
): Promise<string> {
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `reviews/${reviewId}`;
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const data: RestaurantReview = {
      ...review,
      id: reviewId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(reviewRef, data);
    return reviewId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export function subscribeToPlaceReviews(
  placeId: string,
  onUpdate: (reviews: RestaurantReview[]) => void,
  onError?: (err: unknown) => void
) {
  const path = `reviews`;
  const reviewsCol = collection(db, 'reviews');
  // Order by createdAt desc
  const q = query(reviewsCol, orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RestaurantReview[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as RestaurantReview;
        if (!placeId || data.placeId === placeId) {
          items.push({ id: d.id, ...data });
        }
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToRecentReviews(
  onUpdate: (reviews: RestaurantReview[]) => void,
  maxCount = 10,
  onError?: (err: unknown) => void
) {
  const path = `reviews`;
  const reviewsCol = collection(db, 'reviews');
  const q = query(reviewsCol, orderBy('createdAt', 'desc'), limit(maxCount));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RestaurantReview[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as RestaurantReview) });
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function deleteRestaurantReview(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
