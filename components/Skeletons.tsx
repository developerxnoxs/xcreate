import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mic, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const StorySkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-orange-100 space-y-4">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <FileText className="w-6 h-6 text-orange-400 animate-pulse" />
        </div>
        <div className="h-8 w-48 bg-orange-100 rounded animate-pulse" />
      </div>
      <div className="h-8 w-32 bg-orange-50 rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="h-4" /> {/* Spacer */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="h-4" /> {/* Spacer */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
);

export const MediaSkeleton: React.FC = () => (
  <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-purple-400">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="p-4 bg-white/50 rounded-full backdrop-blur-sm shadow-sm"
      >
        <ImageIcon className="w-10 h-10" />
      </motion.div>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium animate-pulse">Generating visual magic...</span>
      </div>
    </div>
  </div>
);

export const AudioSkeleton: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-48 bg-blue-50 rounded-xl border border-blue-100 p-6 gap-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-100/50 to-blue-50 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
    <motion.div 
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="p-4 bg-white/60 rounded-full backdrop-blur-sm shadow-sm relative z-10 text-blue-500"
    >
      <Mic className="w-8 h-8" />
    </motion.div>
    <div className="flex items-center gap-1 h-8 relative z-10">
      {[...Array(5)].map((_, i) => (
        <motion.div 
          key={i} 
          className="w-2 bg-blue-400 rounded-full"
          animate={{ height: ['20%', '100%', '20%'] }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
    <span className="text-blue-500 text-sm font-medium animate-pulse relative z-10">Synthesizing voice...</span>
  </div>
);

export const ListSkeleton: React.FC<{ rows?: number; color?: string; message?: string }> = ({ rows = 3, color = "slate", message }) => (
  <div className="space-y-4 relative">
    {message && (
      <div className={`absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl border border-${color}-500/30`}>
        <div className={`flex flex-col items-center gap-3 text-${color}-400`}>
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-medium animate-pulse">{message}</span>
        </div>
      </div>
    )}
    {[...Array(rows)].map((_, i) => (
      <div key={i} className={`bg-black/20 rounded-xl p-4 border border-${color}-700/30 space-y-2`}>
        <div className="flex justify-between w-full">
          <div className={`h-4 w-24 bg-${color}-500/20 rounded animate-pulse`} />
          <div className={`h-6 w-16 bg-${color}-500/10 rounded animate-pulse`} />
        </div>
        <div className={`h-3 w-full bg-${color}-400/10 rounded animate-pulse`} />
        <div className={`h-3 w-3/4 bg-${color}-400/10 rounded animate-pulse`} />
      </div>
    ))}
  </div>
);
