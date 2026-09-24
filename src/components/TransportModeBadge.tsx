import React from 'react';
import { Footprints, Car, Navigation } from 'lucide-react';
import { TravelEstimates } from '../utils/travelTime';

interface TransportModeBadgeProps {
  estimates: TravelEstimates;
  preferredMode?: 'both' | 'walking' | 'driving';
  onSelectMode?: (mode: 'walking' | 'driving') => void;
  compact?: boolean;
}

export const TransportModeBadge: React.FC<TransportModeBadgeProps> = ({
  estimates,
  preferredMode = 'both',
  onSelectMode,
  compact = false,
}) => {
  const isWalkPreferred = preferredMode === 'walking';
  const isDrivePreferred = preferredMode === 'driving';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold">
        <a
          href={estimates.walkDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onSelectMode?.('walking');
          }}
          title={`Walk: ${estimates.walkFormatted} (${estimates.distanceFormatted}). Click for route`}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
            isWalkPreferred
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Footprints className="w-3 h-3 shrink-0" />
          <span>{estimates.walkBadge}</span>
        </a>

        <a
          href={estimates.driveDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onSelectMode?.('driving');
          }}
          title={`Drive: ${estimates.driveFormatted} (${estimates.distanceFormatted}). Click for route`}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
            isDrivePreferred
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
          }`}
        >
          <Car className="w-3 h-3 shrink-0" />
          <span>{estimates.driveBadge}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 rounded-xl p-1.5 border border-slate-200 flex items-center justify-between gap-1.5">
      {/* Walking Estimate */}
      <a
        href={estimates.walkDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
          onSelectMode?.('walking');
        }}
        title={`Walking directions: ${estimates.walkFormatted} · ~${estimates.walkSteps.toLocaleString()} steps`}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-all group ${
          isWalkPreferred
            ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300 shadow-xs'
            : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-transparent'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
            isWalkPreferred
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors'
          }`}
        >
          <Footprints className="w-3 h-3" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none">
            Walk
          </span>
          <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
            {estimates.walkFormatted}
          </span>
        </div>
        <Navigation className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-70 text-emerald-600 transition-opacity" />
      </a>

      {/* Driving Estimate */}
      <a
        href={estimates.driveDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
          onSelectMode?.('driving');
        }}
        title={`Driving directions: ${estimates.driveFormatted}`}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-all group ${
          isDrivePreferred
            ? 'bg-sky-100/90 text-sky-900 border border-sky-300 shadow-xs'
            : 'text-slate-700 hover:text-sky-800 hover:bg-sky-50 border border-transparent'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
            isDrivePreferred
              ? 'bg-sky-600 text-white'
              : 'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors'
          }`}
        >
          <Car className="w-3 h-3" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none">
            Drive
          </span>
          <span className="text-[11px] font-bold text-slate-800 group-hover:text-sky-800 transition-colors">
            {estimates.driveFormatted}
          </span>
        </div>
        <Navigation className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-70 text-sky-600 transition-opacity" />
      </a>
    </div>
  );
};
