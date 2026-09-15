'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState<number>(65);

  const lighthouseScore = Math.round(41 + (sliderPosition / 100) * 58); // 41 to 99
  const speedIndex = (4.8 - (sliderPosition / 100) * 4.4).toFixed(1); // 4.8s down to 0.4s
  const trackingFidelity = Math.round(62 + (sliderPosition / 100) * 38); // 62% matching up to 100%
  const monthlyInquiriesAttributed = Math.round(18 + (sliderPosition / 100) * 32); // 18% up to 50%

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 border-slate-900 bg-white relative overflow-hidden">
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-display font-black text-slate-900">
            Legacy Web vs. Revenue Engine Visualizer
          </h3>
          <p className="text-xs text-textMuted max-w-lg mx-auto">
            Drag the performance tuner below to see how Next.js loading speed and CAPI deduplication boost client attribution metrics.
          </p>
        </div>

        {/* Dynamic Interactive Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Lighthouse Score */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1 relative">
            <span className="text-[10px] text-textMuted font-mono uppercase tracking-wider font-bold">Lighthouse Score</span>
            <div className={`text-3xl font-display font-extrabold transition-colors duration-200 ${
              lighthouseScore > 90 ? 'text-accentGreen' : lighthouseScore > 70 ? 'text-yellow-600' : 'text-red-500'
            }`}>
              {lighthouseScore}/100
            </div>
            <div className="text-[10px] text-textMuted font-bold">Performance Metrics</div>
          </div>

          {/* Load Speed */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
            <span className="text-[10px] text-textMuted font-mono uppercase tracking-wider font-bold">Load Time (LCP)</span>
            <div className={`text-3xl font-display font-extrabold transition-colors duration-200 ${
              Number(speedIndex) < 1.0 ? 'text-accentGreen' : Number(speedIndex) < 2.5 ? 'text-yellow-600' : 'text-red-500'
            }`}>
              {speedIndex}s
            </div>
            <div className="text-[10px] text-textMuted font-bold">Sub-second Speed</div>
          </div>

          {/* Tracking Fidelity */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
            <span className="text-[10px] text-textMuted font-mono uppercase tracking-wider font-bold">Data Attribution</span>
            <div className={`text-3xl font-display font-extrabold transition-colors duration-200 ${
              trackingFidelity > 95 ? 'text-accentCyan' : trackingFidelity > 80 ? 'text-yellow-600' : 'text-red-500'
            }`}>
              {trackingFidelity}%
            </div>
            <div className="text-[10px] text-textMuted font-bold">Meta Server Sync</div>
          </div>

          {/* Conversion Lift */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
            <span className="text-[10px] text-textMuted font-mono uppercase tracking-wider font-bold">Conversion Attrib.</span>
            <div className={`text-3xl font-display font-extrabold transition-colors duration-200 ${
              monthlyInquiriesAttributed > 40 ? 'text-accentGreen' : 'text-slate-900'
            }`}>
              {monthlyInquiriesAttributed}%
            </div>
            <div className="text-[10px] text-textMuted font-bold">Pixel Attributed</div>
          </div>
        </div>

        {/* Visual Slider Bar */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center text-xs text-textMuted font-mono font-bold">
            <span className="flex items-center gap-1 text-red-500">
              <ShieldAlert size={14} />
              Slow Legacy Site
            </span>
            <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-[10px] text-slate-700">
              Tuner Focus: {sliderPosition === 100 ? 'Fully Optimized Next-Gen' : `${sliderPosition}% ZenIT Setup`}
            </span>
            <span className="flex items-center gap-1 text-accentGreen">
              <ShieldCheck size={14} />
              ZenIT Next.js Engine
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accentCyan focus:outline-none"
          />
        </div>

        {/* Dynamic Explanatory Footer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-600 items-center">
          <Sparkles className="text-accentCyan shrink-0 animate-pulse" size={18} />
          {sliderPosition < 30 ? (
            <p>Your site suffers from server overhead and high bounce rates. Client-side tracking scripts are blocked by browser privacy protections, causing an average of 40% loss in Facebook Ads attribution.</p>
          ) : sliderPosition < 80 ? (
            <p>Attributions are improving. Load speeds are decreasing, but browser privacy blocks still intercept client-side cookies. Activating ZenIT's Next.js and Meta Conversions API (CAPI) server dispatch resolves this mismatch.</p>
          ) : (
            <p className="text-slate-900 font-bold">
              <span className="text-accentGreen">Optimal state reached!</span> Next.js rendering ensures instant page paint. Server-side tracking registers 100% of purchase triggers, enabling the Meta algorithm to double ROAS precision.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
