'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: "Namaste! 🙏 I'm Saathi, your AI study companion. Ready for today's mission? I'm here to help with doubts, motivation, and planning. What's on your mind?",
  timestamp: new Date(),
};

export function SaathiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-saathi-chat', handleOpenChat);
    return () => window.removeEventListener('open-saathi-chat', handleOpenChat);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Something went wrong. Try again!',
        timestamp: new Date(),
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. But you're doing great — keep going! 💪",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={!isOpen ? { boxShadow: ['0 0 0 0 rgba(249,177,122,0.4)', '0 0 0 12px rgba(249,177,122,0)', '0 0 0 0 rgba(249,177,122,0.4)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {isOpen 
            ? <motion.div key="close" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}><X className="w-6 h-6 text-white" /></motion.div>
            : <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><MessageCircle className="w-6 h-6 text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-44 right-6 lg:bottom-24 lg:right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: '480px', background: 'var(--theme-background)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-alt) 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Saathi</div>
                <div className="text-xs text-white/60">Your AI Study Companion</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-white/60">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? 'var(--theme-accent)' : 'rgba(255,255,255,0.08)',
                      color: msg.role === 'user' ? 'var(--theme-neutral-dark)' : 'var(--theme-neutral-light)',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px' }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--theme-accent)' }}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Ask Saathi anything..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--theme-neutral-light)' }}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  style={{ background: 'var(--theme-accent)' }}
                >
                  <Send className="w-4 h-4" style={{ color: 'var(--theme-neutral-dark)' }} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
