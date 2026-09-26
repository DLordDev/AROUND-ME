import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  CheckCircle2,
  Sliders,
  DollarSign,
  Sparkles,
  Save,
  Loader2,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NIGERIAN_BANKS = [
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'Access Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Microfinance Bank',
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Wema Bank / ALAT',
  'Union Bank',
  'Ecobank Nigeria',
];

export const ProfileModal: React.FC = () => {
  const { currentUser, userProfile, updateProfileData, profileModalOpen, setProfileModalOpen } =
    useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'preferences'>('profile');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Payout State
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [payoutCurrency, setPayoutCurrency] = useState('₦');

  // Load current values
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setCity(currentUser.city || 'Benin City');
      setBio(currentUser.bio || 'Verified foodie exploring authentic restaurants.');
      setPhotoURL(currentUser.photoURL || '');

      const details = currentUser.payoutDetails || userProfile?.payoutDetails;
      if (details) {
        setBankName(details.bankName || 'Guaranty Trust Bank (GTBank)');
        setAccountNumber(details.accountNumber || '');
        setAccountName(details.accountName || currentUser.displayName || '');
        setPayoutCurrency(details.currency || '₦');
      } else {
        setAccountName(currentUser.displayName || '');
      }
    }
  }, [currentUser, userProfile, profileModalOpen]);

  if (!profileModalOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        city: city.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim(),
        payoutDetails: {
          bankName,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          currency: payoutCurrency,
        },
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white relative border-b border-slate-800">
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 bg-slate-800 shadow-md">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-amber-400 text-xl">
                  {displayName.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-black text-white">{displayName || 'User Profile'}</h3>
                <span className="p-0.5 rounded-full bg-amber-400/20 text-amber-400" title="Verified Member">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  📍 {city || 'Nigeria'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {payoutCurrency} Payout Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-amber-800 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-white text-amber-800 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Payouts & Bank Info</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'profile' ? (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 bg-slate-100 text-xs cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Primary identifier registered with AroundMe AI.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="+234 809 811 4106"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary City</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Benin City or Lagos"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Culinary Bio / Tagline</label>
                <textarea
                  rows={2}
                  placeholder="Tell us what kind of food you love (e.g. Traditional Edo soups, shawarma, crispy chicken...)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900 bg-slate-50 focus:bg-white text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Virtual ATM Card / Payout Card Preview */}
              <div className="relative rounded-2xl p-5 bg-gradient-to-tr from-slate-900 via-amber-950 to-slate-900 text-white shadow-xl border border-amber-500/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                      {bankName.split(' ')[0]} Payout Account
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="my-3 font-mono text-base tracking-widest text-amber-100">
                  {accountNumber ? accountNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• ••••'}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Account Name</span>
                    <span className="font-bold text-white uppercase">{accountName || displayName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase">Currency</span>
                    <span className="font-bold text-amber-400">{payoutCurrency} NGN</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium text-xs focus:border-amber-500 focus:outline-hidden"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Number (10 Digits)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="Exact name on bank account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 text-xs font-medium focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payout Currency</label>
                <div className="flex gap-2">
                  {[
                    { label: 'Nigerian Naira (₦ NGN)', symbol: '₦' },
                    { label: 'US Dollars ($ USD)', symbol: '$' },
                  ].map((curr) => (
                    <button
                      key={curr.symbol}
                      type="button"
                      onClick={() => setPayoutCurrency(curr.symbol)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        payoutCurrency === curr.symbol
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Payouts from group restaurant dining bill splitting and foodie rewards are credited directly to this account.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              {savedSuccess ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Saved to Cloud Firestore!
                </span>
              ) : (
                'Synced across all your devices'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-white" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
