'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { 
  CreditCard, PlusCircle, RefreshCw, Edit, Trash2, 
  Search, CheckCircle2, AlertCircle, XCircle, DollarSign, Filter
} from 'lucide-react';

interface AdsPayment {
  id: string;
  invoiceNumber: string;
  businessName: string;
  clientName?: string;
  clientPhone?: string;
  campaignType: 'awareness' | 'message' | 'website';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'due';
  paymentDate: string;
  notes?: string;
  createdAt?: string;
}

export default function AdminAdsPaymentsPage() {
  const [payments, setPayments] = useState<AdsPayment[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | ''>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  // Form state
  const [form, setForm] = useState({
    invoiceNumber: '',
    businessName: '',
    clientName: '',
    clientPhone: '',
    campaignType: 'website' as 'awareness' | 'message' | 'website',
    totalAmount: '0',
    paidAmount: '0',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchPayments = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/ads-payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
      const statsRes = await fetch('/api/analytics/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setUserRole(statsData.role || 'manager');
      }
    } catch (err) {
      console.error('Failed to load ads payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalNum = Number(form.totalAmount) || 0;
  const paidNum = Number(form.paidAmount) || 0;
  const dueNum = Math.max(0, totalNum - paidNum);

  const handleOpenCreate = () => {
    setEditingId(null);
    const nextInvoiceNumber = `ADS-${Math.floor(1000 + Math.random() * 9000)}`;
    setForm({
      invoiceNumber: nextInvoiceNumber,
      businessName: '',
      clientName: '',
      clientPhone: '',
      campaignType: 'website',
      totalAmount: '0',
      paidAmount: '0',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
    setAlertMsg({ text: '', type: 'success' });
  };

  const handleOpenEdit = (p: AdsPayment) => {
    setEditingId(p.id);
    setForm({
      invoiceNumber: p.invoiceNumber,
      businessName: p.businessName,
      clientName: p.clientName || '',
      clientPhone: p.clientPhone || '',
      campaignType: p.campaignType || 'website',
      totalAmount: String(p.totalAmount || 0),
      paidAmount: String(p.paidAmount || 0),
      paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
      notes: p.notes || ''
    });
    setIsModalOpen(true);
    setAlertMsg({ text: '', type: 'success' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName) {
      setAlertMsg({ text: 'Business name is required.', type: 'error' });
      return;
    }

    const payload = {
      invoiceNumber: form.invoiceNumber,
      businessName: form.businessName,
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      campaignType: form.campaignType,
      totalAmount: totalNum,
      paidAmount: paidNum,
      dueAmount: dueNum,
      status: paidNum >= totalNum && totalNum > 0 ? 'paid' : paidNum > 0 ? 'partial' : 'due',
      paymentDate: form.paymentDate,
      notes: form.notes
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/ads-payments/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setAlertMsg({ text: 'Ads payment history updated successfully!', type: 'success' });
          setIsModalOpen(false);
          fetchPayments();
        } else {
          const err = await res.json();
          setAlertMsg({ text: err.error || 'Failed to update record.', type: 'error' });
        }
      } else {
        const res = await fetch('/api/ads-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setAlertMsg({ text: 'New ads payment entry created!', type: 'success' });
          setIsModalOpen(false);
          fetchPayments();
        } else {
          const err = await res.json();
          setAlertMsg({ text: err.error || 'Failed to create record.', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Failed to submit ads payment:', err);
      setAlertMsg({ text: 'Network communication failure.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    // Only admin can delete ads payments
    if (userRole !== 'admin') {
      alert('Access Denied: The delete button is only available for Administrators.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this ads payment history?')) return;

    try {
      const res = await fetch(`/api/ads-payments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPayments();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete payment record.');
      }
    } catch (err) {
      console.error('Delete ads payment error:', err);
    }
  };

  // Filter logic
  const filtered = payments.filter(p => {
    const matchesSearch = 
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.clientPhone && p.clientPhone.includes(searchTerm));

    if (!matchesSearch) return false;
    if (campaignFilter !== 'all' && p.campaignType !== campaignFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const totalAmountSum = payments.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
  const totalPaidSum = payments.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0);
  const totalDueSum = payments.reduce((acc, p) => acc + (Number(p.dueAmount) || 0), 0);

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 flex items-center gap-2">
            <CreditCard className="text-accentCyan" size={26} />
            Ads Payments Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal ledger for client advertising budgets, disbursements, and outstanding dues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchPayments}
            disabled={refreshing}
            variant="slate"
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
            Refresh
          </Button>

          <Button
            onClick={handleOpenCreate}
            variant="cyan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-slate-900 shadow-neoSlate text-xs font-bold"
          >
            <PlusCircle size={14} />
            Record Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Campaign Budget</p>
          <p className="text-xl font-black font-mono text-slate-900 mt-1">৳{totalAmountSum.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">{payments.length} Records logged</span>
        </Card>

        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Received</p>
          <p className="text-xl font-black font-mono text-emerald-600 mt-1">৳{totalPaidSum.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Cleared payments</span>
        </Card>

        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Due Balance</p>
          <p className="text-xl font-black font-mono text-red-500 mt-1">৳{totalDueSum.toLocaleString()}</p>
          <span className="text-[10px] text-red-500 font-bold">Outstanding dues</span>
        </Card>

        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Logged Campaigns</p>
          <p className="text-xl font-black font-mono text-accentCyan mt-1">
            {payments.length}
          </p>
          <span className="text-[10px] text-slate-400">
            {payments.filter(p => p.status === 'due').length} pending clearance
          </span>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-white p-3 rounded-xl border-2 border-slate-900 shadow-neoSlate">
        <div className="relative w-full lg:w-72">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, business, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-accentCyan text-slate-900 font-medium"
          />
        </div>

        {/* Campaign Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Campaign:</span>
          {['all', 'awareness', 'message', 'website'].map((type) => (
            <button
              key={type}
              onClick={() => setCampaignFilter(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border-2 ${
                campaignFilter === type
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Status:</span>
          {['all', 'paid', 'partial', 'due'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border-2 ${
                statusFilter === status
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Alert */}
      {alertMsg.text && (
        <div className={`p-3 rounded-xl border-2 text-xs font-bold ${
          alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-500' : 'bg-red-50 text-red-800 border-red-500'
        }`}>
          {alertMsg.text}
        </div>
      )}

      {/* Table */}
      <Card className="border-2 border-slate-900 bg-white p-4 shadow-neoSlate overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
            Loading ads payment history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold">
            No ads payment records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Invoice #</th>
                  <th className="py-3 px-2">Business Name</th>
                  <th className="py-3 px-2">Client Contacts</th>
                  <th className="py-3 px-2">Campaign Type</th>
                  <th className="py-3 px-2">Price / Total</th>
                  <th className="py-3 px-2">Paid / Due</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Invoice # */}
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      {item.invoiceNumber}
                    </td>

                    {/* Business Name */}
                    <td className="py-3 px-2 font-bold text-slate-900">
                      {item.businessName}
                    </td>

                    {/* Client Contacts (Optional) */}
                    <td className="py-3 px-2">
                      {item.clientName || item.clientPhone ? (
                        <>
                          <p className="font-medium text-slate-800">{item.clientName || '—'}</p>
                          {item.clientPhone && (
                            <p className="text-[10px] text-slate-500 font-mono">{item.clientPhone}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Optional / N/A</span>
                      )}
                    </td>

                    {/* Campaign Type */}
                    <td className="py-3 px-2">
                      <span className={`inline-block border border-slate-900 rounded text-[9px] font-black uppercase px-2 py-0.5 ${
                        item.campaignType === 'website'
                          ? 'bg-cyan-100 text-cyan-800'
                          : item.campaignType === 'message'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.campaignType}
                      </span>
                    </td>

                    {/* Price / Total */}
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      ৳{Number(item.totalAmount).toLocaleString()}
                    </td>

                    {/* Paid vs Due */}
                    <td className="py-3 px-2 font-mono text-[11px]">
                      <p className="text-emerald-600 font-bold">Paid: ৳{Number(item.paidAmount).toLocaleString()}</p>
                      <p className={`font-bold ${Number(item.dueAmount) > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        Due: ৳{Number(item.dueAmount).toLocaleString()}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-2">
                      <span className={`inline-block border-2 border-slate-900 rounded text-[9px] font-black uppercase px-2 py-0.5 ${
                        item.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 text-slate-500 text-[11px] font-mono">
                      {item.paymentDate}
                    </td>

                    {/* Actions: Edit & Delete (Admin Only) */}
                    <td className="py-3 px-2 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-slate-700 hover:text-slate-900 border-2 border-slate-900 bg-white hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                        title="Edit Record"
                      >
                        <Edit size={13} />
                      </button>

                      {/* Delete button strictly only for admin role */}
                      {userRole === 'admin' ? (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 border-2 border-slate-900 bg-white hover:bg-red-50 p-1.5 rounded-lg transition-all"
                          title="Delete Record (Admin Only)"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal / Drawer for Add & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-xl w-full p-6 text-slate-900 my-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-black font-display text-slate-900 flex items-center gap-2">
                <CreditCard className="text-accentCyan" size={18} />
                {editingId ? 'Edit Ads Payment Record' : 'Record New Client Ads Payment'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-bold text-slate-600">
              
              {/* Row 1: Invoice # & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Invoice Number *</label>
                  <Input
                    required
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                    className="border-slate-300 font-mono text-slate-900"
                    placeholder="e.g. ADS-1001"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Business Name *</label>
                  <Input
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="border-slate-300 text-slate-900"
                    placeholder="e.g. Apex Retail BD"
                  />
                </div>
              </div>

              {/* Row 2: Client Contacts (Optional) */}
              <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 space-y-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Client Contacts (Optional)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Contact Name (Optional)</label>
                    <Input
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      className="border-slate-300 text-slate-900 bg-white"
                      placeholder="e.g. Tanvir Rahman"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Contact Number (Optional)</label>
                    <Input
                      value={form.clientPhone}
                      onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                      className="border-slate-300 text-slate-900 bg-white font-mono"
                      placeholder="e.g. +8801712345678"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Campaign Type (Awareness, Message, Website) */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 block">Campaign Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'awareness', label: '📢 Awareness', desc: 'Brand reach & video views' },
                    { key: 'message', label: '💬 Message', desc: 'WhatsApp & Messenger ads' },
                    { key: 'website', label: '🌐 Website', desc: 'Pixel conversions & landing pages' }
                  ].map((ct) => (
                    <button
                      key={ct.key}
                      type="button"
                      onClick={() => setForm({ ...form, campaignType: ct.key as any })}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                        form.campaignType === ct.key
                          ? 'border-slate-900 bg-cyan-50 shadow-neoCyan'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <p className="font-bold text-slate-900 text-xs">{ct.label}</p>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">{ct.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Price / Budget, Paid, and Auto-calculated Due */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1 font-sans">Campaign Price (৳) *</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={form.totalAmount}
                    onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                    className="border-slate-300 text-slate-900 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1 font-sans">Paid Amount (৳)</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.paidAmount}
                    onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                    className="border-emerald-400 bg-emerald-50 text-emerald-800 font-mono text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1 font-sans">Due Amount (৳)</label>
                  <div className="h-10 flex items-center px-3 border border-slate-300 rounded-lg bg-white text-red-600 font-bold text-sm">
                    ৳{dueNum.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Row 5: Payment Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Payment Date</label>
                  <Input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    className="border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Campaign Notes (Optional)</label>
                  <Input
                    placeholder="e.g. Meta Ads ID #7781, Daily budget ৳1500"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="slate"
                  onClick={() => setIsModalOpen(false)}
                  className="border-2 border-slate-900 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cyan"
                  className="border-2 border-slate-900 shadow-neoSlate text-xs font-bold"
                >
                  {editingId ? 'Save Record Changes' : 'Record Ads Payment'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
