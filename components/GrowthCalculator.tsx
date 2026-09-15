'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from './ui/slider';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TrendingUp, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { trackCalculatorUseEvent } from '@/lib/trackingClient';

export default function GrowthCalculator() {
  const router = useRouter();
  const [traffic, setTraffic] = useState<number>(15000);
  const [conversion, setConversion] = useState<number>(1.2);
  const [aov, setAov] = useState<number>(1200);

  const currentMonthlyRevenue = traffic * (conversion / 100) * aov;
  const boostFactor = 1.45; 
  const projectedConversion = conversion * boostFactor;
  const projectedMonthlyRevenue = traffic * (projectedConversion / 100) * aov;
  const revenueLift = Math.round(projectedMonthlyRevenue - currentMonthlyRevenue);
  
  const hoursSaved = Math.round((traffic * 0.05) * 0.2); 

  const trackingTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (trackingTimeout.current) clearTimeout(trackingTimeout.current);
    
    trackingTimeout.current = setTimeout(() => {
      trackCalculatorUseEvent({
        monthlyTraffic: traffic,
        projectedRevenueIncrease: revenueLift
      });
    }, 1500);

    return () => {
      if (trackingTimeout.current) clearTimeout(trackingTimeout.current);
    };
  }, [traffic, conversion, aov, revenueLift]);

  const handleApplyToBooking = () => {
    sessionStorage.setItem('zenit_calc_traffic', traffic.toString());
    sessionStorage.setItem('zenit_calc_conversion', conversion.toString());
    sessionStorage.setItem('zenit_calc_lift', revenueLift.toString());
    
    window.dispatchEvent(new Event('zenit_calculator_applied'));

    router.push('/contact');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-slate-900 bg-white" glow="cyan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Sliders Input Panel */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-accentCyan" size={20} />
              ROI Growth Calculator
            </h3>
            <p className="text-xs text-textMuted mt-1">
              Estimate potential monthly gains from high-speed loading & server-side tracking.
            </p>
          </div>

          <Slider
            label="Monthly Web Traffic"
            min={1000}
            max={100000}
            step={1000}
            value={traffic}
            onChange={setTraffic}
            suffix=" visitors"
          />

          <Slider
            label="Current Conversion Rate"
            min={0.2}
            max={5.0}
            step={0.1}
            value={conversion}
            onChange={setConversion}
            suffix="%"
            displayValue={`${conversion.toFixed(1)}%`}
          />

          <Slider
            label="Average Order Value (AOV)"
            min={100}
            max={10000}
            step={100}
            value={aov}
            onChange={setAov}
            suffix=" BDT"
            displayValue={`৳${aov.toLocaleString()}`}
          />
        </div>

        {/* Results Metrics Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-display font-bold text-textMuted uppercase tracking-wider">
              Estimated Monthly Uplift
            </h4>

            {/* Revenue Lift Output */}
            <div className="flex items-start gap-3">
              <div className="p-3 bg-accentCyan/10 text-accentCyan rounded-lg border border-accentCyan/25 mt-1">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">Extra Sales Revenue</p>
                <p className="text-3xl font-display font-black text-accentCyan">
                  +৳{revenueLift.toLocaleString()}
                </p>
                <p className="text-[10px] text-accentGreen font-bold mt-0.5">
                  Assumes {boostFactor}x attribution & speed conversion lift
                </p>
              </div>
            </div>

            {/* Time Saved Output */}
            <div className="flex items-start gap-3 pt-2">
              <div className="p-3 bg-accentGreen/10 text-accentGreen rounded-lg border border-accentGreen/25 mt-1">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">Ops Time Reclaimed</p>
                <p className="text-2xl font-display font-black text-accentGreen">
                  +{hoursSaved} Hours / mo
                </p>
                <p className="text-[10px] text-textMuted mt-0.5 font-bold">
                  Saved via automatic CRM & 24/7 AI FAQ replies
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleApplyToBooking}
            variant="cyan" 
            className="w-full flex items-center justify-center gap-2 group mt-4 text-xs py-3 border-2 border-slate-900 shadow-neoSlate font-bold"
          >
            Apply & Book Meeting
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
