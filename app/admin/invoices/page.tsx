'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { 
  FileText, PlusCircle, RefreshCw, Printer, Edit, Trash2, 
  CheckCircle2, AlertCircle, XCircle, Search, DollarSign, Calendar
} from 'lucide-react';

interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  businessName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  issueDate: string;
  dueDate?: string;
  notes?: string;
  createdAt?: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | ''>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  // Form State
  const [form, setForm] = useState({
    invoiceNumber: '',
    clientName: '',
    businessName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    items: [
      { description: 'Next.js Custom Landing Page & CAPI Setup', qty: 1, unitPrice: 15000, total: 15000 }
    ],
    discount: 0,
    tax: 0,
    paidAmount: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Thank you for partnering with ZenIT Agency! Payment via bKash/Nagad/Bank Transfer.'
  });

  const fetchInvoices = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
      const statsRes = await fetch('/api/analytics/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setUserRole(statsData.role || 'manager');
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Calculated form amounts
  const formSubtotal = form.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.unitPrice || 0)), 0);
  const formTotal = Math.max(0, formSubtotal - Number(form.discount || 0) + Number(form.tax || 0));
  const formDue = Math.max(0, formTotal - Number(form.paidAmount || 0));

  const handleOpenCreate = () => {
    setEditingId(null);
    const nextInvNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setForm({
      invoiceNumber: nextInvNumber,
      clientName: '',
      businessName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      items: [
        { description: '', qty: 1, unitPrice: 0, total: 0 }
      ],
      discount: 0,
      tax: 0,
      paidAmount: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Thank you for partnering with ZenIT Agency!'
    });
    setIsEditorOpen(true);
    setAlertMsg({ text: '', type: 'success' });
  };

  const handleOpenEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      businessName: inv.businessName || '',
      clientPhone: inv.clientPhone || '',
      clientEmail: inv.clientEmail || '',
      clientAddress: inv.clientAddress || '',
      items: inv.items && inv.items.length > 0 ? inv.items : [{ description: '', qty: 1, unitPrice: 0, total: 0 }],
      discount: inv.discount || 0,
      tax: inv.tax || 0,
      paidAmount: inv.paidAmount || 0,
      issueDate: inv.issueDate || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate || '',
      notes: inv.notes || ''
    });
    setIsEditorOpen(true);
    setAlertMsg({ text: '', type: 'success' });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...form.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value
    };
    updated[index].total = Number(updated[index].qty || 0) * Number(updated[index].unitPrice || 0);
    setForm({ ...form, items: updated });
  };

  const handleAddItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { description: '', qty: 1, unitPrice: 0, total: 0 }]
    });
  };

  const handleRemoveItemRow = (index: number) => {
    if (form.items.length <= 1) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName) {
      setAlertMsg({ text: 'Client Name is required.', type: 'error' });
      return;
    }

    const payload = {
      invoiceNumber: form.invoiceNumber,
      clientName: form.clientName,
      businessName: form.businessName,
      clientPhone: form.clientPhone,
      clientEmail: form.clientEmail,
      clientAddress: form.clientAddress,
      items: form.items,
      subtotal: formSubtotal,
      discount: Number(form.discount) || 0,
      tax: Number(form.tax) || 0,
      totalAmount: formTotal,
      paidAmount: Number(form.paidAmount) || 0,
      dueAmount: formDue,
      status: Number(form.paidAmount) >= formTotal && formTotal > 0 ? 'paid' : Number(form.paidAmount) > 0 ? 'partial' : 'unpaid',
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      notes: form.notes
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/invoices/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setAlertMsg({ text: 'Invoice updated successfully!', type: 'success' });
          setIsEditorOpen(false);
          fetchInvoices();
        } else {
          const err = await res.json();
          setAlertMsg({ text: err.error || 'Failed to update invoice.', type: 'error' });
        }
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setAlertMsg({ text: 'New custom invoice created!', type: 'success' });
          setIsEditorOpen(false);
          fetchInvoices();
        } else {
          const err = await res.json();
          setAlertMsg({ text: err.error || 'Failed to create invoice.', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Save invoice failed:', err);
      setAlertMsg({ text: 'Network communication error.', type: 'error' });
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Access Denied: Only Administrators can delete invoices.');
      return;
    }
    if (!confirm('Are you sure you want to permanently delete this invoice?')) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInvoices();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete invoice.');
      }
    } catch (err) {
      console.error('Delete invoice failed:', err);
    }
  };

  // Filtered invoices
  const filtered = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.businessName && inv.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.clientPhone && inv.clientPhone.includes(searchTerm));
    
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalDue = invoices.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 flex items-center gap-2">
            <FileText className="text-accentCyan" size={26} />
            Client Invoicing System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, manage, and print customized official agency invoices for clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchInvoices}
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
            New Invoice
          </Button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Invoiced</p>
          <p className="text-xl font-black font-mono text-slate-900 mt-1">৳{totalInvoiced.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">{invoices.length} Invoices issued</span>
        </Card>

        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Collected</p>
          <p className="text-xl font-black font-mono text-emerald-600 mt-1">৳{totalPaid.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Paid balance</span>
        </Card>

        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding</p>
          <p className="text-xl font-black font-mono text-red-500 mt-1">৳{totalDue.toLocaleString()}</p>
          <span className="text-[10px] text-red-500 font-bold">Pending recovery</span>
        </Card>

        <Card className="p-4 border-2 border-slate-900 bg-white shadow-neoSlate">
          <p className="text-[10px] uppercase font-bold text-slate-400">Payment Health</p>
          <p className="text-xl font-black font-mono text-accentCyan mt-1">
            {totalInvoiced > 0 ? `${((totalPaid / totalInvoiced) * 100).toFixed(0)}%` : '100%'}
          </p>
          <span className="text-[10px] text-slate-400">Collection rate</span>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded-xl border-2 border-slate-900 shadow-neoSlate">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, client, business, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-accentCyan text-slate-900 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'paid', 'partial', 'unpaid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all border-2 ${
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

      {/* Alert banner */}
      {alertMsg.text && (
        <div className={`p-3 rounded-xl border-2 text-xs font-bold ${
          alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-500' : 'bg-red-50 text-red-800 border-red-500'
        }`}>
          {alertMsg.text}
        </div>
      )}

      {/* Invoices Table */}
      <Card className="border-2 border-slate-900 bg-white p-4 shadow-neoSlate overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
            Loading client invoices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold">
            No invoices found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Invoice #</th>
                  <th className="py-3 px-2">Client Details</th>
                  <th className="py-3 px-2">Items</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Paid / Due</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Issue Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    {/* Invoice number */}
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    {/* Client */}
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">{inv.clientName}</p>
                      {inv.businessName && <p className="text-[11px] text-slate-500">{inv.businessName}</p>}
                      {inv.clientPhone && <p className="text-[10px] text-slate-400 font-mono">{inv.clientPhone}</p>}
                    </td>

                    {/* Items */}
                    <td className="py-3 px-2">
                      <p className="font-medium text-slate-700">
                        {inv.items?.[0]?.description || 'Custom Order Item'}
                      </p>
                      {inv.items && inv.items.length > 1 && (
                        <span className="text-[9px] text-accentCyan font-bold">
                          +{inv.items.length - 1} more item(s)
                        </span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      ৳{Number(inv.totalAmount).toLocaleString()}
                    </td>

                    {/* Paid vs Due */}
                    <td className="py-3 px-2 font-mono text-[11px]">
                      <p className="text-emerald-600 font-bold">Paid: ৳{Number(inv.paidAmount).toLocaleString()}</p>
                      <p className="text-red-500 font-bold">Due: ৳{Number(inv.dueAmount).toLocaleString()}</p>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-2">
                      <span className={`inline-block border-2 border-slate-900 rounded text-[9px] font-black uppercase px-2 py-0.5 ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 text-slate-500 text-[11px] font-mono">
                      {inv.issueDate}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-2 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => setPrintingInvoice(inv)}
                        className="text-cyan-700 hover:text-cyan-900 border-2 border-slate-900 bg-cyan-50 hover:bg-cyan-100 p-1.5 rounded-lg transition-all"
                        title="Print Official A4 Invoice"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(inv)}
                        className="text-slate-700 hover:text-slate-900 border-2 border-slate-900 bg-white hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                        title="Edit Invoice"
                      >
                        <Edit size={13} />
                      </button>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="text-red-500 hover:text-red-700 border-2 border-slate-900 bg-white hover:bg-red-50 p-1.5 rounded-lg transition-all"
                          title="Delete Invoice"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Drawer Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-3xl w-full p-6 text-slate-900 my-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-black font-display text-slate-900 flex items-center gap-2">
                <FileText className="text-accentCyan" size={18} />
                {editingId ? 'Edit Client Invoice' : 'Create Custom Client Invoice'}
              </h3>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4 text-xs font-bold text-slate-600">
              
              {/* Row 1: Invoice # & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Invoice Number *</label>
                  <Input
                    required
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                    className="border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Issue Date</label>
                  <Input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="border-slate-300 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Customer Details */}
              <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 space-y-3">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Customer Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Client Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Tanvir Rahman"
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      className="border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Business Name</label>
                    <Input
                      placeholder="e.g. Apex Retail BD"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Contact Phone</label>
                    <Input
                      placeholder="e.g. +8801712345678"
                      value={form.clientPhone}
                      onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                      className="border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Contact Email</label>
                    <Input
                      type="email"
                      placeholder="e.g. client@domain.com"
                      value={form.clientEmail}
                      onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                      className="border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Billing Address</label>
                  <Input
                    placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                    value={form.clientAddress}
                    onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
                    className="border-slate-300 text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Product / Service Line Items Builder */}
              <div className="border border-slate-200 p-3 rounded-xl bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-accentCyan hover:text-cyan-700 text-xs font-bold flex items-center gap-1"
                  >
                    <PlusCircle size={13} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-grow">
                        <Input
                          placeholder="Service description (e.g. High-Speed Landing Page)"
                          value={item.description}
                          required
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="border-slate-300 text-slate-900 text-xs"
                        />
                      </div>
                      <div className="w-16">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          className="border-slate-300 text-slate-900 font-mono text-xs text-center"
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Price (৳)"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="border-slate-300 text-slate-900 font-mono text-xs text-right"
                        />
                      </div>
                      <div className="w-28 text-right font-mono font-bold text-slate-800 text-xs pr-1">
                        ৳{Number(item.qty * item.unitPrice).toLocaleString()}
                      </div>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Remove row"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Summary Calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Invoice Notes / Terms</label>
                  <Textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="border-slate-300 text-slate-900 text-xs font-medium"
                    placeholder="Enter payment notes, warranty terms, or bank accounts..."
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-bold text-slate-900">৳{formSubtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Discount (৳):</span>
                    <input
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: Number(e.target.value) || 0 })}
                      className="w-28 border border-slate-300 rounded px-2 py-0.5 text-right font-mono text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Tax / VAT (৳):</span>
                    <input
                      type="number"
                      min="0"
                      value={form.tax}
                      onChange={(e) => setForm({ ...form, tax: Number(e.target.value) || 0 })}
                      className="w-28 border border-slate-300 rounded px-2 py-0.5 text-right font-mono text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200 font-bold">
                    <span className="text-slate-900">Total Amount:</span>
                    <span className="text-slate-900 text-sm">৳{formTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-700">Paid Amount (৳):</span>
                    <input
                      type="number"
                      min="0"
                      value={form.paidAmount}
                      onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) || 0 })}
                      className="w-28 border border-emerald-400 bg-emerald-50 rounded px-2 py-0.5 text-right font-mono text-xs text-emerald-800 font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-200">
                    <span className="text-red-600">Balance Due:</span>
                    <span className="text-red-600 text-sm">৳{formDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="slate"
                  onClick={() => setIsEditorOpen(false)}
                  className="border-2 border-slate-900 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cyan"
                  className="border-2 border-slate-900 shadow-neoSlate text-xs font-bold"
                >
                  {editingId ? 'Save Invoice Changes' : 'Create & Save Invoice'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Official A4 Printable Invoice Modal */}
      {printingInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-2xl w-full p-8 text-slate-900 my-8">
            <div id="printable-custom-invoice" className="bg-white text-slate-900 p-2">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="ZenIT" className="w-8 h-8 object-contain" />
                    <h2 className="text-2xl font-black font-display tracking-wide">ZenIT Agency</h2>
                  </div>
                  <p className="text-xs text-slate-500">Dhaka, Bangladesh | WhatsApp: +880 1890-000000</p>
                  <p className="text-xs text-slate-500">Website: https://skcomart.com | Instagram: @zenplusit</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded">
                    INVOICE
                  </span>
                  <p className="text-sm font-mono font-bold mt-2 text-slate-900">
                    {printingInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: {printingInvoice.issueDate}
                  </p>
                  {printingInvoice.dueDate && (
                    <p className="text-xs text-slate-500">
                      Due Date: {printingInvoice.dueDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
                <div>
                  <span className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Invoice For:</span>
                  <p className="font-bold text-sm text-slate-900 mt-1">{printingInvoice.clientName}</p>
                  {printingInvoice.businessName && (
                    <p className="text-slate-600 font-medium">{printingInvoice.businessName}</p>
                  )}
                  {printingInvoice.clientPhone && <p className="text-slate-500">{printingInvoice.clientPhone}</p>}
                  {printingInvoice.clientEmail && <p className="text-slate-500">{printingInvoice.clientEmail}</p>}
                  {printingInvoice.clientAddress && <p className="text-slate-500">{printingInvoice.clientAddress}</p>}
                </div>
                <div className="text-right space-y-1">
                  <span className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Payment Status:</span>
                  <div>
                    <span className={`inline-block border-2 border-slate-900 rounded text-[10px] font-black uppercase px-2.5 py-0.5 mt-1 ${
                      printingInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : printingInvoice.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {printingInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-5">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {printingInvoice.items && printingInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 text-slate-900 font-medium">{it.description}</td>
                        <td className="py-3 text-center font-mono">{it.qty}</td>
                        <td className="py-3 text-right font-mono">৳{Number(it.unitPrice).toLocaleString()}</td>
                        <td className="py-3 text-right font-mono font-bold">৳{Number(it.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-start">
                <div className="text-xs text-slate-500 max-w-xs">
                  {printingInvoice.notes && (
                    <p className="italic text-slate-600">{printingInvoice.notes}</p>
                  )}
                  <p className="mt-3 text-[10px] text-slate-400">
                    Payment clearance: Please verify bank or bKash TrxID with our accounts representative.
                  </p>
                </div>

                <div className="w-64 space-y-1.5 text-xs text-right font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-bold">৳{Number(printingInvoice.subtotal).toLocaleString()}</span>
                  </div>
                  {printingInvoice.discount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                      <span>Discount:</span>
                      <span>-৳{Number(printingInvoice.discount).toLocaleString()}</span>
                    </div>
                  )}
                  {printingInvoice.tax > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Tax / VAT:</span>
                      <span>৳{Number(printingInvoice.tax).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-sm font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span>৳{Number(printingInvoice.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-600 font-bold">
                    <span>Paid Amount:</span>
                    <span>৳{Number(printingInvoice.paidAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm font-bold bg-slate-50 p-2 rounded text-red-600">
                    <span>Balance Due:</span>
                    <span>৳{Number(printingInvoice.dueAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Thank you for partnering with ZenIT Agency! Questions? Contact us at support@zenit.agency
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 no-print">
              <Button
                variant="slate"
                onClick={() => setPrintingInvoice(null)}
                className="border-2 border-slate-900 text-xs font-bold"
              >
                Close
              </Button>
              <Button
                variant="cyan"
                onClick={() => window.print()}
                className="border-2 border-slate-900 shadow-neoSlate text-xs font-bold flex items-center gap-1.5"
              >
                <Printer size={14} />
                Print A4 Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-custom-invoice, #printable-custom-invoice * {
            visibility: visible !important;
          }
          #printable-custom-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            z-index: 99999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
