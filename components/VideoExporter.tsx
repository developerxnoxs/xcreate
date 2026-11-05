import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeneratedContent, AspectRatio, ScenePrompt } from '../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle,
  Video,
  MonitorPlay,
  RotateCcw,
  Maximize2,
  Film,
  Camera,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Atom
} from 'lucide-react';

interface VideoExporterProps {
  content: GeneratedContent;
  aspectRatio: AspectRatio;
  title: string;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({ content, aspectRatio: initialAspectRatio, title }) => {
  // Configurable aspect ratio inside the player
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(initialAspectRatio);
  
  // Player state variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Export / Rendering states
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderMessage, setRenderMessage] = useState('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  // Refs for elements and Web Audio
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const renderIntervalRef = useRef<any>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  
  // Web Audio refs for the interactive live visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // File recording / MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Return standard aspect-ratio classes for the video frame preview
  const getAspectRatioClasses = () => {
    switch (selectedRatio) {
      case AspectRatio.PORTRAIT: // 9:16
        return 'aspect-[9/16] max-w-[340px]';
      case AspectRatio.LANDSCAPE: // 16:9
        return 'aspect-[16/9] w-full';
      case AspectRatio.CINEMATIC: // 21:9
        return 'aspect-[21/9] w-full';
      case AspectRatio.SQUARE: // 1:1
      default:
        return 'aspect-[1/1] max-w-[440px]';
    }
  };

  const getCanvasDimensions = () => {
    switch (selectedRatio) {
      case AspectRatio.PORTRAIT:
        return { width: 720, height: 1280 };
      case AspectRatio.LANDSCAPE:
        return { width: 1280, height: 720 };
      case AspectRatio.CINEMATIC:
        return { width: 1280, height: 548 };
      case AspectRatio.SQUARE:
      default:
        return { width: 1080, height: 1080 };
    }
  };

  // Safe Web Audio Context initializer
  const getOrCreateAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  // Pre-load main story illustration so it's ready in high-quality
  useEffect(() => {
    if (!content.imageUrl) return;

    setIsImageLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = content.imageUrl;
    img.onload = () => {
      imageCacheRef.current = img;
      setIsImageLoaded(true);
      setTimeout(() => {
        drawFrame(0);
      }, 50);
    };
    img.onerror = () => {
      // Fallback: create placeholder canvas image
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1080;
      fallbackCanvas.height = 1080;
      const fCtx = fallbackCanvas.getContext('2d');
      if (fCtx) {
        const grad = fCtx.createLinearGradient(0, 0, 1080, 1080);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#0f172a');
        fCtx.fillStyle = grad;
        fCtx.fillRect(0, 0, 1080, 1080);
        const fallbackImg = new Image();
        fallbackImg.src = fallbackCanvas.toDataURL();
        fallbackImg.onload = () => {
          imageCacheRef.current = fallbackImg;
          setIsImageLoaded(true);
          drawFrame(0);
        };
      }
    };

    setExportedVideoUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (renderIntervalRef.current) clearInterval(renderIntervalRef.current);
    };
  }, [content.imageUrl, selectedRatio]);

  // Handle duration updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleAudioEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      setCurrentTime(0);
      drawFrame(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleAudioEnded);

    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    } else {
      // Default estimation based on scenes
      const estimatedScenesDur = (content.videoPrompt?.length || 3) * 10;
      setDuration(estimatedScenesDur);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [content.audioUrl, content.videoPrompt]);

  // Clean elements on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (renderIntervalRef.current) clearInterval(renderIntervalRef.current);
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  // Sets up AudioAnalyser safely with user gesture
  const initAudioAnalyser = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const audioCtx = getOrCreateAudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      if (!sourceNodeRef.current) {
        try {
          const source = audioCtx.createMediaElementSource(audio);
          sourceNodeRef.current = source;
        } catch (err) {
          console.warn("createMediaElementSource already attached or restricted:", err);
        }
      }

      if (!analyserRef.current) {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;
      }

      if (!gainNodeRef.current) {
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = isMuted ? 0 : 1;
        gainNodeRef.current = gainNode;
      }

      if (sourceNodeRef.current && analyserRef.current && gainNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current.connect(analyserRef.current);
          analyserRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioCtx.destination);
        } catch (pipeErr) {
          console.warn("Audio pipe reconnect warning:", pipeErr);
        }
      }
    } catch (e) {
      console.warn("Could not construct Web Audio node chain:", e);
    }
  };

  // Helper to wrap subtitles text cleanly onto canvas
  const wrapTextHelper = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(currentLine.trim());
        currentLine = words[n] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    return lines;
  };

  // Draws a single high-definition video frame corresponding to a timestamp 'time' (seconds)
  const drawFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getCanvasDimensions();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 1. Reset Background
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, width, height);

    const img = imageCacheRef.current;

    // 2. Storyboard Scene Calculation
    const totalDur = duration > 0 ? duration : 30;
    const scenes: ScenePrompt[] = content.videoPrompt && content.videoPrompt.length > 0 
      ? content.videoPrompt 
      : [{
          scene_id: 1,
          duration: totalDur,
          dialog: content.story.slice(0, 160) + "...",
          camera: { angle: "Slow Dolly In", zoom: "Medium" },
          action: "Cerita sains petualangan",
          character_interactions: "",
          image_prompt: "",
          video_prompt: "",
          sound_environment: "",
          transition: "Fade In"
        }];

    let sumDur = 0;
    for (const sc of scenes) {
      sumDur += sc.duration || 10;
    }
    if (sumDur <= 0) sumDur = 1;
    const scaleFactor = totalDur / sumDur;

    let timer = 0;
    const storyboard = scenes.map((sc) => {
      const d = (sc.duration || 10) * scaleFactor;
      const start = timer;
      const end = timer + d;
      timer = end;
      return { ...sc, startTime: start, endTime: end };
    });

    const activeSceneIndex = storyboard.findIndex(s => time >= s.startTime && time <= s.endTime);
    const activeScene = activeSceneIndex >= 0 ? storyboard[activeSceneIndex] : (storyboard[storyboard.length - 1] || storyboard[0]);
    const currentSceneNumber = activeSceneIndex >= 0 ? activeSceneIndex + 1 : 1;
    
    const activeProgress = activeScene
      ? Math.max(0, Math.min(1, (time - activeScene.startTime) / (activeScene.endTime - activeScene.startTime || 1)))
      : 0;

    // 3. Cinematic Camera Movement per Scene
    ctx.save();
    
    // Determine dynamic camera movement from scene metadata
    const cameraAngle = (activeScene?.camera?.angle || '').toLowerCase();
    let zoomLevel = 1.05;
    let panX = 0;
    let panY = 0;

    if (cameraAngle.includes('dolly in') || cameraAngle.includes('zoom in')) {
      zoomLevel = 1.03 + activeProgress * 0.12;
    } else if (cameraAngle.includes('dolly out') || cameraAngle.includes('zoom out')) {
      zoomLevel = 1.15 - activeProgress * 0.10;
    } else if (cameraAngle.includes('pan right') || cameraAngle.includes('tracking')) {
      zoomLevel = 1.08;
      panX = -30 + activeProgress * 60;
    } else if (cameraAngle.includes('pan left')) {
      zoomLevel = 1.08;
      panX = 30 - activeProgress * 60;
    } else if (cameraAngle.includes('crane') || cameraAngle.includes('pedestal')) {
      zoomLevel = 1.06;
      panY = -20 + activeProgress * 40;
    } else {
      // Gentle cinematic breathing movement
      zoomLevel = 1.04 + Math.sin(activeProgress * Math.PI) * 0.06;
      panX = Math.cos(activeProgress * Math.PI * 0.6) * 14;
      panY = Math.sin(activeProgress * Math.PI * 0.4) * 8;
    }

    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoomLevel, zoomLevel);

    if (img) {
      const imageScale = Math.max(width / img.width, height / img.height);
      const fitWidth = img.width * imageScale;
      const fitHeight = img.height * imageScale;
      ctx.drawImage(img, -fitWidth / 2, -fitHeight / 2, fitWidth, fitHeight);
    } else {
      // Elegant ambient gradient if image not ready
      const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, width);
      grad.addColorStop(0, '#312e81');
      grad.addColorStop(0.7, '#1e1b4b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }

    ctx.restore();

    // 4. Cinematic Vignette & Ambient Darkness Overlay
    ctx.save();
    const vignetteGrad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.35,
      width / 2, height / 2, width * 0.75
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(6, 9, 17, 0.7)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 5. Science Floating Particles & Energy Waves
    ctx.save();
    const particleCount = 28;
    for (let p = 0; p < particleCount; p++) {
      const seedX = (p * 1747) % width;
      const speedScale = 0.5 + (p % 4) * 0.25;
      const size = 1.5 + (p % 5) * 1.2;
      
      const driftX = Math.sin(time * 0.7 * speedScale + p) * 30;
      const driftY = - (time * 22 * speedScale) % (height + 80);
      
      let px = seedX + driftX;
      let py = height + 40 + driftY;
      if (py < -40) py = height + 40;

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      
      const glow = 0.35 + Math.sin(time * 3 + p) * 0.2;
      if (p % 3 === 0) {
        ctx.fillStyle = `rgba(34, 211, 238, ${glow})`; // Cyan Lab
        ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
      } else if (p % 3 === 1) {
        ctx.fillStyle = `rgba(168, 85, 247, ${glow})`; // Cosmic Violet
        ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      } else {
        ctx.fillStyle = `rgba(251, 191, 36, ${glow})`; // Gold Star
        ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
      }
      ctx.shadowBlur = size * 3;
      ctx.fill();
    }
    ctx.restore();

    // 6. Audio Visualizer Spectrum Bars
    ctx.save();
    const barCount = 48;
    const visualizerMargin = width > 1000 ? 120 : 60;
    const barWidth = (width - visualizerMargin * 2) / barCount;
    const visualizerY = height - (selectedRatio === AspectRatio.PORTRAIT ? 270 : 160);

    const dataArray = new Uint8Array(barCount);
    if (analyserRef.current && isPlaying) {
      analyserRef.current.getByteFrequencyData(dataArray);
    } else {
      // Dynamic simulated idle wave
      for (let j = 0; j < barCount; j++) {
        dataArray[j] = Math.max(8, Math.sin(j * 0.35 + time * 3.5) * 22 + 18);
      }
    }

    for (let i = 0; i < barCount; i++) {
      const realValue = dataArray[i];
      const percent = realValue / 255;
      const maxBarH = width > 1000 ? 110 : 60;
      const barHeight = Math.max(5, percent * maxBarH);

      const bx = visualizerMargin + i * barWidth;
      const by = visualizerY - barHeight / 2;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, barWidth - 3, barHeight, 4);
      } else {
        ctx.rect(bx, by, barWidth - 3, barHeight);
      }

      const hue = (i * 5 + time * 45) % 360;
      ctx.fillStyle = `hsla(${hue}, 88%, 65%, 0.75)`;
      ctx.shadowColor = `hsla(${hue}, 88%, 60%, 0.5)`;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();

    // 7. Subtitle Speech Overlay & Scene Badges
    if (activeScene && activeScene.dialog) {
      ctx.save();
      
      const maxTextWidth = width - (width > 1000 ? 200 : 100);
      const fontSize = width > 1000 ? 26 : 18;
      ctx.font = `600 ${fontSize}px "Outfit", "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lineList = wrapTextHelper(ctx, activeScene.dialog, maxTextWidth);
      const rowHeight = fontSize * 1.45;
      const pillHeight = lineList.length * rowHeight + 36;
      const positionY = height - pillHeight - (selectedRatio === AspectRatio.PORTRAIT ? 90 : 40);

      // Glassmorphic Subtitle Container
      ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(width * 0.05, positionY, width * 0.9, pillHeight, 20);
      } else {
        ctx.rect(width * 0.05, positionY, width * 0.9, pillHeight);
      }
      ctx.fill();
      ctx.stroke();

      // Scene Tracker Tag on top of Subtitle Box
      ctx.font = `bold ${width > 1000 ? 13 : 11}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#818cf8';
      ctx.shadowBlur = 0;
      ctx.fillText(
        `SCENE ${currentSceneNumber} / ${storyboard.length} • ${activeScene.camera?.angle || 'CINEMATIC SHOT'}`,
        width / 2,
        positionY + 14
      );

      // Subtitle Lines
      ctx.font = `600 ${fontSize}px "Outfit", "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;

      lineList.forEach((line, index) => {
        const lineY = positionY + 30 + (index * rowHeight) + (rowHeight / 2);
        ctx.fillText(line, width / 2, lineY);
      });

      ctx.restore();
    }

    // 8. Elegant Studio Branding Top Bar
    ctx.save();
    const brandFontSize = width > 1000 ? 18 : 13;
    ctx.font = `bold ${brandFontSize}px "Outfit", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText("✨ xCreate • Studio Edukasi Sains", width > 1000 ? 50 : 25, width > 1000 ? 45 : 32);

    ctx.textAlign = 'right';
    ctx.font = `500 ${brandFontSize - 2}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#c7d2fe';
    const displayTitle = title ? (title.length > 36 ? title.substring(0, 36) + "..." : title) : "Cerita Sains Interaktif";
    ctx.fillText(displayTitle, width - (width > 1000 ? 50 : 25), width > 1000 ? 45 : 32);
    ctx.restore();

  }, [content, duration, selectedRatio, isPlaying, title]);

  // Smooth Play Loop using requestAnimationFrame
  const playLoop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused || audio.ended) return;

    const time = audio.currentTime;
    setCurrentTime(time);
    drawFrame(time);

    animationFrameRef.current = requestAnimationFrame(playLoop);
  }, [drawFrame]);

  // Play & Pause toggle
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    } else {
      setErrorMessage(null);
      await initAudioAnalyser();
      audio.play().then(() => {
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(playLoop);
      }).catch(e => {
        console.warn("Audio play issue, running silent player:", e);
        // Run player even if audio play is blocked
        setIsPlaying(true);
        let simTime = currentTime;
        const totalSim = duration || 30;
        const interval = setInterval(() => {
          simTime += 0.1;
          if (simTime >= totalSim) {
            clearInterval(interval);
            setIsPlaying(false);
            simTime = 0;
          }
          setCurrentTime(simTime);
          drawFrame(simTime);
        }, 100);
      });
    }
  };

  // Timeline scrub tracker
  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newTime = parseFloat(e.target.value);
    
    if (audio) {
      audio.currentTime = newTime;
    }
    setCurrentTime(newTime);
    drawFrame(newTime);
  };

  // Volume & Mute toggle
  const handleToggleMute = () => {
    const audio = audioRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    if (audio) {
      audio.muted = nextMuted;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = nextMuted ? 0 : 1;
    }
  };

  // HIGH FIDELITY MEDIA RECORDER EXPORTER
  // Robustly records canvas stream + audio into a high quality MP4/WebM file
  const startRecordingForExport = async () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas) {
      setErrorMessage("Canvas video belum siap.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsRendering(true);
      setRenderProgress(0);
      setRenderMessage("Menyiapkan kanvas & audio...");

      // Stop current interactive playback
      if (audio) audio.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (renderIntervalRef.current) clearInterval(renderIntervalRef.current);

      // Pre-load background picture block safely
      if (content.imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = content.imageUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // continue even on error with fallback
        });
      }

      // Ensure dimensions are initialized
      const { width, height } = getCanvasDimensions();
      canvas.width = width;
      canvas.height = height;

      // Web Audio setup
      const audioCtx = getOrCreateAudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const destNode = audioCtx.createMediaStreamDestination();
      
      // Connect audio element if available
      if (audio && content.audioUrl) {
        if (!sourceNodeRef.current) {
          try {
            sourceNodeRef.current = audioCtx.createMediaElementSource(audio);
          } catch (e) {
            console.warn("MediaElementAudioSource reuse:", e);
          }
        }
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current.connect(destNode);
            // Also connect to speaker at low volume for live preview
            const previewGain = audioCtx.createGain();
            previewGain.gain.value = isMuted ? 0 : 0.2;
            sourceNodeRef.current.connect(previewGain);
            previewGain.connect(audioCtx.destination);
          } catch (connErr) {
            console.warn("Source connect note:", connErr);
          }
        }
      } else {
        // Fallback gentle tone generator so audio track is never null
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 0.001; // virtually silent anchor track
        osc.connect(oscGain);
        oscGain.connect(destNode);
        osc.start();
      }

      // Capture canvas stream at 30fps
      const canvasStream = canvas.captureStream(30);

      // Combine video track + audio tracks
      const consolidatedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach(t => consolidatedStream.addTrack(t));
      destNode.stream.getAudioTracks().forEach(t => consolidatedStream.addTrack(t));

      // Supported mimeTypes
      let selectedMime = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        selectedMime = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        selectedMime = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        selectedMime = 'video/mp4';
      }

      const recorder = new MediaRecorder(consolidatedStream, {
        mimeType: selectedMime || undefined,
        videoBitsPerSecond: 3000000 // 3 Mbps for crisp text & graphics
      });
      mediaRecorderRef.current = recorder;

      const dataChunks: Blob[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          dataChunks.push(ev.data);
        }
      };

      const finishExport = () => {
        try {
          const finalBlob = new Blob(dataChunks, { type: selectedMime || 'video/webm' });
          const finalUrl = URL.createObjectURL(finalBlob);
          setExportedVideoUrl(finalUrl);
          setIsRendering(false);
          setRenderProgress(100);
          setRenderMessage("Selesai!");
        } catch (blobErr) {
          console.error("Blob error:", blobErr);
          setIsRendering(false);
        }
      };

      recorder.onstop = finishExport;

      // Rewind and start render loop
      const maxRecordingDur = duration > 0 ? duration : (content.videoPrompt?.length || 3) * 10;
      let recordTime = 0;
      
      if (audio && content.audioUrl) {
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch (e) {
          console.warn("Audio play during export auto-fell back:", e);
        }
      }

      // Emit chunks every 250ms
      recorder.start(250);
      setRenderMessage("Merekam frame sinematik...");

      // Render loop running via rock-solid 33ms interval (30 FPS)
      const frameStep = 1 / 30; // 33.3ms
      renderIntervalRef.current = setInterval(() => {
        recordTime += frameStep;
        
        if (audio && !audio.paused && !audio.ended) {
          recordTime = audio.currentTime;
        }

        setCurrentTime(recordTime);
        const progressPct = Math.min(99, Math.round((recordTime / maxRecordingDur) * 100));
        setRenderProgress(progressPct);
        setRenderMessage(`Mengompilasi frame: ${Math.round(recordTime)}s / ${Math.round(maxRecordingDur)}s (${progressPct}%)...`);

        drawFrame(recordTime);

        if (recordTime >= maxRecordingDur || (audio && audio.ended)) {
          clearInterval(renderIntervalRef.current);
          if (audio) audio.pause();
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 33);

    } catch (recorderErr: any) {
      console.error(recorderErr);
      setErrorMessage(recorderErr.message || "Gagal melakukan render video.");
      setIsRendering(false);
    }
  };

  const handleDownloadFile = () => {
    if (!exportedVideoUrl) return;
    const link = document.createElement('a');
    link.href = exportedVideoUrl;
    const formattedTitle = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24) : 'cerita_sains';
    link.download = `video_${formattedTitle || 'sains'}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimerValue = (val: number) => {
    const mins = Math.floor(val / 60);
    const secs = Math.floor(val % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-[#0b0f19]/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Luminous Top Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 animate-pulse" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md text-indigo-300 font-bold uppercase tracking-wider text-[11px] px-3.5 py-1 rounded-full border border-indigo-500/30">
            <Film className="h-3.5 w-3.5 text-cyan-400" />
            Studio Produksi Video Cerita
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display mt-2 flex items-center gap-2.5 text-white tracking-tight">
            <MonitorPlay className="h-7 w-7 text-indigo-400" />
            Putar & Kompilasikan Video
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Tonton naskah cerita dan ilustrasi sains kamu menjadi video bergerak lengkap dengan animasi kamera, gelombang audio, dan takarir subtitle.
          </p>
        </div>

        {/* Ratio Selector & Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSelectedRatio(AspectRatio.LANDSCAPE)}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedRatio === AspectRatio.LANDSCAPE ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="16:9 Landscape (YouTube / Layar Lebar)"
            >
              16:9
            </button>
            <button
              onClick={() => setSelectedRatio(AspectRatio.PORTRAIT)}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedRatio === AspectRatio.PORTRAIT ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="9:16 Portrait (TikTok / Shorts / Reels)"
            >
              9:16
            </button>
            <button
              onClick={() => setSelectedRatio(AspectRatio.SQUARE)}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedRatio === AspectRatio.SQUARE ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="1:1 Square (Instagram Post)"
            >
              1:1
            </button>
          </div>

          {!isRendering ? (
            <button
              onClick={startRecordingForExport}
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 cursor-pointer"
            >
              <Video className="h-4 w-4" />
              Kompilasikan ke Video (.webm/.mp4)
            </button>
          ) : (
            <div className="flex items-center gap-2 text-indigo-300 text-xs bg-indigo-950/80 border border-indigo-800 px-3.5 py-2 rounded-xl">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span className="font-mono font-bold">{renderProgress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT COLUMN: THE CANVAS PLAYER STAGE */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className={`relative bg-slate-950 rounded-2xl border-2 border-indigo-500/20 shadow-2xl overflow-hidden group w-full ${getAspectRatioClasses()}`}>
            
            {/* The visible Canvas Player */}
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain cursor-pointer transition-all"
              onClick={handlePlayPause}
            />

            {/* Simulated overlay play button */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 bg-black/45 hover:bg-black/55 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all"
                onClick={handlePlayPause}
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-110 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-transform border-2 border-white/30">
                  <Play className="h-7 w-7 fill-white translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Status image loader overlay */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-2" />
                <span className="text-xs text-slate-400">Menyiapkan kanvas visual...</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & INFO PANEL */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          
          {/* Integrated Interactive Custom Player Control Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Panel Pemutar Video
              </h4>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                HD 30 FPS
              </span>
            </div>
            
            {/* Play trigger + Time tracking display */}
            <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <button
                onClick={handlePlayPause}
                className="h-10 w-10 text-white bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center rounded-xl transition transform active:scale-95 flex-shrink-0 shadow cursor-pointer"
                title={isPlaying ? "Jeda" : "Putar"}
              >
                {isPlaying ? <Pause className="h-4.5 w-4.5 fill-white stroke-white" /> : <Play className="h-4.5 w-4.5 fill-white stroke-white translate-x-0.5" />}
              </button>

              <div className="flex-grow">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Waktu Adegan</p>
                <p className="text-sm font-mono font-bold text-white">
                  {formatTimerValue(currentTime)} <span className="text-slate-500">/ {formatTimerValue(duration || 30)}</span>
                </p>
              </div>

              {/* Volume Controller Mute/Unmute */}
              <button
                onClick={handleToggleMute}
                className="h-9 w-9 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition flex-shrink-0 cursor-pointer"
                title={isMuted ? "Aktifkan suara" : "Senyapkan"}
              >
                {isMuted ? <VolumeX className="h-4.5 w-4.5 text-rose-400" /> : <Volume2 className="h-4.5 w-4.5 text-cyan-400" />}
              </button>
            </div>

            {/* Time Timeline Scrub Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 px-1">
                <span>Scrubber Waktu Video</span>
                <span className="font-mono text-indigo-300">{Math.round(currentTime)}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 30}
                step={0.1}
                value={currentTime}
                onChange={handleScrubChange}
                disabled={isRendering || !isImageLoaded}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Render Export results panel */}
          {exportedVideoUrl && (
            <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-500/40 space-y-3 animate-fade-in-up">
              <div className="flex items-start gap-2.5 text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs sm:text-sm">Berkas Video Siap Diunduh!</h5>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                    Render selesai sepenuhnya. Berkas video beresolusi tinggi siap diunduh dan diputar di perangkat manapun atau diunggah ke TikTok, Reels, dan YouTube Shorts.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadFile}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition font-bold text-xs sm:text-sm text-slate-950 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Unduh Berkas Video Lengkap (.WebM)
              </button>
            </div>
          )}

          {/* Live rendering progress indicators */}
          {isRendering && (
            <div className="p-4 bg-indigo-950/70 rounded-xl border border-indigo-500/30 space-y-2">
              <p className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                {renderMessage}
              </p>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-200"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Kompilasi frame merekam kanvas visual dan sinkronisasi audio secara runtun.</p>
            </div>
          )}

          {/* Quick tips about direct play */}
          <div className="text-[11px] leading-relaxed text-slate-400 flex items-start gap-2 pt-2 border-t border-slate-800">
            <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Tip Editor:</strong> Kamu bisa memilih aspek rasio (16:9, 9:16, atau 1:1) kapan saja di atas untuk menyesuaikan format video sebelum mengklik <strong>Kompilasikan ke Video</strong>.
            </span>
          </div>

          {/* Error messages display if any */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/70 border border-red-500/30 text-red-200 rounded-xl flex items-center gap-2.5 text-xs">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>
      </div>

      {/* Hidden audio element synced playbacks */}
      {content.audioUrl && (
        <audio ref={audioRef} src={content.audioUrl} preload="auto" />
      )}
    </div>
  );
};
