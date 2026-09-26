import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  MapPin,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    signInWithGoogle,
    signInWithProfile,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'google' | 'profile'>('google');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Profile form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [city, setCity] = useState('Benin City');
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch {
      // Error handled in AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await signInWithProfile({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        city: city.trim(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white relative">
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">
              AroundMe AI Access
            </span>
          </div>
          <h3 className="text-xl font-black text-white">
            {mode === 'google' ? 'Sign In / Register' : 'Instant Profile Account'}
          </h3>
          <p className="text-xs text-amber-100 mt-1">
            Sync saved favorite restaurants, search history & custom dining preferences.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('google')}
            className={`py-3 transition-colors cursor-pointer ${
              mode === 'google'
                ? 'bg-white text-slate-900 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            onClick={() => setMode('profile')}
            className={`py-3 transition-colors cursor-pointer ${
              mode === 'profile'
                ? 'bg-white text-slate-900 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Sign-In (Direct)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Friendly alert if an error occurred */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Authentication Notice</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">{authError}</p>
                </div>
              </div>

              {authError.includes('authorized') && currentHostname && (
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-amber-700 truncate max-w-[200px]">
                    {currentHostname}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedDomain ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'google' ? (
            <div className="space-y-4 py-2">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    {/* Google SVG Icon */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  Or instant setup
                </span>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-500 mb-3">
                  Prefer not to use Google OAuth popup? Create an instant profile account:
                </p>
                <button
                  type="button"
                  onClick={() => setMode('profile')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Create / Sign In via Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name / Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anthony Frederick"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="anthonyfredericktosa@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="+234 809 811 4106"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary City
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Benin City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !email.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign In & Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400">
            Protected by Cloud Firestore & Zero-Trust security rules.
          </div>
        </div>
      </div>
    </div>
  );
};
