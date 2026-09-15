'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  features: string[];
}

export default function ServiceDetailModal({ isOpen, onClose, title, features }: ServiceDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-md border-2 border-slate-900 bg-white relative p-6 shadow-neoSlate">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 p-1.5 rounded-lg transition-all"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-200 pb-3 mb-4 text-left">
          <h3 className="font-display font-black text-lg text-slate-900">Included Features</h3>
          <p className="text-xs text-textMuted mt-0.5">{title}</p>
        </div>

        {/* Features Checklist */}
        <ul className="space-y-3.5 text-xs text-slate-700 text-left max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
              <span className="p-0.5 bg-accentGreen/10 border border-accentGreen/20 text-accentGreen rounded mt-0.5 shrink-0">
                <Check size={12} className="stroke-[3]" />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Close CTA */}
        <div className="pt-6 mt-4 border-t border-slate-200">
          <Button onClick={onClose} variant="slate" className="w-full py-2.5 text-xs font-bold">
            Close Specification Sheet
          </Button>
        </div>

      </Card>
    </div>
  );
}
