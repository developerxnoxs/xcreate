import React, { useState } from 'react';
import { ScienceEducationData } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Search,
  Atom,
  Lightbulb,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScienceEducationBoardProps {
  data?: ScienceEducationData | null;
  isLoading?: boolean;
}

type TabType = 'infographic' | 'dictionary' | 'quiz';

export const ScienceEducationBoard: React.FC<ScienceEducationBoardProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('infographic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Quiz specific states
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-200 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-500/10 text-cyan-400 rounded-2xl border border-indigo-500/20">
            <Atom className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="h-6 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" />
            <div className="h-3.5 w-64 bg-slate-900 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse" />
          <div className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse" />
          <div className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || quizSubmitted) return;
    setQuizSubmitted(true);
    
    const currentQuiz = data.quiz[currentQuizIndex];
    if (selectedOption === currentQuiz.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    
    if (currentQuizIndex < data.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const filteredDictionary = data.dictionary.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b0f19]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-100 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30 shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
              <Sparkles className="h-3 w-3" /> Modul Edukasi Sains
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
              Papan Pembelajaran & Eksplorasi Sains
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('infographic')}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'infographic'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Poin Inti Sains
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dictionary'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Kamus Sains
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Kuis Sains
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {/* TAB 1: INFOGRAPHIC LEARNING POINTS */}
          {activeTab === 'infographic' && (
            <motion.div
              key="infographic-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {data.learningPoints.map((point, index) => (
                <div
                  key={index}
                  className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                        {point.icon || '🔬'}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
                        Konsep #{index + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white font-display mb-2 group-hover:text-cyan-300 transition-colors">
                      {point.concept}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {point.explanation}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                    <Sparkles className="h-3 w-3" /> Fakta Sains Berharga
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 2: DICTIONARY TERMS */}
          {activeTab === 'dictionary' && (
            <motion.div
              key="dictionary-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari istilah sains dalam cerita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredDictionary.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="inline-block bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono mb-2">
                        {item.term}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: INTERACTIVE QUIZ */}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-950/70 rounded-2xl p-6 border border-slate-800"
            >
              {!quizCompleted ? (
                <div>
                  {/* Progress tracker */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-2 border-b border-slate-900">
                    <span className="font-mono text-cyan-400 font-bold">
                      Pertanyaan {currentQuizIndex + 1} dari {data.quiz.length}
                    </span>
                    <span className="text-[11px] bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                      Skor Benar: {score}
                    </span>
                  </div>

                  {/* Question */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug">
                    {data.quiz[currentQuizIndex]?.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {data.quiz[currentQuizIndex]?.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === data.quiz[currentQuizIndex].correctAnswerIndex;
                      
                      let optionStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-900';
                      
                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'bg-rose-950/60 border-rose-500/60 text-rose-200';
                        } else {
                          optionStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                        }
                      } else if (isSelected) {
                        optionStyle = 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={quizSubmitted}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                        >
                          <span className="font-medium">{option}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                          {quizSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {quizSubmitted && (
                    <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 mb-6 text-xs text-slate-300 leading-relaxed animate-fade-in-up">
                      <span className="font-bold text-cyan-400 block mb-1">💡 Penjelasan Ilmiah:</span>
                      {data.quiz[currentQuizIndex]?.explanation}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOption === null}
                        className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md disabled:opacity-40 cursor-pointer"
                      >
                        Periksa Jawaban
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuiz}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{currentQuizIndex < data.quiz.length - 1 ? 'Pertanyaan Berikutnya' : 'Lihat Hasil Akhir'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Quiz Complete screen */
                <div className="text-center py-8 space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">Kuis Sains Selesai!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                    Kamu berhasil menjawab <strong className="text-cyan-400 font-mono text-base">{score}</strong> dari <strong className="font-mono text-base">{data.quiz.length}</strong> pertanyaan dengan tepat!
                  </p>
                  <button
                    onClick={handleResetQuiz}
                    className="bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 text-xs font-bold py-2.5 px-5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Ulangi Kuis Sains
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
