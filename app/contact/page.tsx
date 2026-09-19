'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackLeadEvent } from '@/lib/trackingClient';
import { Phone, Mail, Clock, ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    selectedCategory: 'web_dev',
    message: '',
    budgetBDT: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Interactive mock calendar state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Load calculator variables from sessionStorage if user navigated from ROI calculator
  useEffect(() => {
    const loadCalcData = () => {
      const traffic = sessionStorage.getItem('zenit_calc_traffic');
      const conversion = sessionStorage.getItem('zenit_calc_conversion');
      const lift = sessionStorage.getItem('zenit_calc_lift');

      if (traffic && conversion && lift) {
        setForm(prev => ({
          ...prev,
          selectedCategory: 'pos',
          message: `[Growth Calculator Metrics Applied]\n• Monthly Traffic: ${Number(traffic).toLocaleString()} visitors\n• Baseline Conversion: ${conversion}%\n• Projected Revenue Lift: ৳${Number(lift).toLocaleString()}\n\nLet's build a customized conversion engine to capture this growth!`,
          budgetBDT: '35000' // Suggested budget amount
        }));
        
        // Clear sessionStorage to avoid repeating values on refresh
        sessionStorage.removeItem('zenit_calc_traffic');
        sessionStorage.removeItem('zenit_calc_conversion');
        sessionStorage.removeItem('zenit_calc_lift');
      }
    };

    loadCalcData();
    window.addEventListener('zenit_calculator_applied', loadCalcData);
    return () => window.removeEventListener('zenit_calculator_applied', loadCalcData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return;

    setLoading(true);

    const payload = {
      fullName: form.fullName,
      businessName: form.businessName,
      phone: form.phone,
      email: form.email,
      selectedPackageCategory: form.selectedCategory,
      selectedItems: ['Contact Page Intake Form'],
      totalEstimatedBudgetBDT: Number(form.budgetBDT) || 15000,
      sourcePage: '/contact',
      calculatorMetrics: form.message.includes('Growth Calculator Metrics') ? {
        monthlyTraffic: 15000,
        currentConversionRate: 1.2,
        projectedRevenueIncrease: 45000
      } : undefined
    };

    try {
      // 1. Submit lead details to JSON DB via API route
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // 2. Dispatch Meta Pixel & Conversions API (CAPI) events
        await trackLeadEvent({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          businessName: form.businessName,
          value: Number(form.budgetBDT) || 15000
        });

        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit contact lead:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock calendar datasets
  const nextThreeDays = [
    { dayName: 'Today', dateString: 'Aug 21' },
    { dayName: 'Tomorrow', dateString: 'Aug 22' },
    { dayName: 'Monday', dateString: 'Aug 24' }
  ];
  const timeSlots = ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'];

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      setBookingConfirmed(true);
    }
  };

  return (
    <main className="min-h-screen bg-background text-textWhite py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Smart Intake Form */}
        <div id="booking-form" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-accentCyan/10 border border-accentCyan/20 text-accentCyan px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
              Lead Ingestion System
            </span>
            <h1 className="text-3xl font-display font-black tracking-wide">Start Your Project</h1>
            <p className="text-xs text-textMuted leading-relaxed">
              Fill in your business details. Metrics applied from the ROI calculator or product bundle config will populate below automatically.
            </p>
          </div>

          <Card className="border border-borderSlate" glow="slate">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 bg-accentGreen/10 text-accentGreen border border-accentGreen/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-accentGreen">Lead Registered</h3>
                <p className="text-xs text-textMuted max-w-sm mx-auto leading-relaxed">
                  Thanks! Your business qualification data is logged in our CRM. A senior engineer will review it and follow up within 15 minutes.
                </p>
                <Button 
                  onClick={() => { setSubmitted(false); setForm({ fullName: '', businessName: '', phone: '', email: '', selectedCategory: 'web_dev', message: '', budgetBDT: '' }); }}
                  variant="slate" 
                  className="px-6 py-2 text-xs"
                >
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-display font-medium text-textMuted">Your Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Tanvir Rahman"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-display font-medium text-textMuted">Business Name</label>
                    <Input
                      placeholder="e.g. Apex Retail BD"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-display font-medium text-textMuted">Phone Number (WhatsApp) *</label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. +8801712345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-display font-medium text-textMuted">Email Address</label>
                    <Input
                      type="email"
                      placeholder="e.g. hello@business.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-display font-medium text-textMuted">Service Category</label>
                    <select
                      value={form.selectedCategory}
                      onChange={(e) => setForm({ ...form, selectedCategory: e.target.value })}
                      className="flex w-full rounded-lg border-2 border-slate-900 bg-white px-4 py-2.5 text-slate-900 font-sans text-xs focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan/30 shadow-neoSlate"
                    >
                      <option value="web_dev" className="bg-white text-slate-900">High-Performance Web Development</option>
                      <option value="meta_ads" className="bg-white text-slate-900">Meta Ads & Digital Marketing</option>
                      <option value="ai_automation" className="bg-white text-slate-900">AI Sales Bots & CRM Webhooks</option>
                      <option value="pos" className="bg-white text-slate-900">POS - Point of Sale</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-display font-medium text-textMuted">Project Budget (BDT)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 25000"
                      value={form.budgetBDT}
                      onChange={(e) => setForm({ ...form, budgetBDT: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-display font-medium text-textMuted">Project Scope / Inquiries</label>
                  <Textarea
                    placeholder="Describe what integrations, features, or tracking scripts you require..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="cyan"
                  className="w-full py-3 font-bold text-sm"
                >
                  {loading ? 'Submitting & Dispatching CAPI...' : 'Submit Inquiry & Sync CRM'}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Right Side: Contact Details & Cal.com Booking Scheduler */}
        <div className="space-y-6 lg:pl-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-accentGreen/10 border border-accentGreen/20 text-accentGreen px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
              Direct Channels & Schedules
            </span>
            <h2 className="text-3xl font-display font-black tracking-wide">Book an Onboarding Call</h2>
            <p className="text-xs text-textMuted leading-relaxed">
              Need immediate answers? Ring our helpline, trigger WhatsApp, or use the interactive schedule dashboard below to lock a calendar slot.
            </p>
          </div>

          {/* Quick SLA Helpline details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-100 border-2 border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-neoSlate">
              <Phone className="text-accentCyan mb-1.5" size={16} />
              <span className="text-[11px] text-textMuted uppercase font-bold">Phone Helpline</span>
              <a href="tel:+8801516501284" className="text-sm text-slate-900 font-bold font-sans mt-0.5 hover:text-accentCyan transition-colors">+8801516501284</a>
            </div>
            
            <div className="bg-slate-100 border-2 border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-neoSlate">
              <Mail className="text-accentCyan mb-1.5" size={16} />
              <span className="text-[11px] text-textMuted uppercase font-bold">Office Email</span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <a href="mailto:contact@zenplusit.com" className="text-xs text-slate-900 font-bold font-sans hover:text-accentCyan transition-colors">contact@zenplusit.com</a>
                <a href="mailto:info.zenplusit@gmail.com" className="text-xs text-slate-900 font-bold font-sans hover:text-accentCyan transition-colors">info.zenplusit@gmail.com</a>
              </div>
            </div>

            <div className="bg-slate-100 border-2 border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-neoSlate">
              <Clock className="text-accentGreen mb-1.5" size={16} />
              <span className="text-[11px] text-accentGreen uppercase font-bold font-display">Fast Response</span>
              <span className="text-sm text-accentGreen font-bold font-sans mt-0.5">&lt; 15 mins SLA</span>
            </div>
          </div>

          {/* Social Media Links Block */}
          <Card className="border-2 border-slate-900 bg-white p-6 md:p-8 space-y-6 shadow-neoSlate text-left" glow="cyan">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-display font-black text-slate-900">Connect With Us</h3>
              <p className="text-xs text-textMuted mt-1">Get in touch directly through our official social media channels.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/zenit007" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3.5 p-3.5 border-2 border-slate-900 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all shadow-neoSlate hover:-translate-y-0.5"
              >
                <div className="p-2.5 bg-blue-600 text-white rounded-lg border border-blue-700 shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H7v3h2v9h3v-9h2.72l.4-3H12V6.5c0-.9.2-1.3 1-1.3h1.3V2H12c-2.77 0-3 1.83-3 4V8z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Facebook</p>
                  <p className="text-sm text-slate-900 font-black">fb.com/zenit007</p>
                </div>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/zenplusit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3.5 p-3.5 border-2 border-slate-900 rounded-xl bg-slate-50 hover:bg-pink-50 transition-all shadow-neoSlate hover:-translate-y-0.5"
              >
                <div className="p-2.5 bg-gradient-to-tr from-yellow-500 to-pink-500 text-white rounded-lg border border-pink-600 shrink-0">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Instagram</p>
                  <p className="text-sm text-slate-900 font-black">@zenplusit</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/8801516501284" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3.5 p-3.5 border-2 border-slate-900 rounded-xl bg-slate-50 hover:bg-green-50 transition-all shadow-neoSlate hover:-translate-y-0.5"
              >
                <div className="p-2.5 bg-green-600 text-white rounded-lg border border-green-700 shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.956.57 3.779 1.554 5.316L2 22l4.903-1.282c1.477.807 3.167 1.267 4.966 1.267 5.507 0 10.024-4.47 10.024-9.953C21.893 6.47 17.416 2 12.012 2zm6.275 14.152c-.255.72-1.505 1.4-2.078 1.488-.56.088-1.29.176-3.87-1.127-3.13-1.579-5.11-4.723-5.265-4.933-.162-.21-1.29-1.725-1.29-3.29 0-1.564.81-2.33 1.097-2.617.287-.287.632-.36.84-.36.21 0 .42.003.606.012.203.01.472-.078.74.56.28.68.96 2.33 1.045 2.505.08.175.138.384.02.622-.11.237-.17.385-.34.577-.168.192-.357.43-.51.577-.17.162-.35.34-.15.683.2.34.89 1.467 1.9 2.366 1.306 1.162 2.406 1.522 2.748 1.697.34.174.54.15.74-.082.2-.23.86-1 .99-1.258.13-.258.26-.21.44-.142.18.07 1.145.54 1.343.639.2.1.33.15.38.238.05.088.05.513-.205 1.233z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">WhatsApp</p>
                  <p className="text-sm text-slate-900 font-black">+8801516501284</p>
                </div>
              </a>
            </div>
          </Card>
        </div>

      </div>
    </main>
  );
}
