import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Trash2, LogIn, CheckCircle, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  RestaurantReview,
  submitRestaurantReview,
  subscribeToPlaceReviews,
  deleteRestaurantReview,
} from '../firebase/firestoreService';
import { Place } from '../types';

interface ReviewsSectionProps {
  place: Place;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ place }) => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [dishesOrdered, setDishesOrdered] = useState('');

  // Subscribe to real-time reviews in Firestore for this restaurant
  useEffect(() => {
    setLoadingReviews(true);
    const unsub = subscribeToPlaceReviews(
      place.id,
      (fetchedReviews) => {
        setReviews(fetchedReviews);
        setLoadingReviews(false);
      },
      (err) => {
        console.error('Error fetching reviews:', err);
        setLoadingReviews(false);
      }
    );
    return unsub;
  }, [place.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) {
      setErrorMsg('Please write a short review before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await submitRestaurantReview({
        placeId: place.id,
        placeName: place.name,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Food Explorer',
        userPhoto: currentUser.photoURL || undefined,
        rating,
        comment: comment.trim(),
        dishesOrdered: dishesOrdered.trim() || undefined,
      });

      setComment('');
      setDishesOrdered('');
      setSuccessMsg('Thank you! Your verified dining review has been posted.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setErrorMsg(err.message || 'Failed to submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to remove your review?')) return;
    try {
      await deleteRestaurantReview(reviewId);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Customer Community Reviews</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Real feedback and recommended dishes from verified diners
          </p>
        </div>
      </div>

      {/* Review Submission Form / Google Auth Prompt */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        {currentUser ? (
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-7 h-7 rounded-full object-cover border border-amber-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Verified Google Account
                  </span>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 mr-1.5 font-medium">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 text-amber-400 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    title={`${star} Star`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dish Recommendation input */}
            <div>
              <input
                type="text"
                value={dishesOrdered}
                onChange={(e) => setDishesOrdered(e.target.value)}
                placeholder="What did you order? e.g. Special Grilled Fish, Jollof & Chicken, Meat Pie..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Review Comment Textarea */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={`Share your dining experience at ${place.name}: food taste, speed, ambience, pricing...`}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {1000 - comment.length} characters left
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-slate-600">
              Sign in with your Google account to drop a verified diner review and rate this place.
            </p>
            <button
              onClick={signInWithGoogle}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Sign In with Google to Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loadingReviews ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading diner reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-800">No community reviews yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Be the first to share your thoughts and recommend a signature dish!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {rev.userPhoto ? (
                    <img
                      src={rev.userPhoto}
                      alt={rev.userName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      {rev.userName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {rev.userName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          rev.rating >= s
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {currentUser && currentUser.uid === rev.userId && rev.id && (
                    <button
                      onClick={() => handleDelete(rev.id!)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {rev.dishesOrdered && (
                <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block border border-amber-200">
                  Ordered: {rev.dishesOrdered}
                </div>
              )}

              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
