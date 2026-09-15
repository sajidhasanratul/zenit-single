'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronUp, ChevronDown, X, MessageSquare, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { trackInitiateCheckoutEvent } from '@/lib/trackingClient';

interface ProductServiceItem {
  id: string;
  category: string;
  title: string;
  tagline: string;
  pricing: {
    basePriceBDT: number;
    billingType: string;
    discountedPriceBDT?: number;
  };
  deliveryTimeDays: number;
}

interface BundleDrawerProps {
  selectedIds: string[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export default function BundleDrawer({ selectedIds, onRemoveItem, onClearAll }: BundleDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ProductServiceItem[]>([]);

  // Fetch product items list from database dynamically to verify calculations
  React.useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.success && data.services) {
          setServices(data.services);
        }
      } catch (err) {
        console.error('Failed to load dynamic bundle services:', err);
      }
    };
    loadServices();
  }, []);

  const selectedItems = services.filter(item => selectedIds.includes(item.id));

  if (selectedIds.length === 0) return null;

  // Apply standard 50% discount logic automatically to bundle pricing
  const totalBDT = selectedItems.reduce((sum, item) => sum + Math.round(item.pricing.basePriceBDT * 0.5), 0);
  const deliveryDays = selectedItems.reduce((max, item) => Math.max(max, item.deliveryTimeDays), 0);

  const handleWhatsAppExport = async () => {
    setIsSubmitting(true);
    try {
      // 1. Log InitiateCheckout in analytics (Pixel + CAPI)
      const itemTitles = selectedItems.map(item => item.title);
      await trackInitiateCheckoutEvent({
        items: itemTitles,
        value: totalBDT
      });

      // 2. Post bundle telemetry spec to database
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Anonymous Bundle Builder',
          businessName: 'Self Customizer',
          phone: '+8801516501284', // default tracking info
          selectedPackageCategory: 'custom_bundle',
          selectedItems: itemTitles,
          totalEstimatedBudgetBDT: totalBDT,
          sourcePage: '/services'
        })
      });

      // 3. Generate WhatsApp text redirect
      const waNumber = '8801516501284'; // Target agency WhatsApp admin line
      const messageText = `Hello ZenIT Team,\n\nI just built a custom service bundle on your website and would like a formal quotation.\n\n*Selected Services:*\n${selectedItems.map((item, idx) => `${idx + 1}. ${item.title} (৳${Math.round(item.pricing.basePriceBDT * 0.5).toLocaleString()})`).join('\n')}\n\n*Estimated Delivery:* ${deliveryDays} Days\n*Total Projected Budget:* ৳${totalBDT.toLocaleString()}\n\nPlease let me know when we can discuss this!\n`;
      
      const encodedMsg = encodeURIComponent(messageText);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMsg}`;
      
      // Redirect
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('Failed to trigger WhatsApp checkout tracking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-4 border-slate-900 shadow-2xl transition-all duration-300">
      {/* Header bar click toggle */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingBag className="text-accentCyan" size={20} />
            <span className="absolute -top-2 -right-2 bg-accentCyan text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-sans border border-white">
              {selectedItems.length}
            </span>
          </div>
          <span className="text-sm font-display font-black text-slate-900">
            Custom Package Bundle Builder
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-bold font-display"
          >
            {isExpanded ? (
              <>Hide Details <ChevronDown size={14} /></>
            ) : (
              <>Show Details <ChevronUp size={14} /></>
            )}
          </button>
          
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded bg-red-50 font-bold transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Expanded item listings */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Selected Items List */}
          <div className="md:col-span-2 max-h-36 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-300">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-left">
                <div>
                  <p className="text-slate-900 font-display font-black">{item.title}</p>
                  <p className="text-[10px] text-slate-500">{item.tagline}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-accentCyan font-bold font-sans">
                    ৳{Math.round(item.pricing.basePriceBDT * 0.5).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                    title="Remove item"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Totals Card */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-neoSlate text-left">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Cost (Est)</p>
                <p className="text-xl font-display font-black text-accentGreen font-sans">
                  ৳{totalBDT.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Timeframe</p>
                <p className="text-sm font-display font-bold text-slate-900 flex items-center gap-1 justify-end font-sans">
                  <Calendar size={13} className="text-accentCyan" />
                  ~{deliveryDays} Days
                </p>
              </div>
            </div>

            <Button
              onClick={handleWhatsAppExport}
              disabled={isSubmitting}
              variant="green"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold"
            >
              <MessageSquare size={16} />
              {isSubmitting ? 'Recording CAPI...' : 'Export & Order via WhatsApp'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
