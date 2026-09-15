'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, Plus, Trash2, Edit, XCircle, 
  ExternalLink, UploadCloud, RefreshCw, Layers, CheckCircle2 
} from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  clientName: string;
  tagline: string;
  challenge?: string;
  solution?: string;
  demoUrl?: string;
  imageUrl?: string;
  techBadges: string[];
  metrics?: {
    label: string;
    before: string;
    after: string;
    lift: string;
  }[];
  priority?: number;
  createdAt?: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [panelMsg, setPanelMsg] = useState({ text: '', type: 'success' });

  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'web_dev',
    clientName: '',
    tagline: '',
    challenge: '',
    solution: '',
    demoUrl: '',
    imageUrl: '',
    techBadges: 'Next.js, Tailwind CSS, TypeScript',
    priority: '0'
  });

  const fetchProjects = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPanelMsg({ text: 'Uploading project screenshot...', type: 'success' });

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
          setProjectForm(prev => ({ ...prev, imageUrl: data.url }));
          setPanelMsg({ text: 'Project screenshot successfully uploaded.', type: 'success' });
        } else {
          setPanelMsg({ text: `Upload failed: ${data.error}`, type: 'error' });
        }
      } else {
        setPanelMsg({ text: 'Internal server error uploading image.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setPanelMsg({ text: 'Network failure uploading screenshot.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerEdit = (item: ProjectItem) => {
    setEditingProjectId(item.id);
    setProjectForm({
      title: item.title,
      category: item.category,
      clientName: item.clientName,
      tagline: item.tagline,
      challenge: item.challenge || '',
      solution: item.solution || '',
      demoUrl: item.demoUrl || '',
      imageUrl: item.imageUrl || '',
      techBadges: item.techBadges.join(', '),
      priority: (item.priority ?? 0).toString()
    });
    setPanelMsg({ text: `Editing: "${item.title}" mode active.`, type: 'success' });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      category: 'web_dev',
      clientName: '',
      tagline: '',
      challenge: '',
      solution: '',
      demoUrl: '',
      imageUrl: '',
      techBadges: 'Next.js, Tailwind CSS, TypeScript',
      priority: '0'
    });
    setPanelMsg({ text: '', type: 'success' });
  };

  const handleAddOrUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelMsg({ text: '', type: 'success' });

    const payload = {
      title: projectForm.title.trim(),
      category: projectForm.category.trim(),
      clientName: projectForm.clientName.trim(),
      tagline: projectForm.tagline.trim(),
      challenge: projectForm.challenge.trim(),
      solution: projectForm.solution.trim(),
      demoUrl: projectForm.demoUrl.trim(),
      imageUrl: projectForm.imageUrl.trim(),
      techBadges: projectForm.techBadges.split(',').map(b => b.trim()).filter(b => b !== ''),
      priority: Number(projectForm.priority) || 0
    };

    const url = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects';
    const method = editingProjectId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setPanelMsg({ 
          text: editingProjectId ? 'Project updated successfully.' : 'New project added to showcase.', 
          type: 'success' 
        });
        handleCancelEdit();
        fetchProjects();
      } else {
        const data = await response.json();
        setPanelMsg({ text: data.error || 'Failed to save project.', type: 'error' });
      }
    } catch (err: any) {
      setPanelMsg({ text: err.message || 'Network exception saving project.', type: 'error' });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project from the showcase?')) return;
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setPanelMsg({ text: 'Project deleted successfully.', type: 'success' });
        fetchProjects();
      } else {
        setPanelMsg({ text: 'Could not delete project.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setPanelMsg({ text: 'Failed to delete project.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-display font-medium">
        <span className="w-1.5 h-1.5 bg-accentCyan rounded-full inline-block animate-ping mr-2" />
        Loading Showcase Projects...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 border-slate-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-accentCyan/10 text-accentCyan border border-accentCyan/20 px-2 py-0.5 rounded">
              Portfolio Management
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              {projects.length} Total Projects
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight">
            Showcase Projects
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Upload new client case studies, manage live demo links, screenshots, and display priorities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-neoSlate hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {panelMsg.text && (
        <div className={`p-3 rounded-lg border-2 text-xs font-bold flex items-center gap-2 ${
          panelMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {panelMsg.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {panelMsg.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Projects List */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-2 border-slate-900 bg-white space-y-4 p-5" glow="slate">
            <h4 className="text-xs font-display font-black uppercase tracking-wider border-b border-slate-200 pb-2 text-slate-900">
              Live Showcase Projects ({projects.length})
            </h4>

            <div className="space-y-4 pr-1">
              {projects.map((item) => (
                <div key={item.id} className="border-2 border-slate-900 rounded-xl p-4 bg-slate-50/50 space-y-3 shadow-neoSmall">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-black text-sm text-slate-900">{item.title}</span>
                        <span className="bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-[8px] font-mono text-slate-700 font-bold uppercase">
                          {item.category}
                        </span>
                        <span className="bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-800 font-bold">
                          Client: {item.clientName}
                        </span>
                        <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-mono font-bold">
                          Priority: {item.priority ?? 0}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.tagline}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleTriggerEdit(item)}
                        className="text-slate-700 hover:text-slate-900 border-2 border-slate-900 bg-white hover:bg-slate-100 p-1.5 rounded-lg transition-all"
                        title="Edit Project"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(item.id)}
                        className="text-red-500 hover:text-red-700 border-2 border-slate-900 bg-white hover:bg-red-50 p-1.5 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail */}
                  {item.imageUrl && (
                    <div className="flex items-center gap-2.5 pt-1">
                      <img 
                        src={item.imageUrl} 
                        alt={`${item.title} preview`} 
                        className="w-16 h-12 border-2 border-slate-900 rounded-lg object-cover shadow-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{item.imageUrl}</span>
                    </div>
                  )}

                  {/* Demo Link & Tech Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-[10px]">
                    <div className="flex flex-wrap gap-1">
                      {item.techBadges.map((badge, bIdx) => (
                        <span key={bIdx} className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-700 font-bold">
                          {badge}
                        </span>
                      ))}
                    </div>

                    {item.demoUrl && (
                      <a 
                        href={item.demoUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-accentCyan hover:underline font-mono font-bold"
                      >
                        <ExternalLink size={11} />
                        View Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Add / Edit Form */}
        <div className="lg:col-span-5">
          <Card className="border-2 border-slate-900 bg-white p-5 space-y-4" glow="slate">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-xs font-display font-black uppercase tracking-wider text-slate-900">
                {editingProjectId ? '⚙️ Edit Project Details' : '➕ Upload New Project'}
              </h4>
              {editingProjectId && (
                <button 
                  onClick={handleCancelEdit}
                  className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-bold"
                >
                  <XCircle size={13} />
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateProject} className="space-y-3.5 text-xs font-bold text-slate-500 text-left">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Project Title *</label>
                <Input
                  required
                  placeholder="e.g. Apex Multi-Vendor E-Commerce"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Client Name *</label>
                  <Input
                    required
                    placeholder="e.g. Apex Retail BD"
                    value={projectForm.clientName}
                    onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Category Tab *</label>
                  <Input
                    required
                    placeholder="e.g. web_dev, meta_ads, ai_automation"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Tagline / Short Pitch *</label>
                <Input
                  required
                  placeholder="e.g. How speed optimization reduced cart bounce rates and scaled transactions."
                  value={projectForm.tagline}
                  onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Priority (Higher=1st)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 10 (higher first)"
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider block">Live Demo URL</label>
                  <Input
                    placeholder="https://example.com"
                    value={projectForm.demoUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                    className="border-slate-350 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Screenshot Photo */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider block text-slate-500">
                  Project Screenshot / Mockup Image
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  {projectForm.imageUrl ? (
                    <img 
                      src={projectForm.imageUrl} 
                      alt="Uploaded preview" 
                      className="w-14 h-12 rounded-lg border-2 border-slate-900 object-cover shadow-neoSmall shrink-0 bg-white" 
                    />
                  ) : (
                    <div className="w-14 h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0 bg-white">
                      <Briefcase size={16} />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 rounded-lg bg-white text-slate-900 text-[10px] font-bold shadow-neoSmall hover:bg-slate-100 transition-all">
                      <UploadCloud size={13} className="text-accentCyan" />
                      {uploading ? 'Uploading...' : 'Choose from Device'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    {projectForm.imageUrl && (
                      <button 
                        type="button" 
                        onClick={() => setProjectForm(prev => ({ ...prev, imageUrl: '' }))}
                        className="block text-[9px] text-red-500 hover:underline font-bold mt-0.5"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Tech Badges (Comma-separated)</label>
                <Input
                  placeholder="e.g. Next.js, Tailwind CSS, TypeScript, Vercel"
                  value={projectForm.techBadges}
                  onChange={(e) => setProjectForm({ ...projectForm, techBadges: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Challenge Faced (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Describe the client's problem..."
                  value={projectForm.challenge}
                  onChange={(e) => setProjectForm({ ...projectForm, challenge: e.target.value })}
                  className="w-full border-2 border-slate-900 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-accentCyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider block">Solution Delivered (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Describe the solution architecture..."
                  value={projectForm.solution}
                  onChange={(e) => setProjectForm({ ...projectForm, solution: e.target.value })}
                  className="w-full border-2 border-slate-900 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-accentCyan"
                />
              </div>

              <Button
                type="submit"
                variant="cyan"
                className="w-full border-2 border-slate-900 shadow-neoCyan font-display font-black text-xs py-2 mt-2"
              >
                {editingProjectId ? 'Save Changes' : 'Upload Showcase Project'}
              </Button>
            </form>
          </Card>
        </div>

      </div>

    </div>
  );
}
