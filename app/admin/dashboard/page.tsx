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

    </div>
  );
}
