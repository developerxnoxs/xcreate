import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScenePrompt, AspectRatio, VisualStyle, ColorTheme } from '../types';
import { ListSkeleton } from './Skeletons';
import { Sparkles, Copy, Check, Palette, Camera } from 'lucide-react';

interface ImaginePromptCardProps {
  scenes: ScenePrompt[];
  isLoading?: boolean;
  aspectRatio: AspectRatio;
  visualStyle: VisualStyle;
  colorTheme: ColorTheme;
}

export const ImaginePromptCard: React.FC<ImaginePromptCardProps> = ({ 
  scenes, 
  isLoading = false, 
  aspectRatio,
  visualStyle,
  colorTheme
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const generatePrompt = (scene: ScenePrompt) => {
    if (scene.image_prompt) {
      return scene.image_prompt;
    }
    return `/imagine prompt: ${scene.action}, camera angle ${scene.camera?.angle || 'Medium'}, ${visualStyle}, ${colorTheme}, masterpiece, highly detailed --ar ${aspectRatio}`;
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-200 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/80">
        <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
            Prompt Ilustrasi Midjourney / Flux (Imagine)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Prompt visual per adegan untuk menghasilkan ilustrasi latar dan peraga sains
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <ListSkeleton color="pink" message="Menyiapkan Image Prompts per adegan..." />
      ) : (
        <motion.div 
          className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } }
          }}
        >
          <AnimatePresence>
            {scenes.length > 0 ? scenes.map((scene, index) => {
              const prompt = generatePrompt(scene);
              const isCopied = copiedId === scene.scene_id;

              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-slate-950/70 rounded-2xl p-4 sm:p-5 border border-slate-800/80 hover:border-pink-500/40 transition-all group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-pink-400 font-mono text-xs font-bold bg-pink-950/40 border border-pink-800/40 px-2.5 py-1 rounded-lg">
                      Adegan #{scene.scene_id}
                    </span>
                    <button
                      onClick={() => handleCopy(prompt, scene.scene_id)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Tersalin!' : 'Salin Prompt'}</span>
                    </button>
                  </div>
                  
                  <p className="text-xs sm:text-sm font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 select-all">
                    {prompt}
                  </p>
                </motion.div>
              );
            }) : (
              <div className="text-center text-slate-500 py-8 italic text-xs">
                Belum ada prompt gambar yang dihasilkan.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
