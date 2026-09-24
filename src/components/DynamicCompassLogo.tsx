import React from 'react';

interface DynamicCompassLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isSearching?: boolean;
}

export const DynamicCompassLogo: React.FC<DynamicCompassLogoProps> = ({
  className = '',
  size = 'md',
  isSearching = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const needleSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 shadow-sm group cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${sizeClasses[size]} ${className}`}
      title="AroundMe AI Live Compass"
    >
      {/* Outer subtle glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-emerald-400 blur-xs opacity-30 group-hover:opacity-60 transition-opacity" />

      {/* Dial Face (Crisp Navy-Charcoal with golden accents) */}
      <div className="relative w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
        {/* Subtle cardinal tick ring */}
        <div className="absolute inset-1 rounded-full border border-amber-400/20" />
        <span className="absolute top-0.5 text-[7px] font-black text-amber-400 tracking-tighter">N</span>
        <span className="absolute bottom-0.5 text-[6px] font-bold text-slate-400">S</span>
        <span className="absolute right-0.5 text-[6px] font-bold text-slate-400">E</span>
        <span className="absolute left-0.5 text-[6px] font-bold text-slate-400">W</span>

        {/* Dynamic Rotating Compass Needle */}
        <div
          className={`relative flex items-center justify-center transition-all ${
            isSearching
              ? 'animate-[spin_1.5s_linear_infinite]'
              : 'animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`${needleSizes[size]} drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* North pointer (vibrant warm flame amber) */}
            <polygon points="12,2 15,12 12,9.5 9,12" fill="url(#northAmberGrad)" />
            {/* South pointer (bright fresh emerald) */}
            <polygon points="12,22 15,12 12,14.5 9,12" fill="url(#southEmeraldGrad)" />
            {/* Center Pivot Jewel */}
            <circle cx="12" cy="12" r="2" fill="#ffffff" stroke="#d97706" strokeWidth="1.2" />

            <defs>
              <linearGradient id="northAmberGrad" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="southEmeraldGrad" x1="12" y1="12" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Dynamic Radar Pulse Ring */}
        <div className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping pointer-events-none" />
      </div>
    </div>
  );
};
