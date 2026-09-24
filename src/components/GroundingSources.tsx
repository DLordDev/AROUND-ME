import React, { useState, useRef } from 'react';
import { ExternalLink, ShieldCheck, Volume2, Square, Loader2 } from 'lucide-react';
import { GroundingLink } from '../types';

interface GroundingSourcesProps {
  links: GroundingLink[];
  summary: string;
  source: 'google_maps' | 'google_search' | 'deep_thinking';
  voiceEnabled?: boolean;
}

export const GroundingSources: React.FC<GroundingSourcesProps> = ({
  links,
  summary,
  source,
  voiceEnabled = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!summary && links.length === 0) return null;

  const handleToggleAudio = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (!summary) return;

    setLoadingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary.slice(0, 400) }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis();
        };
        await audio.play();
        setIsPlaying(true);
      } else {
        fallbackSpeechSynthesis();
      }
    } catch {
      fallbackSpeechSynthesis();
    } finally {
      setLoadingAudio(false);
    }
  };

  const fallbackSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(summary.slice(0, 300));
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Places Grounding</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider font-extrabold">
              {source === 'deep_thinking'
                ? 'Gemini 3.1 Pro Thinking'
                : source === 'google_search'
                ? 'Google Live Search'
                : 'Google Maps Platform (Real Places)'}
            </span>
          </div>

          {/* Manual AI Audio Toggle */}
          {summary && (
            <button
              type="button"
              onClick={handleToggleAudio}
              disabled={loadingAudio}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title={isPlaying ? 'Stop voice readout' : 'Listen to AI dining recommendation'}
            >
              {loadingAudio ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              ) : isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  <span>Stop Speaking</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Listen to AI Summary</span>
                </>
              )}
            </button>
          )}
        </div>

        {summary && (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {summary}
          </p>
        )}

        {links.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Maps Sources:</span>
            {links.slice(0, 5).map((l, i) => (
              <a
                key={i}
                href={l.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors font-medium text-[11px]"
              >
                <span>{l.title}</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
