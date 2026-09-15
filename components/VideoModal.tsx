'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/card';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  if (!isOpen) return null;

  // Extracts YouTube Video ID for proper dynamic iframe embedding
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    } catch (err) {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-2xl border-2 border-slate-900 bg-white relative p-4 shadow-neoSlate">
        
        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 text-white bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 p-1.5 rounded-lg transition-all shadow-md"
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div className="text-left border-b border-slate-200 pb-2 mb-3">
          <h4 className="font-display font-black text-sm text-slate-900">Project Video Demonstration</h4>
          <p className="text-[10px] text-textMuted">{title}</p>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono">
              [No compatible embed URL provided: {videoUrl}]
            </div>
          )}
        </div>

      </Card>
    </div>
  );
}
