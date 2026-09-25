import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Heart,
  ArrowUp,
  Send,
  CheckCircle2,
  Sparkles,
  Utensils,
  MessageSquare,
  ShieldCheck,
  X,
  Compass,
  Building2,
  Navigation,
} from 'lucide-react';
import { DynamicCompassLogo } from './DynamicCompassLogo';
import { UserLocation } from '../types';

interface FooterProps {
  currentLocation?: UserLocation;
  onQuickSearch?: (query: string) => void;
  onQuickSwitchLocation?: (city: string, lat: number, lng: number) => void;
  onOpenLocationModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLocation,
  onQuickSearch,
  onQuickSwitchLocation,
  onOpenLocationModal,
}) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('Feedback & Suggestion');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Quick categories for prompt search
  const popularCravings = [
    { label: 'Good food & dinner', query: 'Best dinner and good food restaurants' },
    { label: 'Ice cream & desserts', query: 'Ice cream parlors and desserts' },
    { label: 'Local Edo & Nigerian dishes', query: 'Local Nigerian food, pounded yam, egusi and soups' },
    { label: 'Suya, grills & shawarma', query: 'Best suya spots and grills' },
    { label: 'Lagos seafood & rooftop dining', query: 'Seafood and rooftop lounge restaurants' },
    { label: 'Family-friendly casual', query: 'Family friendly casual restaurants' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContactModalOpen(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 2200);
  };

  return (
    <footer className="mt-6 border-t border-slate-200/80 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Main Catchphrase Hero Banner */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Discovery Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Find anything around you.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Whether you are in Benin City craving traditional Edo delicacies or in Lagos searching for rooftop seafood and artisanal ice cream, discover verified spots with live photos, menus, reviews, and precise travel times.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Me</span>
              </button>

              <button
                type="button"
                onClick={onOpenLocationModal}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Change City</span>
              </button>
            </div>
          </div>

          {/* Popular instant craving search pills */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Craving Search
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularCravings.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (onQuickSearch) {
                      onQuickSearch(item.query);
                      scrollToTop();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DynamicCompassLogo size="sm" />
              <div>
                <span className="text-lg font-bold text-white tracking-tight">AroundMe</span>
                <span className="text-lg font-bold text-amber-400 ml-1">AI</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time hyper-local restaurant intelligence. Powered by live location tracking, Google Places grounding, and community-verified diner experiences.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Active in{' '}
                <strong className="text-white">
                  {currentLocation?.city || 'Benin City, Edo State'}
                </strong>
              </span>
            </div>
          </div>

          {/* Column 2: Supported Hubs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Explore Locations</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onQuickSwitchLocation) {
                      onQuickSwitchLocation('Benin City, Edo State', 6.3350, 5.6037);
                      scrollToTop();
                    }
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Benin City (GRA, Airport Rd, Uselu)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onQuickSwitchLocation) {
                      onQuickSwitchLocation('Lagos State, Nigeria', 6.5244, 3.3792);
                      scrollToTop();
                    }
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Lagos State (VI, Lekki, Ikeja)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onQuickSwitchLocation) {
                      onQuickSwitchLocation('Abuja, FCT, Nigeria', 9.0765, 7.3986);
                      scrollToTop();
                    }
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Abuja FCT (Maitama, Wuse 2, Garki)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-2 cursor-pointer pt-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Auto-Detect Current GPS</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Discovery */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Features</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Photo Real Restaurant Galleries</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Walking, Driving & Transit ETAs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Direct Phone & Direction Links</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Community Dish Reviews & Ratings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interactive Map & List Views</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Get in Touch</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have a favorite restaurant to add, need to update information, or want to share your thoughts? We'd love to hear from you.
            </p>
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact Me</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fast response & daily updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution & Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} AroundMe AI. All rights reserved.
            </p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <p className="flex items-center gap-1">
              <span>Designed by</span>
              <span className="text-amber-400 font-semibold">AroundMe Team</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500 inline ml-0.5" />
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Contact Me
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              title="Back to top"
            >
              <span className="text-[11px] font-medium hidden md:inline">Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Contact Me Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 text-white">
            <button
              type="button"
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Sent Successfully!</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Thank you for reaching out. We will review your message and get back to you promptly.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Contact Me</h3>
                    <p className="text-xs text-slate-400">
                      Send your questions, restaurant suggestions, or feedback
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="Feedback & Suggestion">General Feedback & Suggestion</option>
                      <option value="Suggest a Restaurant">Suggest a New Restaurant</option>
                      <option value="Report Info">Report Incorrect Details / Closed Venue</option>
                      <option value="Business Partnership">Restaurant Owner / Partnership</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Osas or Amaka"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message, suggested restaurant name, location, or notes..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
