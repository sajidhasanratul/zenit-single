'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, RefreshCw } from 'lucide-react';

export default function AdminTrackingSettings() {
  const [settingsForm, setSettingsForm] = useState({
    gtmId: '',
    pixelId: '',
    capiAccessToken: '',
    capiTestEventCode: ''
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [panelMsg, setPanelMsg] = useState({ text: '', type: 'success' });

  const fetchSettings = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setSettingsForm({
          gtmId: data.settings?.gtmId || '',
          pixelId: data.settings?.pixelId || '',
          capiAccessToken: data.settings?.capiAccessToken || '',
          capiTestEventCode: data.settings?.capiTestEventCode || ''
        });
      }
    } catch (err) {
      console.error('Failed to load tracking settings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelMsg({ text: '', type: 'success' });

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (response.ok) {
        setPanelMsg({ text: 'Tracking configurations successfully synchronized.', type: 'success' });
        fetchSettings();
      } else {
        const errData = await response.json();
        setPanelMsg({ text: errData.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err) {
      setPanelMsg({ text: 'Settings synchronization failed.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="text-left text-xs font-bold text-slate-500 font-display">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Tracking Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Synchronize Facebook Conversions API and Google Tag Manager credentials.</p>
        </div>

        <Button
          onClick={fetchSettings}
          disabled={refreshing}
          variant="slate"
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
          Refresh Settings
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

      {/* Form Card */}
      <div className="max-w-2xl">
        <Card className="border-2 border-slate-900 bg-white" glow="slate">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* GTM Setup */}
            <div className="space-y-4 border-b border-slate-200 pb-5">
              <h3 className="text-xs font-display font-black text-accentCyan uppercase tracking-wider">
                1. Google Tag Manager Container
              </h3>
              <div className="space-y-1.5 text-xs font-bold text-slate-500">
                <label>GTM Container ID</label>
                <Input
                  placeholder="e.g. GTM-XXXXXXX"
                  value={settingsForm.gtmId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gtmId: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
                <p className="text-[9px] text-slate-400 font-medium font-sans">Injects GTM script initialization blocks dynamically on main routes.</p>
              </div>
            </div>

            {/* Facebook Pixel & CAPI Setup */}
            <div className="space-y-4">
              <h3 className="text-xs font-display font-black text-accentGreen uppercase tracking-wider">
                2. Meta Pixel & Conversions API (CAPI)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                <div className="space-y-1.5">
                  <label>Meta Pixel / Dataset ID</label>
                  <Input
                    placeholder="e.g. 10243567890"
                    value={settingsForm.pixelId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pixelId: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>CAPI Test Event Code</label>
                  <Input
                    placeholder="e.g. TEST12345"
                    value={settingsForm.capiTestEventCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, capiTestEventCode: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-bold text-slate-500 pt-2">
                <label>Conversions API Long-Lived Access Token</label>
                <Input
                  type="password"
                  placeholder="EAABw..."
                  value={settingsForm.capiAccessToken}
                  onChange={(e) => setSettingsForm({ ...settingsForm, capiAccessToken: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="cyan"
              className="w-full py-3.5 font-bold flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-neoSlate text-xs"
            >
              <Settings size={14} />
              Synchronize Settings
            </Button>

          </form>
        </Card>
      </div>

    </div>
  );
}
