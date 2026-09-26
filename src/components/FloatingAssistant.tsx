import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  GripHorizontal,
  RotateCcw,
  MapPin,
  Star,
  ExternalLink,
  ChevronRight,
  Move,
} from 'lucide-react';
import { Place, AssistantMessage, UserLocation } from '../types';

interface FloatingAssistantProps {
  currentPlaces: Place[];
  currentQuery: string;
  userLocation: UserLocation;
  onFilterAction: (
    action: 'filter_cheaper' | 'filter_closer' | 'filter_open_now' | 'filter_walkable' | 'filter_quick_drive',
    placeIds?: string[]
  ) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onSelectPlace?: (place: Place) => void;
}

const QUICK_ACTIONS = [
  '👋 Hi! What can you suggest?',
  '🍗 Where is Chicken Republic?',
  '🥡 Kada Plaza Chinese & treats',
  '🍦 Mat-Ice pastries & ice cream',
  '🇳🇬 Authentic Nigerian jollof & soups',
  '🚶 Walkable lunch spots',
  '🚗 Quick drive with easy parking',
  '💰 Affordable meals ($)',
  '⭐ Top rated dining spots',
];

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  currentPlaces,
  currentQuery,
  userLocation,
  onFilterAction,
  voiceEnabled,
  setVoiceEnabled,
  onSelectPlace,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: `Hello! 👋 I'm your Gemini-powered dining concierge for ${userLocation.city}. Ask me anything about local restaurants, signature dishes, travel times, or say "Hi" for personalized recommendations! (P.S. You can drag and move this chat box anywhere on your screen!)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isMicListening, setIsMicListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Position state for moveable/draggable chat window & launcher
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const chatWidth = 384; // 24rem (w-96)
  const chatHeight = 520; // h-[520px]

  // Compute default bottom-right docked position
  const getDockedPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 20, y: 100 };
    const w = Math.min(chatWidth, window.innerWidth - 32);
    const h = Math.min(chatHeight, window.innerHeight - 80);
    return {
      x: Math.max(16, window.innerWidth - w - 24),
      y: Math.max(70, window.innerHeight - h - 32),
    };
  }, [chatWidth, chatHeight]);

  // Initialize position on mount or resize
  useEffect(() => {
    if (!position) {
      setPosition(getDockedPosition());
    }

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return getDockedPosition();
        const maxX = Math.max(16, window.innerWidth - Math.min(chatWidth, window.innerWidth - 32) - 16);
        const maxY = Math.max(60, window.innerHeight - Math.min(chatHeight, window.innerHeight - 80) - 16);
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(60, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getDockedPosition, chatWidth, chatHeight, position]);

  // Dragging handlers (Mouse + Touch)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentPos = position || getDockedPosition();

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: currentPos.x,
      startY: currentPos.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const maxX = Math.max(16, window.innerWidth - Math.min(chatWidth, window.innerWidth - 32) - 16);
      const maxY = Math.max(60, window.innerHeight - Math.min(chatHeight, window.innerHeight - 80) - 16);

      const nextX = Math.min(Math.max(16, dragStartRef.current.startX + deltaX), maxX);
      const nextY = Math.min(Math.max(60, dragStartRef.current.startY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.mouseX;
      const deltaY = touch.clientY - dragStartRef.current.mouseY;

      const maxX = Math.max(16, window.innerWidth - Math.min(chatWidth, window.innerWidth - 32) - 16);
      const maxY = Math.max(60, window.innerHeight - Math.min(chatHeight, window.innerHeight - 80) - 16);

      const nextX = Math.min(Math.max(16, dragStartRef.current.startX + deltaX), maxX);
      const nextY = Math.min(Math.max(60, dragStartRef.current.startY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, chatWidth, chatHeight]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsMicListening(true);
      recognition.onend = () => setIsMicListening(false);
      recognition.onerror = () => setIsMicListening(false);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setIsMicListening(false);
        sendMessage(text);
      };

      recognitionRef.current = recognition;
    }
  }, [currentPlaces, currentQuery, userLocation]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageText,
          message: messageText,
          currentPlaces,
          places: currentPlaces,
          currentQuery,
          userLocation,
          location: userLocation,
        }),
      });

      if (!res.ok) throw new Error('Assistant failed to respond');
      const data = await res.json();

      const botMsg: AssistantMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I found some wonderful dining recommendations for you!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak reply if voice narration is active
      if (voiceEnabled && data.reply) {
        speakText(data.reply);
      }

      // Execute filter action if assistant advised one
      if (data.action && data.action !== 'none') {
        onFilterAction(data.action, data.placeIds);
      }
    } catch {
      // Intelligent fallback for culinary greetings & suggestions
      const lower = messageText.toLowerCase();
      let fallbackReply = `I'm your dining concierge for ${userLocation.city}! You can ask for recommendations like Chicken Republic (Airport Road), Kada Plaza Chinese restaurant, Mat-Ice bakery & ice cream, or traditional Nigerian jollof and pepper soup.`;

      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        fallbackReply = `Hello there! 👋 Great to connect with you! I'm your AroundMe AI dining concierge for ${userLocation.city}. Are you looking for quick crispy chicken, sizzling Chinese wok, creamy ice cream & meat pies, or authentic local soup? Tell me what you crave!`;
      } else if (lower.includes('chicken republic')) {
        fallbackReply = `Chicken Republic is famous for its Soulmate crispy fried chicken, spicy rice bowls, and Chief burgers! In Benin City, they have popular branches around Airport Road and Sapele Road. I can filter and highlight their exact location for you!`;
        onFilterAction('filter_closer');
      } else if (lower.includes('kada plaza')) {
        fallbackReply = `Kada Plaza at 111 Sapele Road is a premier entertainment hub featuring Konfu Chinese & Continental Restaurant, cinema bites, arcade games, and luxury lounge dining!`;
      } else if (lower.includes('mat-ice') || lower.includes('ice cream') || lower.includes('pastr')) {
        fallbackReply = `Mat-Ice is Benin City's beloved spot for warm meat pies, soft-serve ice cream swirls, fresh shawarma, and sweet pastries, located along Airport Road!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isMicListening) {
      recognitionRef.current?.stop();
      setIsMicListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const currentPos = position || getDockedPosition();

  // Find places matched in current response to provide quick interactive links
  const findMentionedPlaces = (text: string) => {
    const lower = text.toLowerCase();
    return currentPlaces.filter((p) => lower.includes(p.name.toLowerCase()));
  };

  return (
    <>
      {/* Moveable Floating Launcher Button when closed */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(currentPos.x + 280, window.innerWidth - 80)}px`,
            top: `${Math.min(currentPos.y + 440, window.innerHeight - 70)}px`,
            zIndex: 45,
          }}
          className="select-none"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="p-3.5 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-black hover:from-slate-900 hover:to-slate-800 text-white shadow-2xl flex items-center gap-2 group cursor-pointer transition-all hover:scale-105 border border-amber-500/40 hover:border-amber-400 active:scale-95"
            title="Open Moveable Culinary AI Concierge"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
            <span className="text-xs font-black tracking-wide pr-1 hidden sm:inline text-amber-200">
              AI Concierge
            </span>
          </button>
        </div>
      )}

      {/* Moveable & Draggable Slide-Up Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${currentPos.x}px`,
            top: `${currentPos.y}px`,
            width: typeof window !== 'undefined' ? `${Math.min(chatWidth, window.innerWidth - 32)}px` : '384px',
            height: `${chatHeight}px`,
            zIndex: 50,
          }}
          className={`bg-white border-2 border-slate-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-shadow select-text ${
            isDragging ? 'shadow-amber-500/20 ring-4 ring-amber-400/40 cursor-grabbing' : 'shadow-2xl'
          }`}
        >
          {/* Draggable Header Bar with Grip Handle */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="p-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            title="Drag header to move chat box anywhere on your screen"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <span>AroundMe AI Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-amber-300 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{userLocation.city}</span>
                </p>
              </div>
            </div>

            {/* Draggable Grip Indicator in Center */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-semibold">
              <GripHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Move</span>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setPosition(getDockedPosition())}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title="Reset to bottom-right position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice Narration'}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title="Close chat box"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drag instruction reminder strip */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 flex items-center justify-between text-[10px] text-amber-900 font-semibold select-none">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-amber-600" />
              <span>Drag top bar to reposition anywhere</span>
            </span>
            <span className="text-[9px] text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded-md font-bold">
              Moveable
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-slate-50/70">
            {messages.map((msg) => {
              const matchedPlaces = msg.role === 'assistant' ? findMentionedPlaces(msg.text) : [];

              return (
                <div key={msg.id} className="space-y-1.5">
                  <div
                    className={`flex gap-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white font-medium rounded-tr-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span
                        className={`block text-[9px] mt-1.5 text-right font-medium ${
                          msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Render interactive place cards if assistant mentioned restaurants */}
                  {matchedPlaces.length > 0 && (
                    <div className="ml-8 flex flex-wrap gap-1.5 pt-1">
                      {matchedPlaces.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onSelectPlace?.(p)}
                          className="px-2.5 py-1 rounded-xl bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title={`View details for ${p.name}`}
                        >
                          <MapPin className="w-3 h-3 text-amber-700" />
                          <span className="truncate max-w-[130px]">{p.name}</span>
                          <span className="text-[10px] text-amber-800 bg-amber-200 px-1 rounded-md">
                            {p.distanceText}
                          </span>
                          <ChevronRight className="w-3 h-3 text-amber-700" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-600 text-[11px] p-2.5 bg-white rounded-2xl max-w-[220px] border border-slate-200 shadow-xs">
                <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="font-semibold">Gemini is checking local menus...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Dining Suggestion Pills */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => sendMessage(action)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-slate-50 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-colors shrink-0 font-bold cursor-pointer"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isMicListening ? 'Listening to your voice...' : 'Ask about restaurants, food, travel times...'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
            />

            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isMicListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200'
              }`}
              title="Speak with microphone"
            >
              {isMicListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
