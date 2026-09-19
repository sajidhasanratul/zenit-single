'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Check, ShieldCheck } from 'lucide-react';

interface PricingPlan {
  id: string;
  slug: string;
  category: string;
  title: string;
  tagline: string;
  pricing: {
    basePriceBDT: number;
    billingType: string;
  };
  deliveryTimeDays: number;
  featuresIncluded: string[];
  techBadges: string[];
  isPopular?: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/pricing');
        const data = await response.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
        }
      } catch (err) {
        console.error('Failed to load pricing plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-textWhite flex items-center justify-center font-display font-medium">
        <span className="w-1.5 h-1.5 bg-accentCyan rounded-full inline-block animate-ping mr-2" />
        Formatting pricing tables...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-textWhite py-16 px-6 space-y-16">
      
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-[11px] bg-accentCyan/10 border border-accentCyan/20 text-accentCyan px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
          Pricing Plans
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-wide leading-tight text-slate-900">
          Flexible Plans for Your <span className="text-accentCyan font-sans">Business Scale</span>
        </h1>
        <p className="text-xs md:text-sm text-textMuted max-w-xl mx-auto leading-relaxed font-bold">
          Transparent packages with no hidden fees. Choose a package below to discuss details directly with our team on WhatsApp.
        </p>
      </div>

      {/* Main Packages Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch text-left">
        {plans.map((service) => {
          const discountPercent = 50;
          const discountedPrice = service.pricing.basePriceBDT; // Real price input in Admin panel
          const originalPrice = discountedPrice * 2; // Crossed-out original price (double the input)
          
          return (
            <Card 
              key={service.id} 
              className={`border-2 relative flex flex-col justify-between h-full p-8 bg-white transition-all hover:scale-[1.01] ${
                service.isPopular ? 'border-accentGreen shadow-neoGreen' : 'border-slate-900 shadow-neoSlate'
              }`}
            >
              {service.isPopular && (
                <div className="absolute top-4 right-4 bg-accentGreen text-white text-[11px] font-display font-black uppercase px-2.5 py-0.5 rounded">
                  Best Value
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <span className="text-[11px] text-accentCyan font-mono uppercase tracking-wider font-bold">
                    {service.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-xl font-display font-black text-slate-900 mt-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-textMuted mt-1.5 min-h-[36px]">{service.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="border-y border-slate-200 py-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-textMuted line-through font-sans">
                      ৳{originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-black text-accentGreen font-sans">
                      ৳{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-textMuted font-mono">BDT</span>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <Calendar size={14} className="text-accentCyan" />
                  <span>Timeline: ~{service.deliveryTimeDays} Business Days</span>
                </div>

                {/* Included features list */}
                <div className="space-y-3 pt-2">
                  <p className="text-[12px] text-slate-900 font-display font-bold uppercase tracking-wider">Features Included:</p>
                  <ul className="space-y-2.5 text-xs text-textMuted font-medium">
                    {service.featuresIncluded.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-left">
                        <Check size={14} className="text-accentGreen shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button & Badges */}
              <div className="space-y-4 mt-8 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-1">
                  {service.techBadges.map((badge, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-mono text-textMuted font-bold">
                      {badge}
                    </span>
                  ))}
                </div>

                <a 
                  href={`https://wa.me/8801516501284?text=${encodeURIComponent(`Hi ZenIT Team,\n\nI am interested in ordering your "${service.title}" package priced at ৳${discountedPrice.toLocaleString()} BDT. Let's align on project specs!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button 
                    variant="green" 
                    className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-2 border-slate-900 shadow-neoSlate bg-green-600 hover:bg-green-700 text-white"
                  >
                    Order via WhatsApp
                  </Button>
                </a>
              </div>

            </Card>
          );
        })}
      </div>

      {/* SLA Policy Trust Banner */}
      <section className="max-w-4xl mx-auto bg-white border-2 border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-left shadow-neoSlate">
        <div className="p-3 bg-accentGreen/10 border border-accentGreen/20 text-accentGreen rounded-xl shrink-0">
          <ShieldCheck size={28} />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-black text-sm text-slate-900">12-Month Support & Technical Bug Warranty</h4>
          <p className="text-xs text-textMuted leading-relaxed">
            All plans include our 1-year developer maintenance warranty. We deploy server side attributions and patch database crashes or routing failures within 24 hours at no extra cost.
          </p>
        </div>
      </section>

    </main>
  );
}
