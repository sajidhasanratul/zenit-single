'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'cmd' | 'info' | 'success' | 'warning' | 'ready';
}

const PIPELINE_STEPS: TerminalLine[] = [
  { text: 'zenit-agency --init --services=all', type: 'cmd' },
  { text: '▼ BOOTSTRAPPING AGENCY SERVICES ENGINE', type: 'info' },
  { text: '🎨 UI/UX & Graphics Design: Figma wireframes & brand layouts...', type: 'info' },
  { text: '🖥 Web Development: Compiling modern responsive layouts...', type: 'info' },
  { text: '✓ UI and frontend visual assets mapped successfully.', type: 'success' },
  
  { text: '▼ INGESTING FULL-STACK APPLICATION STACK', type: 'info' },
  { text: '⚙️ Loading languages: HTML5, CSS3, JavaScript, TSX (TypeScript).', type: 'info' },
  { text: '⚡ Implementing modules: React.js components & Next.js router.', type: 'info' },
  { text: '🟢 Runtime server node: Node.js backend pipelines.', type: 'info' },
  { text: '✓ Build check: Lighthouse Core Web Vitals target (99/100).', type: 'success' },
  
  { text: '▼ MAPPING TRANSACTIONAL DATA LAYER', type: 'info' },
  { text: '🗄️ Database schemas: PostgreSQL relational indexes initialized.', type: 'info' },
  { text: '🍃 Document clusters: MongoDB flexible schemas connected.', type: 'info' },
  { text: '✓ Database handshakes and secure SSL access verified.', type: 'success' },
  
  { text: '▼ INJECTING DIGITAL MARKETING & ATTRIBUTIONS', type: 'info' },
  { text: '📡 Google Tag Manager: Activating custom web scripts container...', type: 'info' },
  { text: '🛰 Facebook Pixel CAPI: Server-side event deduplication hook...', type: 'info' },
  { text: '✓ Marketing pipelines running & ROAS tracking live.', type: 'success' },
  
  { text: '▼ INITIALIZING AI BUSINESS AUTOMATIONS', type: 'info' },
  { text: '🤖 Running 24/7 NLP Sales Agent chatbot daemons on WhatsApp...', type: 'info' },
  { text: '✓ Webhook CRM data sync (HubSpot, Notion, Sheets) active.', type: 'success' },
  
  { text: '🎉 ZENIT ENGINES COMPILATION SUCCESS. Systems ready to scale.', type: 'ready' }
];

export default function TerminalDemo() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep < PIPELINE_STEPS.length) {
      const delay = currentStep === 0 ? 500 : PIPELINE_STEPS[currentStep].type === 'info' ? 500 : 300;
      const timer = setTimeout(() => {
        setLines(prev => [...prev, PIPELINE_STEPS[currentStep]]);
        setCurrentStep(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleRestart = () => {
    setLines([]);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const runSpeedDiagnostic = () => {
    setLines(prev => [
      ...prev,
      { text: 'zenit-speedtest --url=localhost', type: 'cmd' },
      { text: '🚀 Pinging edge servers in Frankfurt, Singapore, and Oregon...', type: 'info' },
      { text: '⏱ TTFB: 24ms | FCP: 0.2s | LCP: 0.4s | CLS: 0.00', type: 'info' },
      { text: '✓ Perfect Score! Speed validation rating is at 100/100.', type: 'success' }
    ]);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0f172a] border-2 border-slate-900 rounded-xl overflow-hidden shadow-neoSlate relative">
      {/* Window bar */}
      <div className="bg-[#0b0f19] px-4 py-3 border-b border-slate-900 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
        </div>
        <div className="text-xs font-display text-slate-400 font-medium">
          agency-build-terminal@zenit: ~
        </div>
        <div className="w-12" />
      </div>

      {/* Code contents */}
      <div 
        ref={scrollRef}
        className="p-5 font-mono text-[11px] md:text-xs h-80 overflow-y-auto space-y-2 text-left bg-background/5 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {lines.map((line, idx) => (
          <div key={idx} className="leading-relaxed">
            {line.type === 'cmd' && (
              <p className="text-cyan-400 font-bold">
                <span className="text-slate-400 font-normal">zenit-admin$ </span>
                {line.text}
              </p>
            )}
            {line.type === 'info' && (
              <p className="text-slate-300 pl-2 border-l border-slate-700">
                {line.text}
              </p>
            )}
            {line.type === 'success' && (
              <p className="text-emerald-400 flex items-center gap-1.5 pl-2 border-l-2 border-emerald-400">
                <Zap size={14} className="animate-pulse" />
                {line.text}
              </p>
            )}
            {line.type === 'ready' && (
              <div className="mt-4 p-2.5 border border-emerald-500/30 bg-emerald-500/10 rounded text-emerald-400 flex items-center gap-2">
                <ShieldCheck size={18} />
                <span className="font-bold font-display">{line.text}</span>
              </div>
            )}
          </div>
        ))}
        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-4 bg-cyan-400 animate-ping" />
          </div>
        )}
      </div>

      {/* Terminal Actions */}
      <div className="bg-[#0b0f19] p-3 border-t border-slate-900 flex items-center justify-between gap-3 text-xs">
        <button
          onClick={handleRestart}
          disabled={isPlaying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-750 hover:border-cyan-400/30 text-slate-400 hover:text-cyan-400 transition-all disabled:opacity-40"
        >
          <RotateCcw size={13} />
          Reset Logs
        </button>
        <div className="flex gap-2">
          <button
            onClick={runSpeedDiagnostic}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-750 hover:border-emerald-400/30 text-slate-400 hover:text-emerald-400 transition-all disabled:opacity-40"
          >
            <Zap size={13} />
            Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
