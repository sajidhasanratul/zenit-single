'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { 
  DollarSign, Edit, Trash2, XCircle, ListPlus, RefreshCw 
} from 'lucide-react';

interface PricingPlan {
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
  techBadges: string[];
  isPopular?: boolean;
}

export default function AdminPricingEditor() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [planForm, setPlanForm] = useState({
    title: '',
    category: 'Starter Plan',
    tagline: '',
    basePriceBDT: '',
    deliveryTimeDays: '5',
    features: '',
    techBadges: 'Next.js, Tailwind',
    isPopular: false
  });

  const [panelMsg, setPanelMsg] = useState({ text: '', type: 'success' });

  const fetchPlans = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.pricingPlans || []);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this pricing plan tier from the dynamic pricing page comparisons grid?')) return;
    try {
      await fetch(`/api/pricing/${id}`, { method: 'DELETE' });
      if (editingPlanId === id) handleCancelPlanEdit();
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete pricing plan:', err);
    }
  };

  const handleTriggerPlanEdit = (item: PricingPlan) => {
    setEditingPlanId(item.id);
    setPlanForm({
      title: item.title,
      category: item.category,
      tagline: item.tagline,
      basePriceBDT: item.pricing.basePriceBDT.toString(),
      deliveryTimeDays: item.deliveryTimeDays.toString(),
      features: item.featuresIncluded.join('\n'),
      techBadges: item.techBadges.join(', '),
      isPopular: !!item.isPopular
    });
    setPanelMsg({ text: `Editing plan: "${item.title}" mode active.`, type: 'success' });
  };

  const handleCancelPlanEdit = () => {
    setEditingPlanId(null);
    setPlanForm({
      title: '',
      category: 'Starter Plan',
      tagline: '',
      basePriceBDT: '',
      deliveryTimeDays: '5',
      features: '',
      techBadges: 'Next.js, Tailwind',
      isPopular: false
    });
    setPanelMsg({ text: '', type: 'success' });
  };

  const handleAddOrUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelMsg({ text: '', type: 'success' });

    const payload = {
      title: planForm.title,
      category: planForm.category.trim(),
      tagline: planForm.tagline,
      basePriceBDT: Number(planForm.basePriceBDT),
      deliveryTimeDays: Number(planForm.deliveryTimeDays),
      featuresIncluded: planForm.features.split('\n').filter(f => f.trim() !== ''),
      techBadges: planForm.techBadges.split(',').map(b => b.trim()).filter(b => b !== ''),
      isPopular: planForm.isPopular
    };

    const url = editingPlanId ? `/api/pricing/${editingPlanId}` : '/api/pricing';
    const method = editingPlanId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setPanelMsg({ 
          text: editingPlanId ? 'Pricing plan tier details updated.' : 'Dynamic pricing plan tier created successfully.', 
          type: 'success' 
        });
        handleCancelPlanEdit();
        fetchPlans();
      }
    } catch (err) {
      setPanelMsg({ text: 'API error. Failed to save plan.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="text-left text-xs font-bold text-slate-500 font-display">
        Loading plans catalog...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Pricing Plans Editor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage package pricing details displayed on the pricing grid.</p>
        </div>

        <Button
          onClick={fetchPlans}
          disabled={refreshing}
          variant="slate"
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
          Refresh Plans
        </Button>
      </div>

      {/* Global alert banner */}
      {panelMsg.text && (
        <div className={`p-4 rounded-xl border-2 text-xs font-bold text-left animate-fadeIn ${
          panelMsg.type === 'success' 
            ? 'bg-green-50 border-green-600 text-green-700 shadow-neoGreen' 
            : 'bg-red-50 border-red-600 text-red-700 shadow-neoSlate'
        }`}>
          {panelMsg.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Plans List */}
        <div className="lg:col-span-7">
          <Card className="border-2 border-slate-900 bg-white space-y-4">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider border-b border-slate-200 pb-2">
              Active Pricing Plan Tiers
            </h4>
            <div className="space-y-4 pr-1">
              {plans.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-slate-900">{item.title}</span>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[8px] font-mono text-slate-600 font-bold uppercase">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.tagline}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3.5 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">BDT Total</span>
                      <p className="text-sm font-black text-accentGreen font-sans">৳{item.pricing.basePriceBDT.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTriggerPlanEdit(item)}
                        className="text-slate-700 hover:text-slate-900 border-2 border-slate-900 bg-white hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                        title="Edit Plan"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(item.id)}
                        className="text-red-500 hover:text-red-700 border-2 border-slate-900 bg-white hover:bg-red-50 p-1.5 rounded-lg transition-all"
                        title="Delete Plan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Add/Edit Form */}
        <div className="lg:col-span-5">
          <Card className="border-2 border-slate-900 bg-white p-5 space-y-4" glow="slate">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-xs font-display font-black uppercase tracking-wider">
                {editingPlanId ? '⚙️ Edit Pricing Package' : '➕ Add Pricing Package'}
              </h4>
              {editingPlanId && (
                <button 
                  onClick={handleCancelPlanEdit}
                  className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-bold"
                >
                  <XCircle size={13} />
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdatePlan} className="space-y-3.5 text-xs font-bold text-slate-500">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Plan Title *</label>
                <Input
                  required
                  placeholder="e.g. Standard Website"
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Plan Tier Label *</label>
                  <Input
                    required
                    placeholder="e.g. Standard Plan"
                    value={planForm.category}
                    onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Base Price (BDT) *</label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 35000"
                    value={planForm.basePriceBDT}
                    onChange={(e) => setPlanForm({ ...planForm, basePriceBDT: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Delivery Days</label>
                  <Input
                    type="number"
                    value={planForm.deliveryTimeDays}
                    onChange={(e) => setPlanForm({ ...planForm, deliveryTimeDays: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Tech Badges (csv)</label>
                  <Input
                    value={planForm.techBadges}
                    onChange={(e) => setPlanForm({ ...planForm, techBadges: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block font-sans">Tagline</label>
                <Input
                  placeholder="Brief tier tagline..."
                  value={planForm.tagline}
                  onChange={(e) => setPlanForm({ ...planForm, tagline: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Plan inclusions (Line breaks)</label>
                <Textarea
                  placeholder="Next.js static generation&#10;Meta Conversions API setup"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="min-h-[80px] border-slate-355 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 select-none">
                <input
                  type="checkbox"
                  id="isPopularPlan"
                  checked={planForm.isPopular}
                  onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-slate-900 text-accentCyan focus:ring-0 accent-accentCyan"
                />
                <label htmlFor="isPopularPlan" className="text-slate-700 text-xs font-bold font-display">
                  Highlight as Popular Tier
                </label>
              </div>

              <Button
                type="submit"
                variant="cyan"
                className="w-full py-3.5 font-bold flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-neoSlate text-xs"
              >
                <ListPlus size={14} />
                {editingPlanId ? 'Update Pricing Plan' : 'Add Pricing Plan'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

    </div>
  );
}
