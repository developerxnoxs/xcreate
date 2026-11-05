import React, { useState } from 'react';
import { Skeleton } from './Skeletons';
import { FileText, Copy, Check, Hash, Sparkles } from 'lucide-react';

interface MetadataCardProps {
  title: string;
  description: string;
  hashtags: string[];
  isLoading?: boolean;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ title, description, hashtags, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Judul: ${title}\n\nDeskripsi: ${description}\n\nTagar: ${hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-200 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="h-6 w-44 bg-slate-800 rounded-lg animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-slate-900 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-900 rounded-xl animate-pulse" />
          <div className="h-8 w-60 bg-slate-900 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-200 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Metadata Video & Publikasi
            </h3>
            <p className="text-[11px] text-slate-400">Siap untuk YouTube, TikTok, dan Instagram</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/30 transition-all font-bold flex items-center gap-1.5 cursor-pointer shadow"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Tersalin!' : 'Salin Semua'}</span>
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">Judul Konten</label>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-slate-100 font-semibold text-sm">
            {title}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">Sinopsis & Deskripsi</label>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-slate-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {description}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">Tagar Rekomendasi (Hashtags)</label>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-mono font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
