import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';

interface GenerationProgressProps {
  isGeneratingStory: boolean;
  isGeneratingAudio: boolean;
  isGeneratingImage: boolean;
  isGeneratingVideoPrompt: boolean;
  isGeneratingMetadata: boolean;
  isGeneratingScienceEdu: boolean;
  hasStarted: boolean;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGeneratingStory,
  isGeneratingAudio,
  isGeneratingImage,
  isGeneratingVideoPrompt,
  isGeneratingMetadata,
  isGeneratingScienceEdu,
  hasStarted
}) => {
  const steps = [
    { id: 'story', label: 'Menulis Cerita & Petualangan Sains', isLoading: isGeneratingStory, isDone: !isGeneratingStory && hasStarted },
    { id: 'image', label: 'Membuat Ilustrasi Master Visual', isLoading: isGeneratingImage, isDone: !isGeneratingImage && !isGeneratingStory && hasStarted },
    { id: 'audio', label: 'Mensintesis Suara Narasi & Dialog', isLoading: isGeneratingAudio, isDone: !isGeneratingAudio && !isGeneratingStory && hasStarted },
    { id: 'video', label: 'Menyusun Storyboard Adegan Video', isLoading: isGeneratingVideoPrompt, isDone: !isGeneratingVideoPrompt && !isGeneratingStory && !isGeneratingAudio && hasStarted },
    { id: 'science', label: 'Meracik Infografis & Kuis Edukasi', isLoading: isGeneratingScienceEdu, isDone: !isGeneratingScienceEdu && !isGeneratingStory && hasStarted },
    { id: 'metadata', label: 'Menyiapkan Metadata Publikasi', isLoading: isGeneratingMetadata, isDone: !isGeneratingMetadata && !isGeneratingStory && hasStarted },
  ];

  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.isDone).length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <AnimatePresence>
      {hasStarted && (
        <motion.div 
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="w-full max-w-2xl mx-auto mb-8"
        >
          <div className="bg-[#0b0f19]/90 rounded-3xl p-6 md:p-7 border border-indigo-500/30 overflow-hidden relative shadow-2xl backdrop-blur-xl">
            {/* Luminous Top Progress Track */}
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
            
            <div className="flex items-center justify-between mb-5 pt-1">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                Meracik Cerita & Media Sains...
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full">
                {progressPercentage}%
              </span>
            </div>

            <div className="space-y-2.5">
              {steps.map((step, index) => {
                let statusColor = "text-slate-500";
                let icon = <Circle className="w-4 h-4 text-slate-600" />;
                
                if (step.isDone) {
                  statusColor = "text-emerald-400";
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                } else if (step.isLoading) {
                  statusColor = "text-cyan-400";
                  icon = <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />;
                }

                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
                      step.isLoading 
                        ? 'bg-indigo-950/50 border border-indigo-500/40 z-10' 
                        : step.isDone
                        ? 'bg-slate-900/40 border border-emerald-500/20 text-slate-300'
                        : 'bg-slate-950/40 border border-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className={`${statusColor} flex-shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-medium ${step.isLoading ? 'text-white font-semibold' : step.isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
