import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User as UserIcon, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { api } from '../../lib/api';
import { Place, GuideAnswer } from '../../types';
import { useAuth } from '../auth/AuthContext';

interface AIGuideDrawerProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
  currentPoiTitle?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_fallback?: boolean;
  source?: string;
  time: string;
}

export const AIGuideDrawer: React.FC<AIGuideDrawerProps> = ({
  place,
  isOpen,
  onClose,
  currentPoiTitle,
}) => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! I am your Heritage AI Guide for **${place.name}**. Feel free to ask me anything about the history, architecture, mythology, or points of interest here!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    `Who built ${place.name} and when?`,
    `What architectural style was used here?`,
    currentPoiTitle ? `Tell me more about ${currentPoiTitle}` : `What are the key points of interest?`,
    `What is the best season and time of day to experience this site?`,
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.post<GuideAnswer>('/guide/ask/', {
        place_slug: place.slug,
        question: textToSend.trim(),
        session_id: sessionId,
        current_poi: currentPoiTitle,
      });

      if (res.data.session_id) {
        setSessionId(res.data.session_id);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.answer,
        is_fallback: res.data.is_fallback,
        source: res.data.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I am currently consulting the local archive records for ${place.name}. ${place.short_description}`,
        is_fallback: true,
        source: 'Curated Heritage Archive',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-surface/95 backdrop-blur-2xl border-l border-sage-300/20 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-sage-300/15 flex items-center justify-between bg-surface/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-600 to-royal-600 flex items-center justify-center text-ink-main shadow-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-main flex items-center gap-1.5">
              <span>Bharat Darshan AI Guide</span>
              <Sparkles className="w-3.5 h-3.5 text-royal-400" />
            </h3>
            <p className="text-[11px] text-sage-300 truncate max-w-[220px]">
              {place.name} {currentPoiTitle ? `• Near ${currentPoiTitle}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-ink-muted hover:text-ink-main hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                  isUser
                    ? 'bg-royal-600 text-ink-main'
                    : 'bg-forest-600 text-ink-main shadow-glow-forest'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-royal-600/80 text-ink-main rounded-tr-none'
                    : 'bg-surface border border-sage-300/15 text-ink-main rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-ink-muted/70 pt-1 border-t border-sage-300/10">
                  <span>{m.time}</span>
                  {m.source && (
                    <span className="text-[9px] bg-void/50 px-1.5 py-0.5 rounded text-sage-300">
                      {m.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-forest-600 flex items-center justify-center text-ink-main flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-surface border border-sage-300/15 rounded-2xl rounded-tl-none p-3 text-xs text-ink-muted flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-royal-400" />
              <span>Analyzing historical records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-sage-300/10 bg-surface/50 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] bg-void/60 hover:bg-forest-600/40 border border-sage-300/20 text-ink-muted hover:text-ink-main px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-sage-300/15 bg-surface/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${place.name}...`}
            disabled={loading}
            className="flex-1 bg-void/80 border border-sage-300/20 focus:border-royal-400 rounded-xl px-3.5 py-2.5 text-xs text-ink-main placeholder:text-ink-muted/50 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-wine p-2.5 rounded-xl disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-ink-muted/60 text-center mt-2 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-royal-400" />
          Heritage AI powered by Groq ultra-low latency inference
        </p>
      </div>
    </div>
  );
};

