# Security Specification - AroundMe AI

## 1. Data Invariants
- Each user profile `/users/{userId}` can only be accessed or modified by the authenticated user whose `request.auth.uid == userId`.
- Subcollections `/users/{userId}/favorites/{favoriteId}`, `/users/{userId}/search_history/{historyId}`, and `/users/{userId}/preferences/{prefId}` require that the requesting user's UID matches the path `{userId}`.
- Unauthenticated requests are completely denied from reading or writing user data.
- The `userId` property within saved documents must match `request.auth.uid`.

## 2. The "Dirty Dozen" Test Payloads
1. Unauthenticated write to `/users/abc`: REJECT (unauthenticated)
2. Authenticated user A writing to `/users/userB`: REJECT (permission denied, UID mismatch)
3. User A writing to `/users/userA/favorites/fav1` with `userId: 'userB'`: REJECT (identity spoofing)
4. User A trying to read `/users/userB/favorites`: REJECT (cannot list other users' favorites)
5. User A injecting 10KB string into query: REJECT (exceeds maxLength)
6. Anonymous user trying to access verified user data: REJECT
7. Deletion of another user's favorite: REJECT
8. Modifying another user's search history: REJECT
9. Updating immutable fields like `createdAt` with a different timestamp: REJECT
10. Attempting to read `/users` root collection without document ID: REJECT (blanket read denied)
11. Attempting to write unexpected keys (shadow fields) to `/users/{userId}`: REJECT
12. Attempting to inject negative or invalid values for rating or distance: REJECT
