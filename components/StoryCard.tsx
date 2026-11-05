import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Check, 
  Copy, 
  Download, 
  Radio, 
  Bot, 
  FileText, 
  Compass, 
  HeartHandshake,
  Layers
} from 'lucide-react';

interface StoryCardProps {
  story: string;
  isGenerating?: boolean;
  currentTime?: number;
  duration?: number;
  isAudioPlaying?: boolean;
  onSeek?: (time: number) => void;
}

interface ParsedSentence {
  text: string;
  charStart: number;
  charEnd: number;
  estStartTime: number;
  estEndTime: number;
  id: string;
}

interface ParsedParagraph {
  id: string;
  sentences: ParsedSentence[];
}

export const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  isGenerating = false,
  currentTime = 0,
  duration = 0,
  isAudioPlaying = false,
  onSeek
}) => {
  const [activeTab, setActiveTab] = useState<'narrative' | 'fullBible'>('narrative');
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Extract pure narration or full sections
  const narrationMatch = story.match(/6\.\s*Alur Lengkap(?:\s*:)?\s*([\s\S]*?)(?:7\.\s*Perjalanan Emosi Karakter Utama|$)/i);
  const narrativeOnlyText = narrationMatch && narrationMatch[1] ? narrationMatch[1].trim() : story;

  // Parse paragraphs and sentence segments with duration mapping
  const parsedParagraphs = React.useMemo(() => {
    const textToParse = activeTab === 'narrative' ? narrativeOnlyText : story;
    if (!textToParse) return [];
    
    const paragraphs = textToParse.split(/\n+/);
    let globalCharOffset = 0;
    const totalLength = textToParse.length || 1;
    const activeDuration = duration > 0 ? duration : 30;

    return paragraphs.map((parText, pIndex) => {
      if (!parText.trim()) return null;

      const rawSentences = parText.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+(?:\s+|$)/g) || [parText];

      const parsedSentences = rawSentences.map((s, sIndex) => {
        const start = globalCharOffset;
        const end = globalCharOffset + s.length;
        globalCharOffset = end;

        const exactIndexStart = textToParse.indexOf(s, Math.max(0, globalCharOffset - 120));
        let charStart = start;
        let charEnd = end;
        if (exactIndexStart !== -1) {
          charStart = exactIndexStart;
          charEnd = exactIndexStart + s.length;
          globalCharOffset = charEnd;
        }

        const estStartTime = (charStart / totalLength) * activeDuration;
        const estEndTime = (charEnd / totalLength) * activeDuration;

        return {
          text: s,
          charStart,
          charEnd,
          estStartTime,
          estEndTime,
          id: `p${pIndex}-s${sIndex}`
        };
      });

      return {
        id: `p-${pIndex}`,
        sentences: parsedSentences
      };
    }).filter((p): p is ParsedParagraph => p !== null);
  }, [narrativeOnlyText, story, duration, activeTab]);

  // Track active sentence ID on playback timeline change
  useEffect(() => {
    if (!duration || !currentTime || parsedParagraphs.length === 0) {
      setActiveSentenceId(null);
      return;
    }

    let foundId: string | null = null;
    for (const paragraph of parsedParagraphs) {
      for (const sentence of paragraph.sentences) {
        if (currentTime >= sentence.estStartTime && currentTime <= sentence.estEndTime) {
          foundId = sentence.id;
          break;
        }
      }
      if (foundId) break;
    }

    if (foundId) {
      setActiveSentenceId(foundId);
      if (autoScroll) {
        const element = document.getElementById(foundId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    }
  }, [currentTime, duration, autoScroll, parsedParagraphs]);

  const handleDownload = () => {
    const blob = new Blob([story], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'naskah_cerita_sains.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(story);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSentenceClick = (sentence: ParsedSentence) => {
    if (onSeek && duration > 0) {
      onSeek(sentence.estStartTime + 0.05);
    }
  };

  const isAudioActive = duration > 0;

  return (
    <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl relative transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-md shadow-indigo-500/10">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              Naskah Cerita Sains
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Eksplorasi konsep sains dengan visualisasi imajinatif dan narasi dialog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial text-xs px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 border border-slate-700 shadow cursor-pointer"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{isCopied ? 'Tersalin!' : 'Salin Naskah'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial text-xs px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh File</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher & Read-Along Assistant Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('narrative')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'narrative' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📖 Alur Sinematik & Read-Along
          </button>
          <button
            onClick={() => setActiveTab('fullBible')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'fullBible' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Dokumen Lengkap (Bible & Analisis)
          </button>
        </div>

        {/* Read along helper indicator */}
        {isAudioActive && activeTab === 'narrative' && (
          <div className="flex items-center gap-3 px-2 self-end sm:self-center">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Radio className={`h-3 w-3 text-cyan-400 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
              Karaoke Teks:
            </span>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                autoScroll 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Gulir Otomatis: {autoScroll ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Story Reader Box */}
      <div className="max-h-[55vh] overflow-y-auto custom-scrollbar pr-3 space-y-4 text-slate-300 leading-relaxed font-sans text-sm sm:text-base">
        {parsedParagraphs.map((par) => (
          <p key={par.id} className="leading-relaxed">
            {par.sentences.map((sentence) => {
              const isActive = sentence.id === activeSentenceId;
              
              if (isActive && isAudioActive && activeTab === 'narrative') {
                return (
                  <span
                    key={sentence.id}
                    id={sentence.id}
                    onClick={() => handleSentenceClick(sentence)}
                    className="inline cursor-pointer bg-amber-400/20 text-amber-200 border-b-2 border-amber-400 px-1 py-0.5 rounded transition-all duration-200 font-medium"
                    title="Klik untuk memutar penjelasan di detik ini"
                  >
                    <span className="inline-flex items-center justify-center bg-amber-400 text-slate-950 rounded text-[10px] px-1 py-0.2 mr-1 font-bold">
                      ▶
                    </span>
                    {sentence.text}
                  </span>
                );
              }

              return (
                <span
                  key={sentence.id}
                  id={sentence.id}
                  onClick={() => handleSentenceClick(sentence)}
                  className={`inline transition-all duration-200 ${
                    isAudioActive && activeTab === 'narrative'
                      ? 'cursor-pointer hover:text-white hover:bg-slate-800/60 rounded px-0.5' 
                      : ''
                  }`}
                  title={isAudioActive && activeTab === 'narrative' ? "Klik untuk memutar kalimat ini" : undefined}
                >
                  {sentence.text}
                </span>
              );
            })}
          </p>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold pt-3 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>AI sedang meracik naskah petualangan sains edukatif...</span>
          </div>
        )}
      </div>
    </div>
  );
};
