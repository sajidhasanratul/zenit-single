'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { 
  RefreshCw, Edit, Save, XCircle, Trash2, RotateCcw, PlusCircle,
  Settings, User, Phone, Mail, Award, CheckCircle2, ShieldAlert, Printer
} from 'lucide-react';

interface Order {
  id: string;
  projectId?: string;
  businessName?: string;
  fullName: string;
  phone: string;
  email: string;
  serviceId: string;
  serviceTitle: string;
  optionsSelected: {
    platform: string;
    customization: string;
    hosting: string;
    domain: string;
  };
  totalBDT: number;
  paidAmount?: number;
  dueAmount?: number;
  status: 'pending' | 'confirmed' | 'hold' | 'processing' | 'complete' | 'cancelled' | 'trash';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  trxId?: string;
  projectNote?: string;
  isDeleted?: boolean;
  orderedAt: string;
}

export default function AdminOrdersQueue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | ''>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Status Filter State
  const [activeTab, setActiveTab] = useState<string>('all');

  // Creation vs Edit State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  
  const [editForm, setEditForm] = useState({
    projectId: '',
    businessName: '',
    fullName: '',
    phone: '',
    email: '',
    serviceId: '',
    totalBDT: '0',
    paidAmount: '0',
    status: 'pending',
    paymentStatus: 'unpaid',
    trxId: '',
    projectNote: '',
    platform: 'Website',
    hosting: '',
    domain: ''
  });

  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setServices(data.services || []);
        setUserRole(data.role || 'manager');
      }
    } catch (err) {
      console.error('Failed to load stats details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStartCreate = () => {
    setEditingOrder(null);
    setIsCreateMode(true);
    // Pre-calculate the next logical project id serial number
    const projectNumber = 1001 + orders.length;
    setEditForm({
      projectId: `ZEN-${projectNumber}`,
      businessName: '',
      fullName: '',
      phone: '',
      email: '',
      serviceId: services[0]?.id || '',
      totalBDT: '0',
      paidAmount: '0',
      status: 'pending',
      paymentStatus: 'unpaid',
      trxId: '',
      projectNote: '',
      platform: 'Website',
      hosting: '',
      domain: ''
    });
    setAlertMsg({ text: 'Creating New Project Order', type: 'success' });
  };

  const handleStartEdit = (order: Order) => {
    setIsCreateMode(false);
    setEditingOrder(order);
    setEditForm({
      projectId: order.projectId || '',
      businessName: order.businessName || '',
      fullName: order.fullName,
      phone: order.phone,
      email: order.email,
      serviceId: order.serviceId,
      totalBDT: order.totalBDT.toString(),
      paidAmount: (order.paidAmount ?? 0).toString(),
      status: order.status,
      paymentStatus: order.paymentStatus || 'unpaid',
      trxId: order.trxId || '',
      projectNote: order.projectNote || '',
      platform: order.optionsSelected?.platform || 'Website',
      hosting: order.optionsSelected?.hosting || '',
      domain: order.optionsSelected?.domain || ''
    });
    setAlertMsg({ text: `Editing Project ID: ${order.projectId || order.id}`, type: 'success' });
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setIsCreateMode(false);
    setAlertMsg({ text: '', type: 'success' });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg({ text: '', type: 'success' });

    const total = Number(editForm.totalBDT) || 0;
    const paid = Number(editForm.paidAmount) || 0;
    let payStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
    
    if (paid >= total && total > 0) {
      payStatus = 'paid';
    } else if (paid > 0) {
      payStatus = 'partial';
    }

    const selectedServiceItem = services.find(s => s.id === editForm.serviceId);

    const payload = {
      projectId: editForm.projectId.trim(),
      businessName: editForm.businessName.trim(),
      fullName: editForm.fullName.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      serviceId: editForm.serviceId,
      serviceTitle: selectedServiceItem ? selectedServiceItem.title : 'Custom Project Service',
      totalBDT: total,
      paidAmount: paid,
      status: editForm.status,
      paymentStatus: payStatus,
      trxId: editForm.trxId.trim(),
      projectNote: editForm.projectNote.trim(),
      optionsSelected: {
        platform: editForm.platform,
        customization: isCreateMode ? 'customized' : (editingOrder?.optionsSelected?.customization || 'as_is'),
        hosting: editForm.hosting.trim(),
        domain: editForm.domain.trim()
      }
    };

    try {
      const url = isCreateMode ? '/api/orders' : `/api/orders/${editingOrder?.id}`;
      const method = isCreateMode ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAlertMsg({ 
          text: isCreateMode ? 'New Project Order successfully generated.' : 'Project details successfully updated.', 
          type: 'success' 
        });
        setEditingOrder(null);
        setIsCreateMode(false);
        fetchStats();
      } else {
        const errorData = await response.json();
        setAlertMsg({ text: errorData.error || 'Failed to submit form changes.', type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Network failure. Request aborted.', type: 'error' });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (userRole !== 'admin') {
      alert('🔒 Access Denied: Only Administrators are allowed to delete project orders.');
      return;
    }

    if (!confirm('Move this project order to the Trash container?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (response.ok) {
        setAlertMsg({ text: 'Order moved to Trash successfully.', type: 'success' });
        if (editingOrder?.id === orderId) handleCancelEdit();
        fetchStats();
      } else {
        const data = await response.json();
        alert(`Deletion error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to trash order:', err);
    }
  };

  const handleRestoreOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending', isDeleted: false })
      });
      if (response.ok) {
        setAlertMsg({ text: 'Order restored from Trash to Pending.', type: 'success' });
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to restore order:', err);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'trash') {
      return o.isDeleted === true || o.status === 'trash';
    } else {
      // Exclude deleted items from active lists
      if (o.isDeleted === true || o.status === 'trash') return false;
      if (activeTab === 'all') return true;
      return o.status === activeTab;
    }
  });

  const getTabCount = (tabName: string) => {
    if (tabName === 'trash') {
      return orders.filter(o => o.isDeleted === true || o.status === 'trash').length;
    }
    const activeNonDeleted = orders.filter(o => !(o.isDeleted === true || o.status === 'trash'));
    if (tabName === 'all') return activeNonDeleted.length;
    return activeNonDeleted.filter(o => o.status === tabName).length;
  };

  const tabs = [
    { key: 'all', label: 'All Projects' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'hold', label: 'Hold' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'trash', label: '🗑️ Trash' }
  ];

  const showEditor = editingOrder || isCreateMode;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Service Orders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: <span className="capitalize font-mono font-bold text-accentCyan bg-accentCyan/10 px-2 py-0.5 rounded border border-accentCyan/20">{userRole || 'manager'}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleStartCreate}
            variant="cyan"
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 shadow-neoSlate text-xs font-bold"
          >
            <PlusCircle size={14} />
            Create Service Order
          </Button>

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
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 select-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const count = getTabCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setEditingOrder(null);
                setIsCreateMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold font-display transition-all ${
                isActive 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoSlate' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {tab.label} <span className="opacity-70 text-[10px] ml-0.5 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Global alert banner */}
      {alertMsg.text && (
        <div className={`p-4 rounded-xl border-2 text-xs font-bold text-left animate-fadeIn ${
          alertMsg.type === 'success' 
            ? 'bg-green-50 border-green-600 text-green-700 shadow-neoGreen' 
            : 'bg-red-50 border-red-600 text-red-700 shadow-neoSlate'
        }`}>
          {alertMsg.text}
        </div>
      )}

      {/* Workspace Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table list column */}
        <div className={showEditor ? "lg:col-span-7" : "lg:col-span-12"}>
          <Card className="border-2 border-slate-900 bg-white">
            <div className="overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center font-bold">No orders found in this category.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-500 uppercase tracking-wider font-display font-bold">
                      <th className="py-3 px-2">Project ID</th>
                      <th className="py-3 px-2">Business Name</th>
                      <th className="py-3 px-2">Client Contacts</th>
                      <th className="py-3 px-2">Domain Name</th>
                      <th className="py-3 px-2">Price & Due</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 font-sans">
                        
                        {/* Project ID */}
                        <td className="py-4 px-2 font-mono font-black text-slate-900">
                          {o.projectId || 'N/A'}
                        </td>

                        {/* Business Name */}
                        <td className="py-4 px-2 font-bold text-slate-800">
                          {o.businessName || 'N/A'}
                        </td>

                        {/* Contacts details */}
                        <td className="py-4 px-2">
                          <p className="text-slate-900 font-bold font-display">{o.fullName}</p>
                          <p className="text-[10px] text-slate-500">{o.phone}</p>
                          <p className="text-[10px] text-accentCyan/80 font-mono font-semibold">{o.email}</p>
                        </td>

                        {/* Service / Domain details */}
                        <td className="py-4 px-2">
                          <p className="font-bold text-slate-800">{o.serviceTitle}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Domain: {o.optionsSelected?.domain || 'N/A'}</p>
                          <p className="text-[9px] text-slate-400 font-mono">Platform: {o.optionsSelected?.platform || 'Website'}</p>
                        </td>

                        {/* Payments total & due */}
                        <td className="py-4 px-2">
                          <p className="font-mono font-bold text-slate-800">Total: ৳{o.totalBDT.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Paid: ৳{(o.paidAmount ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-red-500 font-mono font-bold">
                            Due: ৳{(o.dueAmount ?? (o.totalBDT - (o.paidAmount ?? 0))).toLocaleString()}
                          </p>
                        </td>

                        {/* Status badges */}
                        <td className="py-4 px-2">
                          <span className={`inline-block border-2 border-slate-900 rounded text-[9px] font-display font-black uppercase px-2 py-0.5 ${
                            o.status === 'complete' 
                              ? 'bg-green-100 text-green-700'
                              : o.status === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : o.status === 'hold'
                              ? 'bg-orange-100 text-orange-700'
                              : o.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : o.status === 'cancelled' || o.status === 'trash'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-2 text-right space-x-1.5 shrink-0">
                          {activeTab === 'trash' ? (
                            <button
                              onClick={() => handleRestoreOrder(o.id)}
                              className="text-emerald-600 hover:text-emerald-800 border border-slate-200 bg-white hover:bg-emerald-50 p-1.5 rounded-lg transition-all"
                              title="Restore Order"
                            >
                              <RotateCcw size={13} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setPrintingOrder(o)}
                                className="text-cyan-700 hover:text-cyan-900 border-2 border-slate-900 bg-cyan-50 hover:bg-cyan-100 p-1.5 rounded-lg transition-all"
                                title="Print Invoice"
                              >
                                <Printer size={13} />
                              </button>
                              <button
                                onClick={() => handleStartEdit(o)}
                                className="text-slate-700 hover:text-slate-900 border-2 border-slate-900 bg-white hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                                title="Edit Details"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="text-red-500 hover:text-red-700 border-2 border-slate-900 bg-white hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                title="Delete Order"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Order Editor Card */}
        {showEditor && (
          <div className="lg:col-span-5 animate-slideIn">
            <Card className="border-2 border-slate-900 bg-white p-5 space-y-4 shadow-neoSlate" glow="cyan">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h4 className="text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Settings size={13} />
                  {isCreateMode ? '➕ Add New Project Order' : '⚙️ Proper Project Editor'}
                </h4>
                <button 
                  onClick={handleCancelEdit}
                  className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-bold"
                >
                  <XCircle size={13} />
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-bold text-slate-500">
                
                {/* ID & Business Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block">Project ID *</label>
                    <Input
                      required
                      placeholder="e.g. ZEN-1001"
                      value={editForm.projectId}
                      onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
                      className="border-slate-350 text-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block">Business Name</label>
                    <Input
                      placeholder="e.g. ZenIT Labs"
                      value={editForm.businessName}
                      onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                      className="border-slate-350 text-slate-900"
                    />
                  </div>
                </div>

                {/* Client Contacts */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <span className="text-[9px] uppercase tracking-wider block text-slate-400">Client Contacts</span>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider block text-slate-500">Full Name *</label>
                      <Input
                        required
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="border-slate-350 text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider block text-slate-500">Phone *</label>
                        <Input
                          required
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="border-slate-350 text-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider block text-slate-500">Email *</label>
                        <Input
                          required
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="border-slate-350 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Service */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <label className="text-[9px] uppercase tracking-wider block text-slate-400">Service Category *</label>
                  <select
                    value={editForm.serviceId}
                    onChange={(e) => setEditForm({ ...editForm, serviceId: e.target.value })}
                    className="w-full rounded border-2 border-slate-900 bg-white px-2 py-1.5 text-slate-900 font-sans text-xs focus:outline-none"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Platform, Hosting, Domain specs */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-bold">Configurations Specs</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block text-slate-500">Platform Choice</label>
                    <select
                      value={editForm.platform}
                      onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                      className="w-full rounded border-2 border-slate-900 bg-white px-2 py-1.5 text-slate-900 font-sans text-xs focus:outline-none"
                    >
                      <option value="Website">Website</option>
                      <option value="Website + Mobile App">Website + Mobile App</option>
                      <option value="Mobile App">Mobile App</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider block text-slate-500">Hosting Details</label>
                      <Input
                        placeholder="e.g. DigitalOcean VPS"
                        value={editForm.hosting}
                        onChange={(e) => setEditForm({ ...editForm, hosting: e.target.value })}
                        className="border-slate-350 text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider block text-slate-500">Domain Name</label>
                      <Input
                        placeholder="e.g. zenitpro.org"
                        value={editForm.domain}
                        onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                        className="border-slate-350 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Price & Partial Payment details */}
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block text-slate-500">Total Price (BDT)</label>
                    <Input
                      type="number"
                      value={editForm.totalBDT}
                      onChange={(e) => setEditForm({ ...editForm, totalBDT: e.target.value })}
                      className="border-slate-350 text-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block text-slate-500">Paid Amount (BDT)</label>
                    <Input
                      type="number"
                      value={editForm.paidAmount}
                      onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                      className="border-slate-350 text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Auto Calculated Due display */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
                  <span>Due Balance:</span>
                  <span className="text-red-600">
                    ৳{(Math.max(0, (Number(editForm.totalBDT) || 0) - (Number(editForm.paidAmount) || 0))).toLocaleString()}
                  </span>
                </div>

                {/* Project Status */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <label className="text-[9px] uppercase tracking-wider block text-slate-500">Project Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full rounded border-2 border-slate-900 bg-white px-2 py-1.5 text-slate-900 font-sans text-xs focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="hold">Hold</option>
                    <option value="processing">Processing</option>
                    <option value="complete">Complete</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Trx ID & Project note */}
                <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block text-slate-500">Trx ID / Payment Proof</label>
                    <Input
                      placeholder="BKash TrxID..."
                      value={editForm.trxId}
                      onChange={(e) => setEditForm({ ...editForm, trxId: e.target.value })}
                      className="border-slate-350 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider block text-slate-500">Project note / Required Suggestions</label>
                    <Textarea
                      placeholder="Enter customer suggestions or technical requirements..."
                      value={editForm.projectNote}
                      onChange={(e) => setEditForm({ ...editForm, projectNote: e.target.value })}
                      className="min-h-[70px] border-slate-350 text-slate-900 font-sans text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cyan"
                  className="w-full py-3.5 font-bold flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-neoSlate text-xs"
                >
                  <Save size={14} />
                  {isCreateMode ? 'Create Project Order' : 'Save Project Changes'}
                </Button>
              </form>
            </Card>
          </div>
        )}

      </div>

      {/* Printable Invoice Modal */}
      {printingOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-2xl w-full p-8 text-slate-900 my-8">
            <div id="printable-order-invoice" className="bg-white text-slate-900 p-2">
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
                    SERVICE INVOICE
                  </span>
                  <p className="text-sm font-mono font-bold mt-2 text-slate-900">
                    #{printingOrder.projectId || printingOrder.id}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: {new Date(printingOrder.orderedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
                <div>
                  <span className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Billed To:</span>
                  <p className="font-bold text-sm text-slate-900 mt-1">{printingOrder.fullName}</p>
                  {printingOrder.businessName && (
                    <p className="text-slate-600 font-medium">{printingOrder.businessName}</p>
                  )}
                  <p className="text-slate-500">{printingOrder.phone}</p>
                  <p className="text-slate-500">{printingOrder.email}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Order Specifications:</span>
                  <p className="text-slate-600 font-medium">Platform: <span className="font-bold">{printingOrder.optionsSelected?.platform || 'Website'}</span></p>
                  <p className="text-slate-600 font-medium">Domain: <span className="font-bold">{printingOrder.optionsSelected?.domain || 'N/A'}</span></p>
                  <p className="text-slate-600 font-medium">Status: <span className="capitalize font-bold">{printingOrder.status}</span></p>
                  <p className="text-slate-600 font-medium">Payment: <span className="capitalize font-bold">{printingOrder.paymentStatus || 'unpaid'}</span></p>
                </div>
              </div>

              {/* Table of items */}
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
                    <tr>
                      <td className="py-3">
                        <p className="font-bold text-slate-900">{printingOrder.serviceTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Platform: {printingOrder.optionsSelected?.platform || 'Website'} | Customization: {printingOrder.optionsSelected?.customization || 'Standard'}
                        </p>
                      </td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-mono">৳{printingOrder.totalBDT.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono font-bold">৳{printingOrder.totalBDT.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-start">
                <div className="text-xs text-slate-500 max-w-xs">
                  {printingOrder.trxId && (
                    <p className="font-mono text-slate-700">TrxID: <span className="font-bold">{printingOrder.trxId}</span></p>
                  )}
                  {printingOrder.projectNote && (
                    <p className="mt-1 italic">Note: {printingOrder.projectNote}</p>
                  )}
                  <p className="mt-3 text-[11px] text-slate-400">Payment terms: Full clearance upon deployment completion.</p>
                </div>
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-mono font-bold">৳{printingOrder.totalBDT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Paid Amount:</span>
                    <span className="font-mono font-bold text-emerald-600">৳{(printingOrder.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm font-bold bg-slate-50 p-2 rounded">
                    <span className="text-slate-900">Total Due:</span>
                    <span className="font-mono text-red-600">
                      ৳{(printingOrder.dueAmount ?? (printingOrder.totalBDT - (printingOrder.paidAmount || 0))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Thank you for choosing ZenIT Agency. We build high-speed digital engines that scale.
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 no-print">
              <Button
                variant="slate"
                onClick={() => setPrintingOrder(null)}
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
                Print Invoice
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
          #printable-order-invoice, #printable-order-invoice * {
            visibility: visible !important;
          }
          #printable-order-invoice {
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
