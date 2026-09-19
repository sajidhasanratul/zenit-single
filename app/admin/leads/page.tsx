'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Lead {
  id: string;
  fullName: string;
  businessName: string;
  phone: string;
  email?: string;
  selectedPackageCategory: string;
  selectedItems: string[];
  totalEstimatedBudgetBDT: number;
  submittedAt: string;
  sourcePage?: string;
}

export default function AdminLeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="text-left text-xs font-bold text-slate-500 font-display">
        Loading CRM leads...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Contact Leads
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer project inquiries and AI automated meeting bookings.</p>
        </div>

        <Button
          onClick={fetchLeads}
          disabled={refreshing}
          variant="slate"
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
          Refresh Leads
        </Button>
      </div>

      {/* Leads Table */}
      <Card className="border-2 border-slate-900 bg-white">
        <div className="overflow-x-auto">
          {leads.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center font-bold">No leads captured yet.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-500 uppercase tracking-wider font-display font-bold">
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Client Details</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Selected Items / Notes</th>
                  <th className="py-2.5 px-2 text-right">Budget (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 font-sans">
                    <td className="py-3 px-2 text-slate-500 text-[10px] font-mono">
                      {new Date(lead.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-slate-900 font-bold font-display">{lead.fullName}</p>
                      <p className="text-[10px] text-slate-500">{lead.businessName || 'No Company'} • {lead.phone}</p>
                      {lead.email && <p className="text-[10px] text-accentCyan/80 font-mono font-semibold">{lead.email}</p>}
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] capitalize font-mono font-bold">
                        {lead.selectedPackageCategory.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 max-w-[200px] text-[10px] text-slate-500 truncate" title={lead.selectedItems.join(', ')}>
                      <p className="font-bold text-slate-700">{lead.selectedItems.join(', ')}</p>
                      {lead.sourcePage && <p className="text-[9px] text-slate-400 font-mono font-semibold mt-0.5">{lead.sourcePage}</p>}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-accentGreen font-mono">
                      ৳{lead.totalEstimatedBudgetBDT?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

    </div>
  );
}
