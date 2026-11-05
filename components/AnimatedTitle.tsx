import React from 'react';
import { motion } from 'motion/react';
import { ColorTheme } from '../types';
import { Sparkles } from 'lucide-react';

interface AnimatedTitleProps {
  title?: string;
  story?: string;
  theme?: ColorTheme;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ title, story, theme }) => {
  let displayTitle = title || "";
  if (!displayTitle && story) {
    const match = story.match(/2\.\s*Judul Cerita(?:\s*:)?\s*([^\n\r]*)/i);
    if (match && match[1]) {
      displayTitle = match[1].trim();
    }
  }

  if (!displayTitle) return null;

  // Luminous cosmic gradient
  const gradientClasses = "from-cyan-300 via-indigo-300 to-purple-300";

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-8 mt-4 text-center relative w-full px-4"
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
        <Sparkles className="h-3 w-3 text-cyan-400" />
        Karya Cerita Terpilih
      </div>
      <h1 
        className={`text-2xl sm:text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r ${gradientClasses} leading-tight drop-shadow-md`}
      >
        {displayTitle}
      </h1>
    </motion.div>
  );
};
