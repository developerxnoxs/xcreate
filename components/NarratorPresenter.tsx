import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';

interface NarratorPresenterProps {
  name: string;
  isVisible: boolean;
  message?: string;
  isSpeaking?: boolean;
}

export const NarratorPresenter: React.FC<NarratorPresenterProps> = ({ name, isVisible, message, isSpeaking = false }) => {
  const openMouthRef = useRef<HTMLImageElement>(null);
  const rafId = useRef<number>(undefined);

  // Generate deterministic avatars using @dicebear/core locally
  const { avatarClosedUrl, avatarOpenUrl } = useMemo(() => {
    const seed = name || 'Kakak Riza';
    
    // Create base options that guarantee a fixed visual appearance for a given name
    const baseOptions = {
      seed,
      backgroundColor: ['transparent'],
      baseColor: ['f9c9b6']
    };

    const closedAvatar = createAvatar(micah, {
      ...baseOptions,
      mouth: ['smile']
    });

    const openAvatar = createAvatar(micah, {
      ...baseOptions,
      mouth: ['laughing']
    });

    // `.toDataUri()` executes synchronously in browser and returns base64 svg
    return {
      avatarClosedUrl: closedAvatar.toDataUri(),
      avatarOpenUrl: openAvatar.toDataUri()
    };
  }, [name]);

  useEffect(() => {
    if (!isSpeaking) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (openMouthRef.current) {
        openMouthRef.current.style.opacity = '0';
      }
      return;
    }

    // Try to find an audio playing and attach an analyser
    // Or simulate if CORS/WebAudio fails
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const setupAudio = () => {
      const audioEl = document.querySelector('audio');
      if (audioEl && !audioEl.paused && !audioEl.muted) {
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          
          // Note: createMediaElementSource can break if audio is cross-origin
          // But our generated audio is usually a Base64 blob, which should be fine.
          // To be safe against "already connected" errors, we wrap it.
          if (!(audioEl as any)._audioSourceNode) {
            const source = audioContext.createMediaElementSource(audioEl);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            (audioEl as any)._audioSourceNode = source;
          } else {
            const source = (audioEl as any)._audioSourceNode;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
          }

          analyser.fftSize = 64; // smaller size for faster generic amplitude detection
          const bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
        } catch (e) {
          console.warn("Could not setup audio context for lip sync, using simulated sync.", e);
        }
      }
    };

    setupAudio();

    const animateMouth = () => {
      if (analyser && dataArray && openMouthRef.current) {
        analyser.getByteFrequencyData(dataArray);
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Map average volume (0-255) to opacity (0-1), adding a slight threshold
        const threshold = 10;
        let opacity = 0;
        if (average > threshold) {
           opacity = Math.min(1, (average - threshold) / 50); 
        }
        
        // Easing interpolation
        const currentOpacity = parseFloat(openMouthRef.current.style.opacity || '0');
        const nextOpacity = currentOpacity + (opacity - currentOpacity) * 0.4; // 0.4 smoothing factor
        openMouthRef.current.style.opacity = nextOpacity.toString();
      } else if (openMouthRef.current) {
         // Simulated lip sync if no real audio analyser
         const time = Date.now();
         const sineWalk = Math.sin(time / 100) * 0.5 + 0.5; // 0 to 1
         // Randomize slightly
         const isTalking = Math.random() > 0.3 ? sineWalk : 0;
         const currentOpacity = parseFloat(openMouthRef.current.style.opacity || '0');
         openMouthRef.current.style.opacity = (currentOpacity + (isTalking - currentOpacity) * 0.3).toString();
      }
      
      rafId.current = requestAnimationFrame(animateMouth);
    };

    if (isSpeaking) {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
      animateMouth();
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (openMouthRef.current) openMouthRef.current.style.opacity = '0';
    };
  }, [isSpeaking]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -300, y: 100, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ x: -300, y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="fixed bottom-0 left-[-10px] md:left-4 z-40 pointer-events-none drop-shadow-2xl flex flex-col justify-end items-start"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="bg-white/95 backdrop-blur-md text-indigo-900 px-5 py-3 rounded-3xl rounded-bl-none shadow-xl mb-[-20px] ml-28 md:ml-36 max-w-[220px] relative z-20 border-2 border-indigo-100"
          >
             <p className="text-xs font-bold text-indigo-500 mb-1 uppercase tracking-wider">Narasumber</p>
             <p className="text-sm font-semibold">{name || 'Kakak Riza'}</p>
             {message && (
               <p className="text-xs mt-2 text-slate-600 border-t border-indigo-50 pt-2 leading-relaxed font-medium">
                 {message}
               </p>
             )}
          </motion.div>
          <div className="relative w-48 md:w-64 lg:w-72 h-auto z-10">
            <img 
              src={avatarClosedUrl} 
              alt="Narrator" 
              className="w-full h-auto"
            />
            {avatarOpenUrl && (
              <img 
                ref={openMouthRef}
                src={avatarOpenUrl} 
                alt="Narrator Speaking" 
                className="w-full h-auto absolute top-0 left-0 transition-opacity duration-75"
                style={{ opacity: 0 }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
