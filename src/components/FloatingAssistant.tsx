import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  ArrowRight,
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
}

const QUICK_ACTIONS = [
  'find somewhere cheaper',
  'walkable places only',
  'quickest drive',
  'open now',
  'what is their best dish?',
];

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  currentPlaces,
  currentQuery,
  userLocation,
  onFilterAction,
  voiceEnabled,
  setVoiceEnabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: `Hi! I'm your dining concierge for verified places around ${userLocation.city}. Ask me anything like "find somewhere cheaper", "show me closer", or "what should I order?".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isMicListening, setIsMicListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech recognition for voice inside assistant
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
          currentPlaces,
          currentQuery,
          userLocation,
        }),
      });

      if (!res.ok) throw new Error('Assistant failed to respond');
      const data = await res.json();

      const botMsg: AssistantMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I found some great options for you above!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak reply if voice narration is active
      if (voiceEnabled && data.reply) {
        speakText(data.reply);
      }

      // Execute filter action if assistant advised one
      if (data.action && data.action !== 'none') {
        onFilterAction(data.action, data.recommendedPlaceIds);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          text: "I couldn't reach the assistant right now. You can use the search bar or filters directly above!",
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

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center gap-2 group cursor-pointer transition-all hover:scale-105 border border-slate-700"
        title="Open Culinary AI Concierge"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
        </div>
        <span className="text-xs font-bold pr-1 hidden sm:inline">
          AI Concierge
        </span>
      </button>

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[92vw] sm:w-96 max-h-[500px] h-[480px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>Dining Concierge</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </h4>
                <p className="text-[10px] text-slate-500">Live Gemini Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white font-medium rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 italic text-[11px] p-2 bg-white rounded-xl max-w-[200px] border border-slate-200">
                <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Thinking & filtering...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => sendMessage(action)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors shrink-0 font-medium cursor-pointer"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Box */}
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
              placeholder={isMicListening ? 'Listening...' : 'Ask concierge...'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
            />

            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isMicListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-500 hover:text-amber-600 border border-slate-200'
              }`}
              title="Speak with mic"
            >
              {isMicListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
