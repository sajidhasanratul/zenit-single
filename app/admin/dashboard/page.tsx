'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-left text-xs font-bold text-slate-500 font-display">
        Loading metrics...
      </div>
    );
  }

  const pathViews: Record<string, number> = stats?.pathViews || {};
  const referrers: Record<string, number> = stats?.referrers || {};

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Overview Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">ZenIT e-commerce telemetry and visitor conversion metrics.</p>
        </div>

        <Button
          onClick={fetchStats}
          disabled={refreshing}
          variant="slate"
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
          Refresh Stats
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border-2 border-slate-900 bg-white" glow="slate">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Total revenue</span>
          <p className="text-3xl font-display font-black text-accentGreen mt-1.5 font-sans">৳{stats?.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Completed orders revenue</p>
        </Card>

        <Card className="border-2 border-slate-900 bg-white" glow="slate">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Active Orders</span>
          <p className="text-3xl font-display font-black text-slate-900 mt-1.5 font-sans">{stats?.totalOrders || 0}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Total checklist submissions</p>
        </Card>

        <Card className="border-2 border-slate-900 bg-white" glow="slate">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Web Traffic</span>
          <p className="text-3xl font-display font-black text-slate-900 mt-1.5 font-sans">{stats?.totalVisits || 0}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Logged visitor hits</p>
        </Card>

        <Card className="border-2 border-slate-900 bg-white" glow="slate">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Attributions</span>
          <p className="text-3xl font-display font-black text-accentCyan mt-1.5 font-sans">{stats?.conversionRate || 0}%</p>
          <p className="text-[9px] text-slate-400 mt-0.5">(Orders + Leads) / Traffic visits</p>
        </Card>
      </div>

      {/* Financial & Ads Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-2 border-slate-900 bg-white p-4 shadow-neoSlate">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Client Invoices</p>
              <p className="text-xl font-black font-mono text-slate-900 mt-1">
                ৳{(stats?.invoices || []).reduce((sum: number, i: any) => sum + (Number(i.totalAmount) || 0), 0).toLocaleString()}
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Paid: ৳{(stats?.invoices || []).reduce((sum: number, i: any) => sum + (Number(i.paidAmount) || 0), 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-red-500 font-bold mt-2">
            Due Balance: ৳{(stats?.invoices || []).reduce((sum: number, i: any) => sum + (Number(i.dueAmount) || 0), 0).toLocaleString()}
          </p>
        </Card>

        <Card className="border-2 border-slate-900 bg-white p-4 shadow-neoSlate">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Ads Payments Tracked</p>
              <p className="text-xl font-black font-mono text-slate-900 mt-1">
                ৳{(stats?.adsPayments || []).reduce((sum: number, p: any) => sum + (Number(p.totalAmount) || 0), 0).toLocaleString()}
              </p>
            </div>
            <span className="text-[10px] bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded border border-cyan-200">
              Received: ৳{(stats?.adsPayments || []).reduce((sum: number, p: any) => sum + (Number(p.paidAmount) || 0), 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-red-500 font-bold mt-2">
            Pending Ads Due: ৳{(stats?.adsPayments || []).reduce((sum: number, p: any) => sum + (Number(p.dueAmount) || 0), 0).toLocaleString()}
          </p>
        </Card>

        <Card className="border-2 border-slate-900 bg-white p-4 shadow-neoSlate">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Catalog Engagement</p>
          <p className="text-xl font-black font-mono text-accentCyan mt-1">
            {Object.values(stats?.serviceMetrics || {}).reduce((acc: number, m: any) => acc + (m.views || 0), 0)} Total Views
          </p>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            {Object.values(stats?.serviceMetrics || {}).reduce((acc: number, m: any) => acc + (m.clicks || 0), 0)} Clicks Recorded
          </p>
        </Card>
      </div>

      {/* Path Views & Referrers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-2 border-slate-900 bg-white md:col-span-2 space-y-4">
          <h4 className="text-xs font-display font-bold uppercase tracking-wider border-b border-slate-200 pb-2">
            Navigation Paths Attributions
          </h4>
          <div className="space-y-3.5">
            {Object.entries(pathViews).map(([path, count]) => {
              const total = stats?.totalVisits || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={path} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-900 font-bold">{path}</span>
                    <span className="text-slate-500">{count} views ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                    <div className="bg-accentCyan h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-2 border-slate-900 bg-white space-y-4">
          <h4 className="text-xs font-display font-bold uppercase tracking-wider border-b border-slate-200 pb-2">
            Referring Channels
          </h4>
          <div className="space-y-3.5">
            {Object.entries(referrers).map(([ref, count]) => (
              <div key={ref} className="flex justify-between items-center text-xs font-mono border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-600 truncate max-w-[130px] font-bold">{ref}</span>
                <span className="text-accentCyan font-bold">{count} visits</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Products & Services Real-time Interaction Table */}
      <Card className="border-2 border-slate-900 bg-white p-5 space-y-4 shadow-neoSlate">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-display font-bold uppercase tracking-wider text-slate-900">
            Products & Services Telemetry (Views, Clicks, and CTR)
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Beacon metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-2">Product / Service</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-2 font-mono">Base Price</th>
                <th className="py-2.5 px-2 font-mono">Total Views</th>
                <th className="py-2.5 px-2 font-mono">CTA Clicks</th>
                <th className="py-2.5 px-2 font-mono">CTR %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(stats?.services || []).map((s: any) => {
                const metric = (stats?.serviceMetrics || {})[s.id] || { views: 0, clicks: 0 };
                const views = metric.views || 0;
                const clicks = metric.clicks || 0;
                const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 font-bold text-slate-900">
                      {s.title}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-slate-700">
                      ৳{(s.pricing?.basePriceBDT || s.basePriceBDT || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-cyan-700">
                      {views}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-emerald-600">
                      {clicks}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        Number(ctr) > 20 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : Number(ctr) > 0 
                          ? 'bg-cyan-100 text-cyan-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ctr}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
