import React from 'react';
import { MediaSkeleton, AudioSkeleton } from './Skeletons';
import { 
  Palette, 
  Volume2, 
  Download, 
  RefreshCw, 
  Headphones, 
  Sparkles, 
  Image as ImageIcon,
  Play,
  Pause
} from 'lucide-react';

interface MediaCardProps {
  audioUrl: string | null;
  imageUrl: string | null;
  title?: string;
  onRegenerateAudio: () => void;
  onRegenerateImage: () => void;
  isRegeneratingAudio: boolean;
  isRegeneratingImage: boolean;
  isLoadingAudio?: boolean;
  isLoadingImage?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  onAudioTimeUpdate?: (time: number) => void;
  onAudioDurationChange?: (duration: number) => void;
  onAudioPlayStateChange?: (isPlaying: boolean) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  audioUrl, 
  imageUrl, 
  title,
  onRegenerateAudio, 
  onRegenerateImage,
  isRegeneratingAudio,
  isRegeneratingImage,
  isLoadingAudio = false,
  isLoadingImage = false,
  audioRef,
  onAudioTimeUpdate,
  onAudioDurationChange,
  onAudioPlayStateChange
}) => {
  const getSafeFilename = (prefix: string, ext: string) => {
    if (!title) return `cerita_sains_${prefix}.${ext}`;
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '_');
    return `${safeTitle}_${prefix}.${ext}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Image Section */}
      <div className="bg-[#0b0f19]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl flex flex-col justify-between backdrop-blur-xl group hover:border-purple-500/40 transition-all">
        <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Ilustrasi Karakter & Latar
              </h3>
              <p className="text-[11px] text-slate-400">Master visual acuan cerita</p>
            </div>
          </div>

          <button
            onClick={onRegenerateImage}
            disabled={isRegeneratingImage || isLoadingImage}
            className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isRegeneratingImage || isLoadingImage ? 'animate-spin' : ''}`} />
            <span>{isRegeneratingImage ? 'Membuat...' : 'Buat Ulang'}</span>
          </button>
        </div>
        
        {isRegeneratingImage || isLoadingImage ? (
          <div className="w-full aspect-square flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800">
            <MediaSkeleton />
          </div>
        ) : imageUrl ? (
          <div className="relative group/img w-full aspect-square overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <img 
              src={imageUrl} 
              alt="Generated Illustration" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
            />
            
            {/* Luminous Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-4">
              <span className="text-xs text-slate-200 font-medium">Resolusi Penuh (Master)</span>
              <a 
                href={imageUrl} 
                download={getSafeFilename('ilustrasi', 'png')}
                className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3.5 py-1.5 rounded-xl shadow-lg transition-all font-bold flex items-center gap-1.5 text-xs border border-white/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh PNG</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-square bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
            <ImageIcon className="h-8 w-8 text-slate-600" />
            <span className="text-xs">Ilustrasi belum tersedia</span>
          </div>
        )}
      </div>

      {/* 2. Audio Section */}
      <div className="bg-[#0b0f19]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl flex flex-col justify-between backdrop-blur-xl group hover:border-cyan-500/40 transition-all">
        <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Audio Suara Narator & Dialog
              </h3>
              <p className="text-[11px] text-slate-400">Suara sintetis studio Gemini</p>
            </div>
          </div>

          <button
            onClick={onRegenerateAudio}
            disabled={isRegeneratingAudio || isLoadingAudio}
            className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white rounded-xl border border-cyan-500/30 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isRegeneratingAudio || isLoadingAudio ? 'animate-spin' : ''}`} />
            <span>{isRegeneratingAudio ? 'Menyintesis...' : 'Buat Ulang'}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center bg-slate-950/70 rounded-2xl p-6 w-full border border-slate-800/80">
          {isRegeneratingAudio || isLoadingAudio ? (
             <AudioSkeleton />
          ) : audioUrl ? (
            <div className="w-full space-y-5">
              {/* Animated Headphones Visual Icon with Audio Bars */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="h-16 w-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10 mb-3">
                  <Headphones className="h-8 w-8" />
                </div>
                {/* Micro Audio Equalizer Waveform */}
                <div className="flex items-center gap-1 h-5">
                  {[40, 75, 55, 90, 60, 100, 45, 80, 50, 95, 30].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-full animate-music-bar"
                      style={{ animationDelay: `${i * 0.08}s`, height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* HTML Audio Player with sleek dark styling */}
              <audio 
                ref={audioRef}
                controls 
                className="w-full accent-cyan-400 opacity-90 hover:opacity-100 transition-opacity" 
                src={audioUrl}
                onPlay={() => onAudioPlayStateChange?.(true)}
                onPause={() => onAudioPlayStateChange?.(false)}
                onTimeUpdate={(e) => onAudioTimeUpdate?.(e.currentTarget.currentTime)}
                onDurationChange={(e) => onAudioDurationChange?.(e.currentTarget.duration)}
              >
                Browser Anda tidak mendukung elemen audio.
              </audio>

              <div className="flex justify-center pt-2">
                <a 
                  href={audioUrl} 
                  download={getSafeFilename('audio', 'wav')}
                  className="text-xs px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl transition-all font-bold flex items-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Audio Suara (.WAV)</span>
                </a>
              </div>
            </div>
          ) : (
             <div className="text-center text-slate-500 text-xs py-8">
               Audio narasi belum tersedia.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};