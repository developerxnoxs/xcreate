import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScenePrompt } from '../types';
import { ListSkeleton } from './Skeletons';
import { generateVideoFromPrompt } from '../services/geminiService';
import { 
  Film, 
  Video, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Loader2, 
  AlertCircle, 
  Clapperboard, 
  Camera, 
  MessageSquare,
  Wand2,
  RefreshCw
} from 'lucide-react';

interface VideoPromptCardProps {
  scenes: ScenePrompt[];
  isLoading?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  aspectRatio?: string;
  illustrationUrl?: string | null;
  audioUrl?: string | null;
}

export const VideoPromptCard: React.FC<VideoPromptCardProps> = ({ 
  scenes, 
  isLoading = false,
  onRegenerate,
  isRegenerating = false,
  aspectRatio = "16:9",
  illustrationUrl,
  audioUrl
}) => {
  const [generatingVideoId, setGeneratingVideoId] = useState<number | null>(null);
  const [renderingSceneId, setRenderingSceneId] = useState<number | null>(null);
  const [renderProgress, setRenderProgress] = useState<Record<number, number>>({});
  const [generatedVideos, setGeneratedVideos] = useState<Record<number, string>>({});
  const [videoErrors, setVideoErrors] = useState<Record<number, string>>({});
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [copiedJsonId, setCopiedJsonId] = useState<number | null>(null);

  // Hidden offscreen canvas for instant in-browser scene video rendering
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. AI Video Generation with Veo 2.0
  const handleGenerateVideoAI = async (scene: ScenePrompt) => {

    setGeneratingVideoId(scene.scene_id);
    setVideoErrors(prev => ({ ...prev, [scene.scene_id]: '' }));

    try {
      const videoUrl = await generateVideoFromPrompt(scene.video_prompt, aspectRatio);
      if (videoUrl) {
        setGeneratedVideos(prev => ({ ...prev, [scene.scene_id]: videoUrl }));
      }
    } catch (error: any) {
      console.error("Error generating video with Veo:", error);
      setVideoErrors(prev => ({ ...prev, [scene.scene_id]: error.message || "Gagal membuat video." }));
    } finally {
      setGeneratingVideoId(null);
    }
  };

  // 2. Instant In-Browser Scene Video Renderer (Guaranteed to work 100% without external API key quota)
  const handleRenderSceneInstant = async (scene: ScenePrompt) => {
    setRenderingSceneId(scene.scene_id);
    setVideoErrors(prev => ({ ...prev, [scene.scene_id]: '' }));
    setRenderProgress(prev => ({ ...prev, [scene.scene_id]: 0 }));

    try {
      let canvas = hiddenCanvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        hiddenCanvasRef.current = canvas;
      }

      // Aspect ratio dimensions
      const isPortrait = aspectRatio === "9:16";
      const width = isPortrait ? 720 : 1280;
      const height = isPortrait ? 1280 : 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Gagal menginisialisasi kanvas.");

      // Pre-load illustration image
      let img: HTMLImageElement | null = null;
      if (illustrationUrl) {
        img = new Image();
        img.crossOrigin = "anonymous";
        img.src = illustrationUrl;
        await new Promise<void>((resolve) => {
          img!.onload = () => resolve();
          img!.onerror = () => resolve(); // continue even if image fails
        });
      }

      // Prepare canvas stream & MediaRecorder
      const stream = canvas.captureStream(30);
      let selectedMime = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(selectedMime)) selectedMime = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(selectedMime)) selectedMime = 'video/webm';
      if (!MediaRecorder.isTypeSupported(selectedMime)) selectedMime = 'video/mp4';

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime || undefined,
        videoBitsPerSecond: 2500000
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const videoPromise = new Promise<string>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
          const url = URL.createObjectURL(blob);
          resolve(url);
        };
      });

      recorder.start(200);

      // Render 10 seconds of cinematic scene action at 30 fps
      const totalSeconds = 10;
      const totalFrames = totalSeconds * 30; // 300 frames
      const cameraType = (scene.camera?.angle || '').toLowerCase();

      for (let f = 0; f < totalFrames; f++) {
        const time = f / 30;
        const progress = f / totalFrames;

        // Reset
        ctx.fillStyle = '#070a14';
        ctx.fillRect(0, 0, width, height);

        // Camera movement transform
        ctx.save();
        let zoom = 1.03;
        let panX = 0;
        let panY = 0;

        if (cameraType.includes('dolly in') || cameraType.includes('zoom in')) {
          zoom = 1.02 + progress * 0.15;
        } else if (cameraType.includes('dolly out') || cameraType.includes('zoom out')) {
          zoom = 1.15 - progress * 0.12;
        } else if (cameraType.includes('pan right') || cameraType.includes('tracking')) {
          zoom = 1.08;
          panX = -40 + progress * 80;
        } else if (cameraType.includes('pan left')) {
          zoom = 1.08;
          panX = 40 - progress * 80;
        } else {
          zoom = 1.04 + Math.sin(progress * Math.PI) * 0.08;
          panX = Math.cos(progress * Math.PI * 0.7) * 15;
        }

        ctx.translate(width / 2 + panX, height / 2 + panY);
        ctx.scale(zoom, zoom);

        if (img && img.width > 0) {
          const scale = Math.max(width / img.width, height / img.height);
          ctx.drawImage(img, - (img.width * scale) / 2, - (img.height * scale) / 2, img.width * scale, img.height * scale);
        } else {
          const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, width);
          grad.addColorStop(0, '#312e81');
          grad.addColorStop(1, '#070a14');
          ctx.fillStyle = grad;
          ctx.fillRect(-width / 2, -height / 2, width, height);
        }
        ctx.restore();

        // Cinematic Dark Vignette
        const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.8);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(5,8,16,0.65)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);

        // Floating science particles
        ctx.save();
        for (let p = 0; p < 22; p++) {
          const px = (p * 233 + Math.sin(time + p) * 35) % width;
          const py = (height + 50 - (time * 30 * (0.6 + (p % 3) * 0.3))) % (height + 60);
          ctx.beginPath();
          ctx.arc(px, py, 1.8 + (p % 3), 0, Math.PI * 2);
          ctx.fillStyle = p % 2 === 0 ? 'rgba(34, 211, 238, 0.45)' : 'rgba(168, 85, 247, 0.45)';
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
          ctx.fill();
        }
        ctx.restore();

        // Top Scene Info Pill
        ctx.save();
        ctx.font = 'bold 15px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#818cf8';
        ctx.fillText(`ADEGAN ${scene.scene_id} • ${scene.camera?.angle || 'CINEMATIC SHOT'}`, 40, 45);

        // Subtitles Overlay
        if (scene.dialog) {
          const fontSize = width > 1000 ? 24 : 18;
          ctx.font = `600 ${fontSize}px "Outfit", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const maxW = width - 120;
          const words = scene.dialog.split(' ');
          const lines = [];
          let curLine = '';
          for (let w = 0; w < words.length; w++) {
            const test = curLine + words[w] + ' ';
            if (ctx.measureText(test).width > maxW && w > 0) {
              lines.push(curLine.trim());
              curLine = words[w] + ' ';
            } else {
              curLine = test;
            }
          }
          lines.push(curLine.trim());

          const rowH = fontSize * 1.4;
          const pillH = lines.length * rowH + 28;
          const pillY = height - pillH - 40;

          ctx.fillStyle = 'rgba(9, 13, 24, 0.88)';
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(40, pillY, width - 80, pillH, 16);
          else ctx.rect(40, pillY, width - 80, pillH);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          lines.forEach((l, idx) => {
            ctx.fillText(l, width / 2, pillY + 14 + (idx * rowH) + (rowH / 2));
          });
        }
        ctx.restore();

        // Update progress state every 15 frames
        if (f % 15 === 0) {
          const pct = Math.round((f / totalFrames) * 100);
          setRenderProgress(prev => ({ ...prev, [scene.scene_id]: pct }));
          // Give browser event loop a breath
          await new Promise(r => setTimeout(r, 10));
        }
      }

      recorder.stop();
      const outputUrl = await videoPromise;
      setGeneratedVideos(prev => ({ ...prev, [scene.scene_id]: outputUrl }));
      setRenderProgress(prev => ({ ...prev, [scene.scene_id]: 100 }));

    } catch (err: any) {
      console.error("Scene render error:", err);
      setVideoErrors(prev => ({ ...prev, [scene.scene_id]: err.message || "Gagal me-render video adegan." }));
    } finally {
      setRenderingSceneId(null);
    }
  };

  const handleCopyPrompt = (scene: ScenePrompt) => {
    navigator.clipboard.writeText(scene.video_prompt);
    setCopiedPromptId(scene.scene_id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleCopyJson = (scene: ScenePrompt) => {
    const text = JSON.stringify(scene, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedJsonId(scene.scene_id);
    setTimeout(() => setCopiedJsonId(null), 2000);
  };

  const parseDialog = (dialog: string) => {
    if (!dialog) return [];
    const lines = dialog.split('\n').filter(l => l.trim().length > 0);
    const parsed = [];
    let currentCharacterNum = 1;
    const characterMap: Record<string, number> = {};

    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        let speaker = match[1].trim();
        let text = match[2].trim();
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.substring(1, text.length - 1);
        }
        
        let charNum = 0;
        const lowerSpeaker = speaker.toLowerCase();
        if (lowerSpeaker.includes('narator') || lowerSpeaker.includes('narrator')) {
          charNum = 0;
        } else {
          if (!characterMap[speaker]) {
             characterMap[speaker] = currentCharacterNum;
             currentCharacterNum = currentCharacterNum === 1 ? 2 : 1; 
          }
          charNum = characterMap[speaker];
        }

        parsed.push({ speaker, text, characterNumber: charNum, isNarrator: charNum === 0 });
      } else {
        let text = line.trim();
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.substring(1, text.length - 1);
        }
        parsed.push({ speaker: 'Suara Karakter', text, characterNumber: 1, isNarrator: false });
      }
    }
    return parsed;
  };

  return (
    <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-200 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider text-[11px] px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <Clapperboard className="h-3.5 w-3.5" />
            Storyboard & Video Prompt Per Adegan
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-white flex items-center gap-2.5">
            <span>🎬</span> Pengarah Sinematik Adegan
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Setiap adegan 10 detik dirancang dengan sudut kamera, gerakan aksi karakter, dan dialog sinkron untuk generator video AI.
          </p>
        </div>

        {onRegenerate && !isLoading && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 border border-indigo-500/30 disabled:opacity-50 cursor-pointer shadow-sm"
            title="Susun ulang storyboard video"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Menyusun Ulang..." : "Susun Ulang Prompt"}
          </button>
        )}
      </div>
      
      {isLoading ? (
        <ListSkeleton color="green" message="Menyusun Storyboard Adegan & Prompt Video Sinematik..." />
      ) : (
        <motion.div 
          className="space-y-6 max-h-[900px] overflow-y-auto custom-scrollbar pr-2"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <AnimatePresence>
            {scenes.length > 0 ? scenes.map((scene, index) => (
              <React.Fragment key={index}>
                {index > 0 && scenes[index - 1].transition && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center -my-2 relative z-10"
                  >
                    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-indigo-200 text-[11px] font-bold font-mono px-3.5 py-1 rounded-full shadow-lg border border-indigo-500/30 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      Transisi: {scenes[index - 1].transition}
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-md group"
                >
                  {/* Top Bar of Scene */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-indigo-600/30 text-indigo-300 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30">
                        Adegan {scene.scene_id}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Camera className="h-3.5 w-3.5 text-cyan-400" />
                        {scene.camera?.angle || 'Kamera Dinamis'} ({scene.duration || 10} detik)
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* 1. Instant In-Browser Scene Video Renderer */}
                      <button
                        onClick={() => handleRenderSceneInstant(scene)}
                        disabled={renderingSceneId === scene.scene_id}
                        className="text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                        title="Buat video animasi bergerak adegan ini langsung di browsermu tanpa kuota API!"
                      >
                        {renderingSceneId === scene.scene_id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Merender ({renderProgress[scene.scene_id] || 0}%)...</span>
                          </>
                        ) : (
                          <>
                            <Video className="h-3.5 w-3.5" />
                            <span>Render Video Adegan</span>
                          </>
                        )}
                      </button>

                      {/* 2. AI Video Generation with Veo */}
                      {scene.video_prompt && (
                        <button
                          onClick={() => handleGenerateVideoAI(scene)}
                          disabled={generatingVideoId === scene.scene_id}
                          className="text-xs bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          title="Generate Video AI dengan Google Veo 2.0"
                        >
                          {generatingVideoId === scene.scene_id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                              <span>AI Generating...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-3.5 w-3.5 text-purple-400" />
                              <span>AI Veo 2.0</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* 3. Copy Video Prompt */}
                      {scene.video_prompt && (
                        <button
                          onClick={() => handleCopyPrompt(scene)}
                          className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                          title="Salin Master Video Prompt untuk Runway/Luma/Veo"
                        >
                          {copiedPromptId === scene.scene_id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedPromptId === scene.scene_id ? 'Tersalin!' : 'Salin Prompt'}</span>
                        </button>
                      )}

                      {/* 4. Copy JSON */}
                      <button
                        onClick={() => handleCopyJson(scene)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-slate-800 cursor-pointer"
                        title="Salin data JSON lengkap adegan"
                      >
                        {copiedJsonId === scene.scene_id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Dialog Speech Bubbles */}
                  {scene.dialog && (
                    <div className="mb-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 mb-2.5 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-indigo-400" />
                        Percakapan & Narasi Sains
                      </p>
                      <div className="space-y-2.5">
                        {parseDialog(scene.dialog).map((line, i) => (
                          <div key={i} className={`flex ${line.isNarrator ? 'justify-center' : (line.characterNumber === 1 ? 'justify-start' : 'justify-end')} w-full`}>
                            <div className={`max-w-[95%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                              line.isNarrator 
                                ? 'bg-slate-800/70 text-slate-300 text-center italic rounded-lg border border-slate-700' 
                                : (line.characterNumber === 1 
                                    ? 'bg-indigo-950/60 text-indigo-100 border border-indigo-500/30 rounded-bl-none' 
                                    : 'bg-emerald-950/60 text-emerald-100 border border-emerald-500/30 rounded-br-none')
                            }`}>
                              {!line.isNarrator && (
                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${line.characterNumber === 1 ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                  {line.speaker}
                                </div>
                              )}
                              <p className="leading-relaxed">{line.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Errors display with helpful guidance */}
                  {videoErrors[scene.scene_id] && (
                    <div className="mb-4 p-3.5 bg-amber-950/40 text-amber-200 rounded-xl border border-amber-500/30 text-xs flex items-start gap-2.5 leading-relaxed">
                      <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p>{videoErrors[scene.scene_id]}</p>
                        <button
                          onClick={() => handleRenderSceneInstant(scene)}
                          className="mt-2 text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Video className="h-3 w-3" />
                          Klik Di Sini Untuk Render Video Adegan (Instan)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Generated Video Player */}
                  {generatedVideos[scene.scene_id] && (
                    <div className="mb-4 p-3.5 bg-slate-900 rounded-xl border border-indigo-500/30 animate-fade-in-up">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Film className="h-3.5 w-3.5 text-cyan-400" />
                          Hasil Video Adegan {scene.scene_id}:
                        </p>
                        <a 
                          href={generatedVideos[scene.scene_id]} 
                          download={`adegan_${scene.scene_id}_video.webm`}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Unduh Video
                        </a>
                      </div>
                      <video 
                        src={generatedVideos[scene.scene_id]} 
                        controls 
                        className="w-full rounded-lg bg-black shadow-lg"
                        autoPlay
                        loop
                      />
                    </div>
                  )}

                  {/* Master Video Prompt Display */}
                  {scene.video_prompt && (
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">
                        Master Video Prompt (Bahasa Inggris untuk AI Generator):
                      </p>
                      <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed select-all">
                        {scene.video_prompt}
                      </p>
                    </div>
                  )}
                </motion.div>
              </React.Fragment>
            )) : (
              <div className="text-center text-slate-500 py-10 italic">
                Belum ada adegan yang dihasilkan.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};