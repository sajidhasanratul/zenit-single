'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { 
  Layers, Edit, Trash2, XCircle, ListPlus, RefreshCw, UploadCloud 
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
  techBadges: string[];
  topBadges?: string[];
  subBadges?: string[];
  demoUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  priority?: number;
}

export default function AdminProductsServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  // Image upload states
  const [uploading, setUploading] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'web_dev',
    basePriceBDT: '',
    priority: '0',
    topBadges: 'Client Website, Premium',
    subBadges: 'Multi Vendor E Commerce, Multi-Category',
    demoUrl: 'https://skcomart.com',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    imageUrl: '',
    features: ''
  });

  const [panelMsg, setPanelMsg] = useState({ text: '', type: 'success' });

  const fetchServices = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPanelMsg({ text: 'Uploading photo to server...', type: 'success' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setServiceForm(prev => ({ ...prev, imageUrl: data.url }));
          setPanelMsg({ text: 'Mockup photo successfully uploaded.', type: 'success' });
        } else {
          setPanelMsg({ text: `Upload failed: ${data.error}`, type: 'error' });
        }
      } else {
        setPanelMsg({ text: 'Internal server error uploading image.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setPanelMsg({ text: 'Network failure uploading photo.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service product from the dynamic services page catalog?')) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (editingServiceId === id) handleCancelServiceEdit();
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  const handleTriggerServiceEdit = (item: ServiceItem) => {
    setEditingServiceId(item.id);
    setServiceForm({
      title: item.title,
      category: item.category,
      basePriceBDT: item.pricing.basePriceBDT.toString(),
      priority: (item.priority ?? 0).toString(),
      topBadges: (item.topBadges || []).join(', '),
      subBadges: (item.subBadges || []).join(', '),
      demoUrl: item.demoUrl || 'https://skcomart.com',
      videoUrl: item.videoUrl || '',
      imageUrl: item.imageUrl || '',
      features: item.featuresIncluded.join('\n')
    });
    setPanelMsg({ text: `Editing: "${item.title}" mode active.`, type: 'success' });
  };

  const handleCancelServiceEdit = () => {
    setEditingServiceId(null);
    setServiceForm({
      title: '',
      category: 'web_dev',
      basePriceBDT: '',
      priority: '0',
      topBadges: 'Client Website, Premium',
      subBadges: 'Multi Vendor E Commerce, Multi-Category',
      demoUrl: 'https://skcomart.com',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      imageUrl: '',
      features: ''
    });
    setPanelMsg({ text: '', type: 'success' });
  };

  const handleAddOrUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelMsg({ text: '', type: 'success' });

    const payload = {
      title: serviceForm.title,
      category: serviceForm.category.trim(),
      tagline: '',
      basePriceBDT: Number(serviceForm.basePriceBDT),
      pricing: {
        basePriceBDT: Number(serviceForm.basePriceBDT),
        billingType: 'one_time'
      },
      priority: Number(serviceForm.priority) || 0,
      deliveryTimeDays: 5,
      featuresIncluded: serviceForm.features.split('\n').filter(f => f.trim() !== ''),
      techBadges: serviceForm.subBadges.split(',').map(b => b.trim()).filter(b => b !== ''),
      topBadges: serviceForm.topBadges.split(',').map(b => b.trim()).filter(b => b !== ''),
      subBadges: serviceForm.subBadges.split(',').map(b => b.trim()).filter(b => b !== ''),
      demoUrl: serviceForm.demoUrl,
      videoUrl: serviceForm.videoUrl,
      imageUrl: serviceForm.imageUrl
    };

    const url = editingServiceId ? `/api/services/${editingServiceId}` : '/api/services';
    const method = editingServiceId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setPanelMsg({ 
          text: editingServiceId ? 'Service card specifications updated.' : 'Dynamic service card created successfully.', 
          type: 'success' 
        });
        handleCancelServiceEdit();
        fetchServices();
      }
    } catch (err) {
      setPanelMsg({ text: 'API error. Failed to save service.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="text-left text-xs font-bold text-slate-500 font-display">
        Loading catalog...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Products & Services
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your agency services catalog display and options.</p>
        </div>

        <Button
          onClick={fetchServices}
          disabled={refreshing}
          variant="slate"
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
          Refresh Catalog
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

      {/* Services Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Catalog List */}
        <div className="lg:col-span-7">
          <Card className="border-2 border-slate-900 bg-white space-y-4">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider border-b border-slate-200 pb-2">
              Active Products & Services Catalog items
            </h4>
            <div className="space-y-4 pr-1">
              {services.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-black text-sm text-slate-900">{item.title}</span>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[8px] font-mono text-slate-600 font-bold uppercase">
                        {item.category}
                      </span>
                      <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-mono font-bold">
                        Priority: {item.priority ?? 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{item.tagline}</p>
                    {item.imageUrl && (
                      <div className="flex items-center gap-2 pt-1">
                        <img 
                          src={item.imageUrl} 
                          alt="Thumbnail preview" 
                          className="w-10 h-10 border border-slate-300 rounded object-cover shadow-sm"
                        />
                        <span className="text-[9px] text-accentCyan font-mono font-bold">Image: {item.imageUrl}</span>
                      </div>
                    )}
                    {item.demoUrl && <p className="text-[10px] text-slate-400 font-mono">Demo: {item.demoUrl}</p>}
                    {item.videoUrl && <p className="text-[10px] text-purple-600 font-mono">Video: {item.videoUrl}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-3.5 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">Base price</span>
                      <p className="text-sm font-black text-accentGreen font-sans">৳{item.pricing.basePriceBDT.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTriggerServiceEdit(item)}
                        className="text-slate-700 hover:text-slate-900 border-2 border-slate-900 bg-white hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                        title="Edit Service details"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(item.id)}
                        className="text-red-500 hover:text-red-700 border-2 border-slate-900 bg-white hover:bg-red-50 p-1.5 rounded-lg transition-all"
                        title="Delete Service"
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
                {editingServiceId ? '⚙️ Edit Product / Service' : '➕ Add Product / Service'}
              </h4>
              {editingServiceId && (
                <button 
                  onClick={handleCancelServiceEdit}
                  className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-bold"
                >
                  <XCircle size={13} />
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateService} className="space-y-3.5 text-xs font-bold text-slate-500">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Title *</label>
                <Input
                  required
                  placeholder="e.g. SKCOMART Ecom"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Category Tab *</label>
                  <Input
                    required
                    placeholder="e.g. web_dev or pos_solution"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Base BDT *</label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 35000"
                    value={serviceForm.basePriceBDT}
                    onChange={(e) => setServiceForm({ ...serviceForm, basePriceBDT: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Priority (Higher=1st)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    value={serviceForm.priority}
                    onChange={(e) => setServiceForm({ ...serviceForm, priority: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Demo Web Link</label>
                  <Input
                    value={serviceForm.demoUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, demoUrl: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Photo from Device Section */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider block text-slate-500">Card Mockup Photo</label>
                <div className="flex items-center gap-3 mt-1.5">
                  {serviceForm.imageUrl ? (
                    <img 
                      src={serviceForm.imageUrl} 
                      alt="Uploaded preview" 
                      className="w-12 h-12 rounded border-2 border-slate-900 object-cover shadow-neoSlate shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded border-2 border-slate-900 bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-neoSlate">
                      <UploadCloud size={20} />
                    </div>
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="mockup-file-input"
                    />
                    <label
                      htmlFor="mockup-file-input"
                      className="flex items-center justify-center gap-1.5 border-2 border-slate-900 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg text-slate-800 text-[10px] font-bold cursor-pointer shadow-neoSlate transition-all w-full select-none"
                    >
                      {uploading ? 'Uploading Photo...' : serviceForm.imageUrl ? 'Change Photo from Device' : 'Select Photo from Device'}
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium font-sans truncate max-w-[200px]">
                      {serviceForm.imageUrl ? `Saved: ${serviceForm.imageUrl}` : 'No image uploaded'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">YouTube Video Link</label>
                <Input
                  value={serviceForm.videoUrl}
                  onChange={(e) => setServiceForm({ ...serviceForm, videoUrl: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Top Header Badges (csv)</label>
                  <Input
                    placeholder="e.g. Client Website, Premium"
                    value={serviceForm.topBadges}
                    onChange={(e) => setServiceForm({ ...serviceForm, topBadges: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Sub Badges (csv)</label>
                  <Input
                    placeholder="e.g. E-Commerce, Multi-Category"
                    value={serviceForm.subBadges}
                    onChange={(e) => setServiceForm({ ...serviceForm, subBadges: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Features checklist (Line breaks)</label>
                <Textarea
                  placeholder="Custom order checkout&#10;SSL Certificate installation"
                  value={serviceForm.features}
                  onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                  className="min-h-[80px] border-slate-350 text-slate-900"
                />
              </div>

              <Button
                type="submit"
                variant="cyan"
                className="w-full py-3.5 font-bold flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-neoSlate text-xs"
              >
                <ListPlus size={14} />
                {editingServiceId ? 'Update Product/Service' : 'Add Product/Service'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

    </div>
  );
}
