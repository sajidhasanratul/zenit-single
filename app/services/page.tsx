'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ServiceDetailModal from '@/components/ServiceDetailModal';
import VideoModal from '@/components/VideoModal';
import { 
  FolderOpen, Play, ExternalLink, 
  List, Calendar, CheckSquare 
} from 'lucide-react';
import { trackServiceView, trackServiceClick } from '@/lib/trackingClient';

interface ServiceItem {
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
  topBadges?: string[];
  subBadges?: string[];
  demoUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  isPopular?: boolean;
  priority?: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeDetail, setActiveDetail] = useState<{ title: string; features: string[] } | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.success && data.services) {
          const sorted = [...data.services].sort((a: ServiceItem, b: ServiceItem) => (b.priority ?? 0) - (a.priority ?? 0));
          setServices(sorted);
          sorted.forEach((s: ServiceItem) => trackServiceView(s.id));
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // 1. Dynamic category generation + Show All
  const uniqueCategories = Array.from(new Set(services.map(s => s.category)));
  
  // Clean label names helper (e.g. web_dev -> Web Dev)
  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'All Services';
    return cat
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Filter products based on selected tab (All vs Specific category)
  const filteredProducts = activeTab === 'all' 
    ? services 
    : services.filter(p => p.category === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-textWhite flex items-center justify-center font-display font-medium">
        <span className="w-1.5 h-1.5 bg-accentCyan rounded-full inline-block animate-ping mr-2" />
        Syncing services catalog...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-textWhite py-16 px-6 relative pb-32 overflow-hidden">
      
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <span className="text-[10px] bg-accentCyan/10 border border-accentCyan/20 text-accentCyan px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
          Products Directory
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-wide leading-tight text-slate-900">
          Explore Our Deployed <span className="text-accentGreen">Growth Products</span>
        </h1>
        <p className="text-xs text-textMuted max-w-xl mx-auto leading-relaxed font-bold">
          Click the preview buttons to view live demo websites, play the video guides, or open our customizable checkouts.
        </p>
      </div>

      {/* Categories Filter Tabs (Neo-Brutalist Design) */}
      <div className="max-w-5xl mx-auto flex flex-wrap gap-3.5 justify-center border-b-2 border-slate-200 pb-8 mb-12 relative z-10">
        {/* Default Show All Tab */}
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 text-xs font-display font-black rounded-xl transition-all border-2 border-slate-900 ${
            activeTab === 'all'
              ? 'bg-accentCyan text-white shadow-neoCyan'
              : 'bg-white text-slate-700 hover:text-slate-900 shadow-neoSlate hover:bg-slate-50'
          }`}
        >
          All Services
        </button>

        {uniqueCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2.5 text-xs font-display font-black rounded-xl transition-all border-2 border-slate-900 ${
              activeTab === cat
                ? 'bg-accentCyan text-white shadow-neoCyan'
                : 'bg-white text-slate-700 hover:text-slate-900 shadow-neoSlate hover:bg-slate-50'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch relative z-10 text-left">
        {filteredProducts.map((product) => {
          const discountedPrice = product.pricing.basePriceBDT; // Real input price
          const price = discountedPrice * 2; // Original crossed-out price

          // Resolve tags fallback
          const topBadges = product.topBadges || (product.isPopular ? ['Client Website', 'Premium'] : ['Client Website']);
          const subBadges = product.subBadges || product.techBadges.slice(0, 2);

          const waUrl = `https://wa.me/8801516501284?text=${encodeURIComponent(`Hi ZenIT Team,\n\nI want to order the "${product.title}" package. The listed price is ৳${discountedPrice.toLocaleString()} BDT. Let's discuss details!`)}`;

          return (
            <Card 
              key={product.id} 
              className="border-2 border-slate-900 transition-all flex flex-col justify-between h-full relative p-0 overflow-hidden bg-white hover:shadow-neoSlate hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              {/* Product Banner (Dynamic Image OR CSS Browser Mockup) */}
              {product.imageUrl ? (
                <div className="relative w-full aspect-[16/10] border-b-2 border-slate-900 overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[16/10] bg-slate-100 border-b-2 border-slate-900 overflow-hidden flex items-center justify-center">
                  {/* Browser frame mockup */}
                  <div className="w-[88%] h-[85%] bg-slate-50 rounded-t-md border-x border-t border-slate-350 relative shadow-inner overflow-hidden flex flex-col justify-between">
                    <div className="bg-slate-200 px-2 py-1 flex items-center gap-1.5 border-b border-slate-300 text-[6px] shrink-0 select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      <span className="bg-white px-2.5 py-0.5 rounded text-[5px] truncate flex-1 text-left text-slate-400 font-bold border border-slate-250">
                        {product.slug}.com
                      </span>
                    </div>
                    <div className="flex-grow p-3 flex flex-col justify-center items-center text-center space-y-1">
                      <span className="text-xs font-display font-black text-slate-900 tracking-wider">
                        {product.title}
                      </span>
                      <span className="text-[7px] text-accentCyan font-mono font-bold uppercase tracking-widest">
                        {getCategoryLabel(product.category)}
                      </span>
                      <div className="w-10 h-0.5 bg-accentGreen rounded mt-1.5 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Product Info Section */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                
                {/* Tags Row */}
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  {topBadges.map((badge, idx) => (
                    <span 
                      key={idx}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 ${
                        badge.includes('Premium') 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {badge.includes('Premium') ? (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block animate-pulse" />
                      ) : (
                        <FolderOpen size={12} className="text-purple-500" />
                      )}
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 leading-tight">
                    {product.title}
                  </h3>
                </div>

                {/* Sub-badges Row */}
                <div className="flex flex-wrap gap-2">
                  {subBadges.map((badge, idx) => (
                    <span 
                      key={idx}
                      className={`text-[11px] font-display font-bold px-3 py-1 rounded-full border border-slate-200 ${
                        idx === 0 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {idx === 0 ? '▲ ' : '● '}
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Price tag */}
                <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                  <span className="text-[11px] text-textMuted uppercase font-mono tracking-wider font-bold">Offer Value</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-textMuted line-through font-sans">
                      ৳{price.toLocaleString()}
                    </span>
                    <span className="text-xl font-display font-black text-accentGreen font-sans">
                      ৳{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-textMuted font-mono">BDT</span>
                  </div>
                </div>

                {/* Action button bar */}
                <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-100">
                  {/* Spec checklist modal button (Col 3) */}
                  <button
                    onClick={() => setActiveDetail({ title: product.title, features: product.featuresIncluded })}
                    className="col-span-3 border-2 border-slate-900 hover:bg-slate-50 flex items-center justify-center p-2.5 rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
                    title="View inclusions list"
                  >
                    <List size={16} className="text-slate-900 stroke-[2.5]" />
                  </button>

                  {/* Play video modal button (Col 3) */}
                  <button
                    onClick={() => setActiveVideo({ title: product.title, url: product.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })}
                    className="col-span-3 border-2 border-slate-900 hover:bg-slate-50 flex items-center justify-center p-2.5 rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
                    title="Play video demo"
                  >
                    <Play size={16} className="text-slate-900 fill-slate-900 stroke-[2.5]" />
                  </button>

                  {/* External preview website redirect button (Col 6) */}
                  <a
                    href={product.demoUrl || 'https://skcomart.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackServiceClick(product.id)}
                    className="col-span-6 border-2 border-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px] text-[11px] font-display font-black text-slate-900"
                  >
                    <ExternalLink size={14} className="stroke-[2.5]" />
                    Preview
                  </a>
                </div>

                {/* Offer Price redirection big button & WhatsApp button */}
                <div className="grid grid-cols-12 gap-2 pt-1">
                  <Link 
                    href={`/order/${product.slug}`} 
                    className="col-span-9"
                    onClick={() => trackServiceClick(product.id)}
                  >
                    <Button 
                      variant="cyan"
                      className="w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-neoSlate"
                    >
                      <CheckSquare size={14} />
                      Get Offer Price
                    </Button>
                  </Link>

                  {/* WhatsApp direct order button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackServiceClick(product.id)}
                    className="col-span-3 border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center rounded-xl transition-all shadow-neoSlate"
                    title="Order direct on WhatsApp"
                  >
                    <svg className="w-5 h-5 fill-green-600" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.956.57 3.779 1.554 5.316L2 22l4.903-1.282c1.477.807 3.167 1.267 4.966 1.267 5.507 0 10.024-4.47 10.024-9.953C21.893 6.47 17.416 2 12.012 2zm6.275 14.152c-.255.72-1.505 1.4-2.078 1.488-.56.088-1.29.176-3.87-1.127-3.13-1.579-5.11-4.723-5.265-4.933-.162-.21-1.29-1.725-1.29-3.29 0-1.564.81-2.33 1.097-2.617.287-.287.632-.36.84-.36.21 0 .42.003.606.012.203.01.472-.078.74.56.28.68.96 2.33 1.045 2.505.08.175.138.384.02.622-.11.237-.17.385-.34.577-.168.192-.357.43-.51.577-.17.162-.35.34-.15.683.2.34.89 1.467 1.9 2.366 1.306 1.162 2.406 1.522 2.748 1.697.34.174.54.15.74-.082.2-.23.86-1 .99-1.258.13-.258.26-.21.44-.142.18.07 1.145.54 1.343.639.2.1.33.15.38.238.05.088.05.513-.205 1.233z" />
                    </svg>
                  </a>
                </div>

              </div>

            </Card>
          );
        })}
      </div>

      {/* Interactive spec check list modal */}
      {activeDetail && (
        <ServiceDetailModal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={activeDetail.title}
          features={activeDetail.features}
        />
      )}

      {/* Dynamic video overlay modal */}
      {activeVideo && (
        <VideoModal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          videoUrl={activeVideo.url}
          title={activeVideo.title}
        />
      )}

    </main>
  );
}
