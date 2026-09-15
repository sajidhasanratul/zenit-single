'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap, Sparkles, Filter, ExternalLink, Briefcase } from 'lucide-react';

interface ProjectItem {
  id: string;
  category: string;
  clientName: string;
  title: string;
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
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success && data.projects) {
          const sorted = [...data.projects].sort((a: ProjectItem, b: ProjectItem) => (b.priority ?? 0) - (a.priority ?? 0));
          setProjects(sorted);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const categories = Array.from(new Set(projects.map(p => p.category)));

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'All Projects';
    if (cat === 'web_dev') return 'Web Development';
    if (cat === 'meta_ads') return 'Meta Attributions';
    if (cat === 'ai_automation') return 'AI Automation';
    return cat
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(c => c.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-slate-900 flex items-center justify-center font-display font-medium">
        <span className="w-1.5 h-1.5 bg-accentCyan rounded-full inline-block animate-ping mr-2" />
        Syncing Showcase Projects...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-slate-900 py-16 px-6 space-y-12">
      
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-[10px] bg-accentCyan/10 border border-accentCyan/20 text-accentCyan px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
          Client Proof Portfolio
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight text-slate-900">
          Our Deployed <span className="text-accentCyan">Projects Showcase</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-bold">
          Explore actual project architectures verifying the impact of our Next.js speed builds, Meta Pixel Conversions API (CAPI) server pipelines, and automated business workflows.
        </p>
      </div>

      {/* Filter Menu */}
      <div className="max-w-4xl mx-auto flex flex-wrap gap-2.5 justify-center pb-4 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg border-2 transition-all ${
            filter === 'all'
              ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan'
              : 'bg-white border-slate-900 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-neoSmall'
          }`}
        >
          All Projects ({projects.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg border-2 transition-all ${
              filter === cat
                ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan'
                : 'bg-white border-slate-900 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-neoSmall'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="max-w-5xl mx-auto space-y-8 text-left">
        {filteredProjects.map((cs) => (
          <Card key={cs.id} className="border-2 border-slate-900 bg-white shadow-neoSlate p-6 md:p-8" glow="slate">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Context side */}
              <div className={`${cs.imageUrl || (cs.metrics && cs.metrics.length > 0) ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-accentCyan font-mono font-bold uppercase tracking-wider">
                      {cs.clientName}
                    </span>
                    <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[9px] font-mono text-slate-700 font-bold uppercase">
                      {getCategoryLabel(cs.category)}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 leading-tight">
                    {cs.title}
                  </h3>
                  <p className="text-xs text-accentGreen font-bold mt-1 leading-relaxed">
                    {cs.tagline}
                  </p>
                </div>

                {(cs.challenge || cs.solution) && (
                  <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 border border-slate-200 rounded-xl p-4">
                    {cs.challenge && (
                      <p><strong className="text-slate-900 font-bold">The Challenge:</strong> {cs.challenge}</p>
                    )}
                    {cs.solution && (
                      <p><strong className="text-slate-900 font-bold">The Solution:</strong> {cs.solution}</p>
                    )}
                  </div>
                )}

                {/* Tech badges & Demo link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {cs.techBadges.map((badge, i) => (
                      <span key={i} className="bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded-md text-[10px] font-mono text-slate-800 font-bold shadow-neoSmall">
                        {badge}
                      </span>
                    ))}
                  </div>

                  {cs.demoUrl && (
                    <a
                      href={cs.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-display font-black text-accentCyan hover:underline shrink-0"
                    >
                      <ExternalLink size={13} />
                      Live Project
                    </a>
                  )}
                </div>
              </div>

              {/* Media / Metrics side */}
              <div className="lg:col-span-5 space-y-4">
                {cs.imageUrl ? (
                  <div className="border-2 border-slate-900 rounded-xl overflow-hidden shadow-neoSlate bg-slate-100 group">
                    <img 
                      src={cs.imageUrl} 
                      alt={`${cs.title} Screenshot`} 
                      className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : null}

                {/* Metrics block side */}
                {cs.metrics && cs.metrics.length > 0 && (
                  <div className="bg-slate-900 border-2 border-slate-900 rounded-xl p-5 flex flex-col justify-center space-y-4 text-white shadow-neoSmall">
                    <h4 className="text-xs font-display font-bold text-white flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-800 pb-2">
                      <TrendingUp size={14} className="text-accentGreen" />
                      Key Performance Metrics
                    </h4>

                    <div className="space-y-3.5">
                      {cs.metrics.map((metric, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">{metric.label}</p>
                            <p className="font-semibold text-white font-sans">
                              {metric.before} &rarr; <span className="text-accentGreen font-bold">{metric.after}</span>
                            </p>
                          </div>
                          <span className="bg-accentGreen/20 border border-accentGreen/40 px-2 py-0.5 rounded text-[10px] font-bold text-accentGreen font-sans">
                            {metric.lift}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </Card>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm font-bold">
            No projects found in this category.
          </div>
        )}
      </div>

    </main>
  );
}
