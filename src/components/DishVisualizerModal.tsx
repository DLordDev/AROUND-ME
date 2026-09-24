import React, { useState } from 'react';
import { Sparkles, X, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Place } from '../types';

interface DishVisualizerModalProps {
  place: Place | null;
  onClose: () => void;
}

export const DishVisualizerModal: React.FC<DishVisualizerModalProps> = ({
  place,
  onClose,
}) => {
  const [dishPrompt, setDishPrompt] = useState(
    place
      ? `${place.highlights?.[0] || place.cuisine} at ${place.name}`
      : 'Crispy seasoned chicken and crinkle-cut fries with house garlic sauce'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!place) return null;

  const handleGenerate = async () => {
    if (!dishPrompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/visualize-craving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishDescription: dishPrompt,
          imageSize,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate image');
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error('No image returned');
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                AI Craving & Dish Visualizer
              </h3>
              <p className="text-xs text-slate-500">
                Powered by Gemini Image Generation (1K, 2K, 4K)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Dish or Craving Description
          </label>
          <input
            type="text"
            value={dishPrompt}
            onChange={(e) => setDishPrompt(e.target.value)}
            placeholder="e.g. Crispy garlic parmesan wings with dip..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Resolution Affordance (1K, 2K, 4K) */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Image Resolution
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['1K', '2K', '4K'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setImageSize(size)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  imageSize === size
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {size} Resolution
              </button>
            ))}
          </div>
        </div>

        {/* Image Preview Box */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
          {loading ? (
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-amber-800 font-bold animate-pulse">
                Rendering {imageSize} culinary visual...
              </p>
            </div>
          ) : generatedImage ? (
            <img
              src={generatedImage}
              alt="AI Generated Dish"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center space-y-2 p-6 text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Click Generate to visualize this dish</p>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-600 text-center font-semibold">{error}</p>}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {generatedImage ? (
            <a
              href={generatedImage}
              download="craving-dish.png"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Image</span>
            </a>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs disabled:opacity-50 transition-all ml-auto cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400" />
            )}
            <span>{generatedImage ? 'Regenerate' : 'Generate Visual'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
