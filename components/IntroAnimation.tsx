import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Atom, Orbit, Compass } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200); // 2.2 seconds duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070a13] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      {/* Background ambient radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

      <div className="relative flex items-center justify-center mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 120, duration: 0.8 }}
          className="relative z-10 p-5 rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20"
        >
          <Atom className="w-16 h-16 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute -top-3 -right-3 z-20 p-2 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center px-4"
      >
        <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-bold bg-cyan-950/50 border border-cyan-800/40 px-3 py-1 rounded-full mb-3 inline-block">
          INTERACTIVE SCIENCE AI STUDIO
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 font-display text-center tracking-tight">
          xCreate Cerita AI
        </h1>
        <p className="mt-2.5 text-slate-400 font-medium tracking-wide text-xs md:text-sm text-center">
          Membangkitkan keajaiban sains melalui imajinasi & cerita sinematik
        </p>
      </motion.div>
    </motion.div>
  );
};
