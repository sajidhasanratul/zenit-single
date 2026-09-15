'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const PRESETS = [
  "I want to qualify my fashion e-commerce store.",
  "Track order #1024",
  "How long is your warranty?",
];

export default function AiPlayground() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: "Hello! I am ZenIT's AI Sales Assistant. You can test my capabilities in this sandbox. Try asking for a price quote, checking an order status (try using: 'Track order #1024'), or testing how I qualify leads!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
        })
      });

      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'bot',
            text: data.reply || "Sorry, I encountered a connection lapse. Please retry shortly.",
            timestamp: new Date()
          }
        ]);
      }, 700);
      
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: "System webhook latency detected. Please verify your connection and try again.",
          timestamp: new Date()
        }
      ]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-slate-900 flex flex-col h-[480px] p-0 relative bg-white" glow="green">
      {/* Bot Header */}
      <div className="bg-slate-100 px-5 py-4 border-b-2 border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accentGreen/10 text-accentGreen border border-accentGreen/25 rounded-lg">
            <Bot size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-display font-black text-slate-900">
              ZenIT Automated Lead Agent
            </h3>
            <span className="text-[10px] text-accentGreen font-mono uppercase tracking-wider flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 bg-accentGreen rounded-full inline-block animate-ping" />
              Online & Sandbox Active
            </span>
          </div>
        </div>
        <div className="text-xs text-textMuted flex items-center gap-1 font-bold">
          <Sparkles size={12} className="text-accentCyan" />
          Powered by NLP Route
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300"
      >
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`p-1.5 rounded-md border ${
              m.sender === 'user' 
                ? 'bg-accentCyan/10 text-accentCyan border-accentCyan/25' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {m.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>
            
            <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              m.sender === 'user'
                ? 'bg-accentCyan text-white rounded-tr-none font-semibold shadow-sm'
                : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 max-w-[80%]">
            <div className="p-1.5 rounded-md border bg-white border-slate-200 text-slate-900">
              <Bot size={15} />
            </div>
            <div className="bg-white rounded-xl rounded-tl-none border border-slate-200 px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Preset Suggestions */}
      <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-1.5">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] bg-white border border-slate-200 hover:border-accentGreen hover:text-accentGreen text-slate-600 px-2.5 py-1 rounded-full transition-all font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about pricing, build timeline, or test chatbot..."
          className="flex-1 bg-white border border-slate-250 rounded-lg px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-accentGreen focus:ring-1 focus:ring-accentGreen/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-accentGreen hover:bg-accentGreen/90 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          <Send size={15} />
          Send
        </button>
      </form>
    </Card>
  );
}
