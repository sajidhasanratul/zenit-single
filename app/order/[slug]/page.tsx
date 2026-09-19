'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackClientPixel, trackCapiEvent, generateEventId } from '@/lib/trackingClient';
import { 
  Globe, Laptop, Settings, CheckCircle2, 
  Server, Cloud, Layout, Check 
} from 'lucide-react';

interface ServiceItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  tagline: string;
  pricing: {
    basePriceBDT: number;
  };
  deliveryTimeDays: number;
  featuresIncluded: string[];
}

export default function OrderConfiguratorPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Configuration options selection
  const [platform, setPlatform] = useState<'website' | 'web_app'>('website');
  const [customization, setCustomization] = useState<'as_is' | 'customized'>('as_is');
  const [hosting, setHosting] = useState<'own' | 'hosted'>('own');
  const [domain, setDomain] = useState<'already' | 'need'>('already');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.success && data.services) {
          const item = data.services.find((s: any) => s.slug === params.slug);
          if (item) {
            setService(item);
          }
        }
      } catch (err) {
        console.error('Failed to load service specs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-textWhite flex items-center justify-center font-display font-medium">
        <span className="w-1.5 h-1.5 bg-accentCyan rounded-full inline-block animate-ping mr-2" />
        Configuring order build sheet...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background text-slate-900 flex items-center justify-center text-xs font-mono font-bold">
        Service specifications not found in system registers.
      </div>
    );
  }

  // Pricing values (Original vs Discounted BDT)
  const baseDiscounted = service.pricing.basePriceBDT;
  const baseOriginal = baseDiscounted * 2;

  // Option Addons Original
  const platformAddonOriginal = platform === 'web_app' ? 60000 : 0;
  const customizationAddonOriginal = customization === 'customized' ? 30000 : 0;
  const hostingAddonOriginal = hosting === 'hosted' ? 10000 : 0;
  const domainAddonOriginal = domain === 'need' ? 2000 : 0;

  // Calculation summaries
  const totalOriginal = baseOriginal + platformAddonOriginal + customizationAddonOriginal + hostingAddonOriginal + domainAddonOriginal;
  const totalDiscounted = totalOriginal * 0.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email) return;

    setSubmitting(true);

    const payload = {
      fullName,
      phone,
      email,
      serviceId: service.id,
      serviceTitle: service.title,
      optionsSelected: { platform, customization, hosting, domain },
      totalBDT: totalDiscounted
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Dispatch Meta Pixel and CAPI Purchase tracking event
        const eventId = generateEventId();
        const customData = {
          content_name: service.title,
          content_category: 'Service Order Checkout',
          currency: 'BDT',
          value: totalDiscounted,
          userData: { fullName, email, phone }
        };

        // Client Pixel
        trackClientPixel('Purchase', eventId, customData);
        // Server CAPI
        await trackCapiEvent('Purchase', eventId, customData);

        setSubmitted(true);
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 py-12 px-4 md:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {submitted ? (
          <Card className="max-w-xl mx-auto border-2 border-slate-900 bg-white text-center py-12 space-y-6 shadow-neoGreen">
            <div className="w-16 h-16 bg-green-50 border-2 border-green-600 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} className="stroke-[3]" />
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900">Order Placed!</h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Hi <strong>{fullName}</strong>, your custom order for <strong>{service.title}</strong> has been registered. 
              We will contact you shortly to confirm specs and deploy.
            </p>
            <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 max-w-sm mx-auto text-xs text-slate-600 text-left space-y-2 font-mono">
              <p>• <strong>BDT Total:</strong> ৳{totalDiscounted.toLocaleString()} BDT</p>
              <p>• <strong>Hosting:</strong> {hosting === 'hosted' ? 'Managed VPS' : 'Own VPS'}</p>
              <p>• <strong>Customization:</strong> {customization === 'customized' ? 'Included' : 'Ready solution'}</p>
            </div>
            <Button 
              onClick={() => router.push('/services')} 
              variant="cyan" 
              className="px-6 py-2.5 text-xs font-bold mt-4 border-2 border-slate-900 shadow-neoSlate"
            >
              Return to Catalog
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Specification options + Lead capture form */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Step configurator card */}
              <Card className="border-2 border-slate-900 p-6 space-y-8 bg-white shadow-neoSlate">
                <h2 className="text-lg font-display font-black text-slate-900 border-b border-slate-200 pb-3 text-left">
                  ⚙️ Project Specification Builder
                </h2>

                {/* Step 1: Platform Selection */}
                <div className="space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full text-[11px] flex items-center justify-center font-mono font-bold">1</span>
                    <span className="text-xs uppercase text-slate-500 tracking-wider font-bold">Platform Selection</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setPlatform('website')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        platform === 'website' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Laptop className="text-accentCyan" size={20} />
                        {platform === 'website' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Website Only</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        A full-featured website with a powerful admin panel and full control of all features.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => setPlatform('web_app')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        platform === 'web_app' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Layout className="text-accentCyan" size={20} />
                        {platform === 'web_app' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Website & Mobile App</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        All-in-one solution with a website and mobile apps for iOS and Android devices (+৳30,000 net).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Step 2: Customization Level */}
                <div className="space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full text-[11px] flex items-center justify-center font-mono font-bold">2</span>
                    <span className="text-xs uppercase text-slate-500 tracking-wider font-bold">Customization Level</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setCustomization('as_is')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        customization === 'as_is' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Check className="text-accentCyan stroke-[3]" size={20} />
                        {customization === 'as_is' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">As It Is (Ready Solution)</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        We will deliver a website exactly like the preview, including all standard features.
                      </p>
                    </button>

                    <button
                      onClick={() => setCustomization('customized')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        customization === 'customized' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Settings className="text-accentCyan" size={20} />
                        {customization === 'customized' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Some Customization</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Your custom requirements and a website exactly like the preview, including all standard features (+৳15,000 net).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Step 3: Hosting Preference */}
                <div className="space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full text-[11px] flex items-center justify-center font-mono font-bold">3</span>
                    <span className="text-xs uppercase text-slate-500 tracking-wider font-bold">Hosting Preference</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setHosting('own')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        hosting === 'own' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Server className="text-accentCyan" size={20} />
                        {hosting === 'own' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Own Custom VPS</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        The project will be deployed on your VPS server. Please note that shared or cPanel hosting is not supported.
                      </p>
                    </button>

                    <button
                      onClick={() => setHosting('hosted')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        hosting === 'hosted' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Cloud className="text-accentCyan" size={20} />
                        {hosting === 'hosted' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Our Hosted VPS (Managed)</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Get a high-quality shared VPS with excellent performance at a low cost (+৳5,000 net/yr).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Step 4: Domain Selection */}
                <div className="space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full text-[11px] flex items-center justify-center font-mono font-bold">4</span>
                    <span className="text-xs uppercase text-slate-500 tracking-wider font-bold">Domain Selection</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setDomain('already')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        domain === 'already' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Globe className="text-accentCyan" size={20} />
                        {domain === 'already' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Already Have Domain</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        You already have your own domain name registered and ready.
                      </p>
                    </button>

                    <button
                      onClick={() => setDomain('need')}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${
                        domain === 'need' 
                          ? 'border-accentCyan bg-blue-50/50 shadow-neoCyan' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Globe className="text-accentCyan" size={20} />
                        {domain === 'need' && <CheckCircle2 size={16} className="text-accentCyan" />}
                      </div>
                      <h4 className="text-sm font-display font-black text-slate-900 mt-3">Need Domain From Us</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        A domain name will be purchased and provided for your website if available (+৳1,000 net).
                      </p>
                    </button>
                  </div>
                </div>

              </Card>

              {/* Client Info Form card */}
              <Card className="border-2 border-slate-900 p-6 space-y-6 text-left bg-white shadow-neoSlate">
                {/* Header card inside left column */}
                <div className="flex items-center gap-4 bg-slate-50 border-2 border-slate-900 rounded-xl p-4">
                  <div className="w-14 h-12 bg-accentCyan/10 rounded-lg flex items-center justify-center text-accentCyan shrink-0 border border-accentCyan/20">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                      Premium
                    </span>
                    <h3 className="text-base font-display font-black text-slate-900 mt-1">{service.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed truncate max-w-md">{service.tagline}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 font-display font-bold text-xs text-slate-500">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider block">Full Name *</label>
                    <Input
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-2 border-slate-900 text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider block">Phone Number *</label>
                      <Input
                        required
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border-2 border-slate-900 text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider block">Email Address *</label>
                      <Input
                        required
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-2 border-slate-900 text-slate-900"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="cyan"
                    className="w-full py-4 text-xs font-bold flex items-center justify-center gap-2 mt-6 border-2 border-slate-900 shadow-neoSlate"
                  >
                    <CheckCircle2 size={16} />
                    {submitting ? 'Creating Order...' : 'Submit Now'}
                  </Button>

                  <div className="space-y-1.5 pt-3 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed font-bold">
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accentCyan rounded-full shrink-0 animate-ping" />
                      We will confirm your order details after final specification discussions.
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accentCyan rounded-full shrink-0" />
                      Pricing can be adjusted based on customization levels.
                    </p>
                  </div>
                </form>
              </Card>

            </div>

            {/* RIGHT COLUMN: Live Invoice calculation */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 text-left">
              
              {/* Special Offer Box */}
              <Card className="border-2 border-slate-900 bg-white relative p-6 space-y-4 shadow-neoGreen">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display font-black text-slate-900">
                    🎉 Special Offer BDT
                  </span>
                  <span className="bg-red-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    50% OFF
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs text-slate-400 line-through font-sans">
                    ৳{totalOriginal.toLocaleString()}
                  </p>
                  <p className="text-3xl font-display font-black text-accentGreen flex items-baseline gap-1 font-sans">
                    ৳{totalDiscounted.toLocaleString()}
                    <span className="text-xs text-textMuted font-mono font-bold ml-1">BDT</span>
                  </p>
                </div>
              </Card>

              {/* Negotiable Price Notice */}
              <div className="border-2 border-slate-900 bg-amber-55 rounded-xl p-4 shadow-neoSlate text-center text-xs md:text-sm font-display font-black text-slate-900 leading-relaxed border-dashed">
                📢 Final price is negotiable depending on project specification.
              </div>

              {/* Package inclusions items list */}
              <Card className="border-2 border-slate-900 bg-white p-6 space-y-4 shadow-neoSlate">
                <h3 className="text-xs uppercase text-slate-400 tracking-wider font-bold border-b border-slate-200 pb-2">
                  Inclusions Summary:
                </h3>

                <ul className="space-y-3.5 text-xs text-slate-600">
                  {/* Service Base */}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-accentGreen shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">{service.title}</p>
                      <p className="text-[9px] font-mono">৳{baseOriginal.toLocaleString()} &rarr; ৳{baseDiscounted.toLocaleString()}</p>
                    </div>
                  </li>

                  {/* Platform option */}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-accentGreen shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">
                        Platform: {platform === 'web_app' ? 'Website & Mobile App' : 'Website Only'}
                      </p>
                      {platform === 'web_app' ? (
                        <p className="text-[9px] text-accentGreen font-bold font-mono">৳60,000 (50% Off &rarr; ৳30,000)</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-mono">Included</p>
                      )}
                    </div>
                  </li>

                  {/* Customization option */}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-accentGreen shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">
                        Customization: {customization === 'customized' ? 'Some Customization' : 'As It Is'}
                      </p>
                      {customization === 'customized' ? (
                        <p className="text-[9px] text-accentGreen font-bold font-mono">৳30,000 (50% Off &rarr; ৳15,000)</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-mono">Included</p>
                      )}
                    </div>
                  </li>

                  {/* Hosting option */}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-accentGreen shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">
                        Hosting: {hosting === 'hosted' ? 'Our Hosted VPS' : 'Own Custom VPS'}
                      </p>
                      {hosting === 'hosted' ? (
                        <p className="text-[9px] text-accentGreen font-bold font-mono">৳10,000 (50% Off &rarr; ৳5,000/yr)</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-mono">Included</p>
                      )}
                    </div>
                  </li>

                  {/* Domain option */}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-accentGreen shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">
                        Domain: {domain === 'need' ? 'Need Domain' : 'Already Have Domain'}
                      </p>
                      {domain === 'need' ? (
                        <p className="text-[9px] text-accentGreen font-bold font-mono">৳2,000 (50% Off &rarr; ৳1,000)</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-mono">Included</p>
                      )}
                    </div>
                  </li>

                  {/* Support */}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-accentGreen shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">Technical Support</p>
                      <p className="text-[9px] text-accentGreen font-bold font-mono uppercase">Free</p>
                    </div>
                  </li>
                </ul>
              </Card>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
