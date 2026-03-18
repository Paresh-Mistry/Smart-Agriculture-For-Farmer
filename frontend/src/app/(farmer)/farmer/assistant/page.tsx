// app/assistant/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Mic, Send, Loader2, Trash2, Speaker,
  Sprout, ChevronDown, Globe,
} from 'lucide-react';
import { Button } from '@component/components/ui/button';
import { cn } from '@component/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { AutoTranslate } from '@component/components/common/AutoTranslate';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Message {
  role: 'user' | 'ai';
  content: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const API_URL = 'http://localhost:8000';

const LANGUAGE_OPTIONS = [
  { code: 'en-IN', label: 'English',    flag: '🇮🇳' },
  { code: 'hi-IN', label: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'mr-IN', label: 'मराठी',       flag: '🇮🇳' },
  { code: 'gu-IN', label: 'ગુજરાતી',    flag: '🇮🇳' },
];

const QUICK_QUESTIONS = [
  { icon: '🌾', text: 'Which crop is best to grow this season?' },
  { icon: '💰', text: "What is today's market price for my crops?" },
  { icon: '🚚', text: 'How can I sell my crops directly to buyers?' },
  { icon: '🌧️', text: 'What weather conditions affect wheat growth?' },
  { icon: '🐛', text: 'How do I protect crops from pests organically?' },
  { icon: '💧', text: 'Best irrigation methods for dry regions?' },
];

/* ─── Markdown components ────────────────────────────────────────────────── */
const MD_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full divide-y divide-green-100 border border-green-200 rounded-xl overflow-hidden text-xs" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-green-50" {...props} />,
  tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-green-50" {...props} />,
  tr:    ({ node, ...props }) => <tr className="hover:bg-green-50/50" {...props} />,
  th:    ({ node, ...props }) => <th className="px-3 py-2 text-left text-[11px] font-semibold text-green-800 uppercase tracking-wide border-b border-green-200" {...props} />,
  td:    ({ node, ...props }) => <td className="px-3 py-2 text-xs text-gray-800 border-b border-green-50" {...props} />,
  h1:    ({ node, ...props }) => <h1 className="text-lg font-bold mb-3 mt-4 text-green-900" {...props} />,
  h2:    ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 text-green-800" {...props} />,
  h3:    ({ node, ...props }) => <h3 className="text-sm font-semibold mb-2 mt-3 text-green-700" {...props} />,
  p:     ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
  ul:    ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
  ol:    ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
  li:    ({ node, ...props }) => <li className="ml-3 text-sm" {...props} />,
  code:  ({ node, inline, ...props }: any) =>
    inline
      ? <code className="bg-green-50 px-1.5 py-0.5 rounded text-xs font-mono text-green-800" {...props} />
      : <code className="block bg-gray-900 text-green-300 p-3 rounded-xl overflow-x-auto my-2 font-mono text-xs" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-green-400 pl-3 italic my-2 text-gray-600 text-sm" {...props} />
  ),
  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
  em:     ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AIAssistantPage() {
  const [query, setQuery]           = useState('');
  const [messages, setMessages]     = useState<Message[]>([]);
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('hi-IN');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const recognitionRef  = useRef<any>(null);
  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);

  /* ── Scroll to bottom ──────────────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Speech recognition setup ──────────────────────────────────────────── */
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = currentLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      setQuery(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [currentLanguage]);

  /* ── Auto-resize textarea ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [query]);

  /* ── Voice input ───────────────────────────────────────────────────────── */
  const handleVoice = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported.');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /* ── TTS ───────────────────────────────────────────────────────────────── */
  const speakText = (text: string, idx: number) => {
    window.speechSynthesis.cancel();
    if (!('speechSynthesis' in window)) return alert('TTS not supported.');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang === currentLanguage);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.onstart = () => { setIsSpeaking(true); setCurrentSpeakingIndex(idx); };
    utterance.onend   = () => { setIsSpeaking(false); setCurrentSpeakingIndex(null); };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentSpeakingIndex(null);
  };

  /* ── Send message ─────────────────────────────────────────────────────── */
  const handleSend = async () => {
    const text = query.trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setQuery('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId ?? null,
          model: 'sike_aditya/AgriLlama',
        }),
      });
      if (!res.ok) throw new Error('Bad response');
      const data = await res.json();
      if (data.session_id && !sessionId) setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'ai', content: data.message || 'No response received.' }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '⚠️ Failed to connect to AgriBot. Please ensure the backend is running.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (messages.length && confirm('Clear all messages?')) {
      setMessages([]);
      setSessionId(null);
    }
  };

  const selectedLang = LANGUAGE_OPTIONS.find(l => l.code === currentLanguage) ?? LANGUAGE_OPTIONS[0];

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .agri-page  { font-family: 'DM Sans', sans-serif; }
        .agri-title { font-family: 'Sora', sans-serif; }

        /* Animated gradient bg */
        @keyframes bgShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-bg {
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0f9ff, #fefce8, #f0fdf4);
          background-size: 400% 400%;
          animation: bgShift 14s ease infinite;
        }

        /* Dot-grid background */
        .dot-grid {
          background-image: radial-gradient(circle, #16a34a22 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Typing bounce dots */
        @keyframes bounce3 {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.5; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        .dot-bounce { animation: bounce3 1.2s ease-in-out infinite; }
        .dot-bounce:nth-child(2) { animation-delay: 0.15s; }
        .dot-bounce:nth-child(3) { animation-delay: 0.30s; }

        /* Message slide-in */
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: msgIn 0.28s ease-out both; }

        /* Textarea */
        .chat-textarea {
          resize: none;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          line-height: 1.5;
          scrollbar-width: none;
        }
        .chat-textarea::-webkit-scrollbar { display: none; }

        /* Scrollbar for messages */
        .msg-scroll::-webkit-scrollbar { width: 4px; }
        .msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-scroll::-webkit-scrollbar-thumb { background: #bbf7d0; border-radius: 4px; }

        /* Quick question hover */
        .quick-q { transition: all 0.18s ease; }
        .quick-q:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(22,163,74,0.18); }

        /* Pulse ring for listening */
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .pulse-ring { animation: pulseRing 1.2s ease-out infinite; }
      `}</style>

      <AutoTranslate>
        <div className="agri-page animated-bg dot-grid min-h-screen flex flex-col">

          {/* ═══ MAIN CHAT AREA ══════════════════════════════════════════════ */}
          <main className="flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-3xl px-4 py-4 gap-4">

            {/* Messages scroll area */}
            <div className="msg-scroll flex-1 overflow-y-auto space-y-4 pr-1">

              {/* ── Empty state ── */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center pt-8 pb-4 text-center">
                  {/* Avatar */}
                  <div className="relative mb-5">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-300/40">
                      <Bot size={36} className="text-white" />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow-md">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  <h1 className="agri-title text-2xl font-bold text-green-900 mb-1">
                    AgriBot Assistant
                  </h1>
                  <p className="text-sm text-gray-500 max-w-xs mb-8">
                    Your AI-powered farming guide. Ask anything about crops, soil, weather, markets, or pests.
                  </p>

                  {/* Quick questions grid */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(q.text)}
                        className="quick-q flex items-center gap-3 rounded-2xl border border-green-100 bg-white px-4 py-3 text-left shadow-sm hover:border-green-300 hover:bg-green-50"
                      >
                        <span className="text-xl flex-shrink-0">{q.icon}</span>
                        <span className="text-xs font-medium text-gray-700 leading-snug">{q.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Messages ── */}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'msg-in flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                  )}
                >
                  {/* Avatar dot */}
                  <div className={cn(
                    'flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm self-end',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-700 to-green-500'
                      : 'bg-gradient-to-br from-emerald-600 to-teal-500',
                  )}>
                    {msg.role === 'user'
                      ? <span className="text-[11px] font-bold text-white">You</span>
                      : <Bot size={15} className="text-white" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-700 to-green-600 text-white rounded-tr-sm'
                      : 'bg-white border border-green-100 text-gray-800 rounded-tl-sm',
                  )}>
                    <AutoTranslate>
                      {msg.role === 'ai' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={MD_COMPONENTS}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}
                    </AutoTranslate>

                    {/* TTS button for AI messages */}
                    {msg.role === 'ai' && (
                      <div className="mt-2 flex justify-end">
                        {isSpeaking && currentSpeakingIndex === idx ? (
                          <button
                            onClick={stopSpeaking}
                            className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700 border border-green-200 transition hover:bg-green-100"
                          >
                            <Loader2 size={10} className="animate-spin" /> Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => speakText(msg.content, idx)}
                            className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700 border border-green-200 transition hover:bg-green-100"
                          >
                            <Speaker size={10} /> Listen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="msg-in flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm">
                    <Bot size={15} className="text-white" />
                  </div>
                  <div className="bg-white border border-green-100 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="dot-bounce h-2 w-2 rounded-full bg-green-400"
                          style={{ animationDelay: `${i *   0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ═══ INPUT BAR ═══════════════════════════════════════════════ */}
            <div className="rounded-2xl border fixed bottom-0 mb-3 max-w-3xl w-full border-green-200 bg-white shadow-lg shadow-green-100/50 p-3">

              {/* Listening indicator */}
              {isListening && (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-red-600">Listening… speak now</span>
                  <span className="ml-auto text-xs text-red-400">{selectedLang.label}</span>
                </div>
              )}

              <div className="flex items-end gap-2">
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about crops, soil, market prices…"
                  rows={1}
                  className={cn(
                    'chat-textarea flex-1 rounded-xl border border-green-100 bg-green-50/50',
                    'px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400',
                    'focus:outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100',
                    'transition-all duration-200',
                  )}
                />

                {/* Mic */}
                <button
                  onClick={handleVoice}
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all',
                    isListening
                      ? 'pulse-ring bg-red-500 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200',
                  )}
                >
                  <Mic size={17} />
                </button>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={isTyping || !query.trim()}
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all',
                    'bg-gradient-to-br from-green-700 to-green-500 text-white shadow-md shadow-green-400/30',
                    'hover:brightness-110 hover:-translate-y-0.5',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0',
                  )}
                >
                  {isTyping
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />}
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-gray-400">
                Press <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[9px]">Enter</kbd> to send ·{' '}
                <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[9px]">Shift+Enter</kbd> for new line
              </p>
            </div>
          </main>
        </div>
      </AutoTranslate>
    </>
  );
}