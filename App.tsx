import React, { useState, useEffect } from 'react';
import { GeneratedContent, LoadingState, AspectRatio, VisualStyle, ColorTheme, FaceMode, NarrativeStructure, TargetAudience, CreatorPersona, Pitch, Speed, AnimationStyle, AnimationSpeed, AnimationEasing, BackgroundPresence, CharacterGender, CharacterStyle, SavedStory } from './types';
import * as geminiService from './services/geminiService';
import { InputSection } from './components/InputSection';
import { SavedStories } from './components/SavedStories';
import { AnimatedTitle } from './components/AnimatedTitle';
import { StoryCard } from './components/StoryCard';
import { MediaCard } from './components/MediaCard';
import { VideoExporter } from './components/VideoExporter';
import { VideoPromptCard } from './components/VideoPromptCard';
import { ImaginePromptCard } from './components/ImaginePromptCard';
import { MetadataCard } from './components/MetadataCard';
import { ScienceEducationBoard } from './components/ScienceEducationBoard';
import { StorySkeleton } from './components/Skeletons';
import { GenerationProgress } from './components/GenerationProgress';
import { IntroAnimation } from './components/IntroAnimation';
import { ScientificBackdrop } from './components/ScientificBackdrop';
import { AnimatePresence, motion } from 'motion/react';
import LZString from 'lz-string';

const extractNarration = (story: string): string => {
  // Regex to extract everything from '6. Alur Lengkap' up to '7. Perjalanan Emosi Karakter Utama'
  const match = story.match(/6\.\s*Alur Lengkap(?:\s*:)?\s*([\s\S]*?)(?:7\.\s*Perjalanan Emosi Karakter Utama|$)/i);
  let narration = match && match[1] ? match[1].trim() : story;
  
  // Clean up cinematic formatting for Text-To-Speech
  // e.g., removes: [RAVEN] (diam beberapa detik, menunduk, medium shot) "Kadang pengen nangis..." -> "Kadang pengen nangis..."
  // This ensures TTS only reads the spoken dialogue and narration.
  narration = narration.replace(/\[[^\]]+\]\s*\([^)]+\)\s*/g, '');
  
  return narration;
};

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [currentVoice, setCurrentVoice] = useState<string>("Puck");
  const [currentAspectRatio, setCurrentAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [currentVisualStyle, setCurrentVisualStyle] = useState<VisualStyle>(VisualStyle.PIXAR);
  const [currentColorTheme, setCurrentColorTheme] = useState<ColorTheme>(ColorTheme.WARM);
  const [currentDurationSeconds, setCurrentDurationSeconds] = useState<number>(90);
  const [currentStorytellerName, setCurrentStorytellerName] = useState<string>("Kakak Riza");
  const [currentFaceMode, setCurrentFaceMode] = useState<FaceMode>(FaceMode.WITH_FACE);
  const [currentNarrativeStructure, setCurrentNarrativeStructure] = useState<NarrativeStructure>(NarrativeStructure.LINEAR);
  const [currentTargetAudience, setCurrentTargetAudience] = useState<TargetAudience>(TargetAudience.PAUD);
  const [currentCreatorPersona, setCurrentCreatorPersona] = useState<CreatorPersona>(CreatorPersona.YOUTUBE_PRO);
  
  const [currentPitch, setCurrentPitch] = useState<string>(Pitch.DEFAULT);
  const [currentSpeed, setCurrentSpeed] = useState<string>(Speed.DEFAULT);
  
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  // Granular loading states
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideoPrompt, setIsGeneratingVideoPrompt] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [isGeneratingScienceEdu, setIsGeneratingScienceEdu] = useState(false);
  
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Read-Along interactive state hooks
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log("Play failed:", e));
      }
    }
  };

  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Load shared content from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#share=')) {
      try {
        const compressed = hash.substring(7);
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (decompressed) {
          const sharedContent = JSON.parse(decompressed);
          setContent(sharedContent);
          setLoadingState(LoadingState.COMPLETED);
          // Scroll to results after a short delay to ensure rendering
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 500);
        }
      } catch (err) {
        console.error("Failed to load shared content:", err);
        setError("Gagal memuat konten yang dibagikan.");
      }
    }
  }, []);

  // Load saved stories from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cerita_ai_saved_stories');
      if (stored) {
        setSavedStories(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load saved stories from localStorage", err);
    }
  }, []);

  const saveCurrentStoryState = (currentContent: GeneratedContent, idToUse: string) => {
    if (!currentContent || !currentTopic) return;

    const newSavedStory: SavedStory = {
      id: idToUse,
      timestamp: Date.now(),
      topic: currentTopic,
      creatorPersona: currentCreatorPersona,
      content: currentContent,
      voice: currentVoice,
      durationSeconds: currentDurationSeconds,
      aspectRatio: currentAspectRatio,
      visualStyle: currentVisualStyle,
      colorTheme: currentColorTheme,
      storytellerName: currentStorytellerName,
      faceMode: currentFaceMode,
      narrativeStructure: currentNarrativeStructure,
      targetAudience: currentTargetAudience,
      pitch: currentPitch,
      speed: currentSpeed,
      characterAppearance: currentCharacterAppearance,
      animationStyle: selectedAnimation,
      customEvent: currentCustomEvent,
      backgroundPresence: currentBackgroundPresence as BackgroundPresence,
      characterGender: currentCharacterGender,
      characterStyle: currentCharacterStyle,
      animationSpeed: currentAnimationSpeed,
      animationEasing: currentAnimationEasing,
      linkEmotionsToAnimation: currentLinkEmotionsToAnimation,
      interactiveBackgroundAction: currentInteractiveBackgroundAction
    };

    setSavedStories(prev => {
      const existingIndex = prev.findIndex(story => story.id === idToUse);
      let updatedStories: SavedStory[];

      if (existingIndex >= 0) {
        updatedStories = [...prev];
        updatedStories[existingIndex] = newSavedStory;
      } else {
        updatedStories = [newSavedStory, ...prev].slice(0, 5);
      }

      try {
        localStorage.setItem('cerita_ai_saved_stories', JSON.stringify(updatedStories));
      } catch (err) {
        console.error("Failed to save stories to localStorage", err);
      }
      return updatedStories;
    });
  };

  const handleSelectStory = (saved: SavedStory) => {
    setContent(saved.content);
    setCurrentTopic(saved.topic);
    setCurrentVoice(saved.voice);
    setCurrentAspectRatio(saved.aspectRatio);
    setCurrentVisualStyle(saved.visualStyle);
    setCurrentColorTheme(saved.colorTheme);
    setCurrentDurationSeconds(saved.durationSeconds);
    setCurrentStorytellerName(saved.storytellerName);
    setCurrentFaceMode(saved.faceMode);
    setCurrentNarrativeStructure(saved.narrativeStructure);
    setCurrentTargetAudience(saved.targetAudience);
    setCurrentCreatorPersona(saved.creatorPersona);
    setCurrentPitch(saved.pitch);
    setCurrentSpeed(saved.speed);
    setCurrentCharacterAppearance(saved.characterAppearance);
    setSelectedAnimation(saved.animationStyle);
    setCurrentAnimationSpeed(saved.animationSpeed);
    setCurrentAnimationEasing(saved.animationEasing);
    setCurrentLinkEmotionsToAnimation(saved.linkEmotionsToAnimation);
    setCurrentCustomEvent(saved.customEvent);
    setCurrentBackgroundPresence(saved.backgroundPresence);
    setCurrentInteractiveBackgroundAction(saved.interactiveBackgroundAction);
    setCurrentCharacterGender(saved.characterGender);
    setCurrentCharacterStyle(saved.characterStyle);
    setActiveSavedId(saved.id);

    // Stop and reset all active loading indicators
    setLoadingState(LoadingState.COMPLETED);
    setIsGeneratingStory(false);
    setIsGeneratingAudio(false);
    setIsGeneratingImage(false);
    setIsGeneratingVideoPrompt(false);
    setIsGeneratingMetadata(false);
    setError(null);

    // Scroll to results after a brief moment
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleDeleteStory = (id: string) => {
    setSavedStories(prev => {
      const updated = prev.filter(story => story.id !== id);
      try {
        localStorage.setItem('cerita_ai_saved_stories', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update saved stories in localStorage", err);
      }
      return updated;
    });

    // If the currently viewed story was deleted, reset selection
    if (activeSavedId === id) {
      setActiveSavedId(null);
    }
  };

  const handleShare = () => {
    if (!content) return;
    try {
      const jsonString = JSON.stringify(content);
      const compressed = LZString.compressToEncodedURIComponent(jsonString);
      const shareUrl = `${window.location.origin}${window.location.pathname}#share=${compressed}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link berhasil disalin! Bagikan kepada temanmu.");
      });
    } catch (err) {
      console.error("Failed to generate share link:", err);
      alert("Gagal membuat link berbagi.");
    }
  };

  const [audioDuration, setAudioDuration] = useState<number>(0);

  const [currentCharacterAppearance, setCurrentCharacterAppearance] = useState<string>('');
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationStyle>(AnimationStyle.SMOOTH);
  const [currentAnimationSpeed, setCurrentAnimationSpeed] = useState<AnimationSpeed>(AnimationSpeed.DEFAULT);
  const [currentAnimationEasing, setCurrentAnimationEasing] = useState<AnimationEasing>(AnimationEasing.EASE_IN_OUT);
  const [currentLinkEmotionsToAnimation, setCurrentLinkEmotionsToAnimation] = useState<boolean>(true);
  const [currentCustomEvent, setCurrentCustomEvent] = useState<string>('');
  const [currentBackgroundPresence, setCurrentBackgroundPresence] = useState<string>('Background Only');
  const [currentInteractiveBackgroundAction, setCurrentInteractiveBackgroundAction] = useState<string>('');
  const [currentCharacterGender, setCurrentCharacterGender] = useState<CharacterGender>(CharacterGender.MALE);
  const [currentCharacterStyle, setCurrentCharacterStyle] = useState<CharacterStyle>(CharacterStyle.DEFAULT);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  useEffect(() => {
    const handlePlay = (e: Event) => {
      if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'audio') {
        setIsAudioPlaying(true);
      }
    };
    const handlePause = (e: Event) => {
      if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'audio') {
        setIsAudioPlaying(false);
      }
    };
    
    document.addEventListener('play', handlePlay, true);
    document.addEventListener('pause', handlePause, true);
    document.addEventListener('ended', handlePause, true);

    return () => {
      document.removeEventListener('play', handlePlay, true);
      document.removeEventListener('pause', handlePause, true);
      document.removeEventListener('ended', handlePause, true);
    };
  }, []);

  const handleGenerate = async (topic: string, voice: string, durationSeconds: number, aspectRatio: AspectRatio, visualStyle: VisualStyle, colorTheme: ColorTheme, storytellerName: string, faceMode: FaceMode, narrativeStructure: NarrativeStructure, targetAudience: TargetAudience, pitch: string, speed: string, characterAppearance: string, animationStyle: AnimationStyle, customEvent: string, backgroundPresence: BackgroundPresence, characterGender: CharacterGender, characterStyle: CharacterStyle, animationSpeed: AnimationSpeed, animationEasing: AnimationEasing, linkEmotionsToAnimation: boolean, interactiveBackgroundAction: string, creatorPersona: CreatorPersona) => {
    setActiveSavedId(Date.now().toString());
    setLoadingState(LoadingState.GENERATING_STORY);
    setIsGeneratingStory(true);
    setError(null);
    setCurrentTopic(topic);
    setCurrentVoice(voice);
    setCurrentDurationSeconds(durationSeconds);
    setCurrentAspectRatio(aspectRatio);
    setCurrentVisualStyle(visualStyle);
    setCurrentColorTheme(colorTheme);
    setCurrentStorytellerName(storytellerName);
    setCurrentFaceMode(faceMode);
    setCurrentNarrativeStructure(narrativeStructure);
    setCurrentTargetAudience(targetAudience);
    setCurrentCreatorPersona(creatorPersona);
    setCurrentPitch(pitch);
    setCurrentSpeed(speed);
    
    let finalAppearance = characterAppearance;
    if (characterGender && characterStyle) {
       finalAppearance = `Tipe Pilihan: ${characterGender !== CharacterGender.MIXED ? 'Perorangan' : 'Campuran/Grup'}, Gender: ${characterGender}, Gaya Berpakaian: ${characterStyle}. ${characterAppearance}`;
    }

    setCurrentCharacterAppearance(finalAppearance);
    setSelectedAnimation(animationStyle);
    setCurrentAnimationSpeed(animationSpeed);
    setCurrentAnimationEasing(animationEasing);
    setCurrentLinkEmotionsToAnimation(linkEmotionsToAnimation);
    setCurrentCustomEvent(customEvent);
    setCurrentBackgroundPresence(backgroundPresence);
    setCurrentInteractiveBackgroundAction(interactiveBackgroundAction);
    setCurrentCharacterGender(characterGender);
    setCurrentCharacterStyle(characterStyle);

    try {
      // Initialize content with empty story to show streaming
      setContent({
        story: "",
        audioUrl: null,
        imageUrl: null,
        videoPrompt: [],
        title: "",
        description: "",
        hashtags: [],
        characterDescription: finalAppearance || "Main character"
      });

      // Scroll to results immediately
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // 1. Generate Story
      const storyText = await geminiService.generateStoryText(
        topic, 
        durationSeconds, 
        storytellerName, 
        narrativeStructure, 
        targetAudience,
        customEvent,
        finalAppearance,
        (chunk) => {
          setContent(prev => prev ? { ...prev, story: prev.story + chunk } : null);
        },
        creatorPersona
      );
      
      if (!storyText) throw new Error("Gagal membuat cerita.");
      
      setIsGeneratingStory(false);
      setLoadingState(LoadingState.GENERATING_MEDIA);
      
      // 2. Start generations (Set loading states BEFORE setting content to avoid UI flicker)
      setIsGeneratingAudio(true);
      setIsGeneratingImage(true);
      setIsGeneratingMetadata(true);
      setIsGeneratingVideoPrompt(true);
      setIsGeneratingScienceEdu(true);

      // Generate Character Description First for Consistency
      const characterDescription = await geminiService.generateCharacterDescription(storyText, visualStyle, faceMode, finalAppearance);
      setContent(prev => prev ? { ...prev, characterDescription } : null);

      // Image (Parallel)
      geminiService.generateIllustration(storyText, aspectRatio, visualStyle, colorTheme, faceMode, characterDescription, durationSeconds)
        .then(imageUrl => {
          setContent(prev => prev ? { ...prev, imageUrl } : null);
        })
        .catch(err => console.error("Image generation failed", err))
        .finally(() => setIsGeneratingImage(false));

      // Science Education & Infographics (Parallel)
      geminiService.generateScienceEducationData(storyText, targetAudience)
        .then(scienceEdu => {
          setContent(prev => prev ? { ...prev, scienceEdu } : null);
        })
        .catch(err => console.error("Science education data generation failed", err))
        .finally(() => setIsGeneratingScienceEdu(false));

      // Metadata (Parallel)
      geminiService.generateMetadata(storyText, visualStyle, colorTheme)
        .then(metadata => {
          setContent(prev => prev ? { ...prev, ...metadata } : null);
        })
        .catch(err => console.error("Metadata generation failed", err))
        .finally(() => setIsGeneratingMetadata(false));

      // Audio (Sequential for Video Prompt dependency)
      let finalDuration = 0;
      const narrationText = extractNarration(storyText);
      try {
        const { url: audioUrl, duration } = await geminiService.generateSpeech(narrationText, voice, 'soothing', pitch, speed);
        setContent(prev => prev ? { ...prev, audioUrl } : null);
        setAudioDuration(duration);
        finalDuration = duration;
      } catch (err) {
        console.error("Audio generation failed", err);
      } finally {
        setIsGeneratingAudio(false);
      }

      // Video Prompt (Depends on Audio Duration)
      try {
        const estimatedDuration = narrationText.split(' ').length / 150 * 60;
        const durationToUse = finalDuration > 0 ? finalDuration : estimatedDuration;
        const videoPrompt = await geminiService.generateVideoPrompt(narrationText, durationToUse, visualStyle, colorTheme, aspectRatio, faceMode, characterDescription, durationSeconds, animationStyle, backgroundPresence, animationSpeed, animationEasing, linkEmotionsToAnimation, interactiveBackgroundAction);
        setContent(prev => prev ? { ...prev, videoPrompt: videoPrompt || [] } : null);
      } catch (err) {
        console.error("Video prompt generation failed", err);
      } finally {
        setIsGeneratingVideoPrompt(false);
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat membuat cerita.");
      setLoadingState(LoadingState.ERROR);
      setIsGeneratingStory(false);
    }
  };

  const handleRegenerateStory = () => {
    if (currentTopic) {
      handleGenerate(
        currentTopic, currentVoice, currentDurationSeconds, currentAspectRatio, currentVisualStyle, currentColorTheme, currentStorytellerName, currentFaceMode, currentNarrativeStructure, currentTargetAudience, currentPitch, currentSpeed, currentCharacterAppearance, selectedAnimation, currentCustomEvent, currentBackgroundPresence as BackgroundPresence, currentCharacterGender, currentCharacterStyle, currentAnimationSpeed, currentAnimationEasing, currentLinkEmotionsToAnimation, currentInteractiveBackgroundAction, currentCreatorPersona
      );
    }
  };

  const handleRegenerateAudio = async () => {
    if (!content?.story) return;
    setIsRegeneratingAudio(true);
    setError(null);
    try {
      const narrationText = extractNarration(content.story);
      const { url: audioUrl, duration } = await geminiService.generateSpeech(narrationText, currentVoice, 'soothing', currentPitch, currentSpeed);
      setContent(prev => prev ? { ...prev, audioUrl } : null);
      setAudioDuration(duration);
    } catch (err: any) {
      console.error("Failed to regenerate audio", err);
      setError(err.message || "Gagal membuat ulang audio.");
    } finally {
      setIsRegeneratingAudio(false);
    }
  };

  const handleRegenerateImage = async () => {
    const textToUse = content?.story || currentTopic;
    if (!textToUse) return;
    setIsRegeneratingImage(true);
    try {
      const imageUrl = await geminiService.generateIllustration(textToUse, currentAspectRatio, currentVisualStyle, currentColorTheme, currentFaceMode, undefined, currentDurationSeconds);
      setContent(prev => prev ? { ...prev, imageUrl } : null);
    } catch (err) {
      console.error("Failed to regenerate image", err);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const handleRegenerateVideoPrompt = async () => {
    if (!content?.story) return;
    setIsGeneratingVideoPrompt(true);
    try {
      const narrationText = extractNarration(content.story);
      const duration = audioDuration > 0 ? audioDuration : (narrationText.split(' ').length / 150 * 60);
      const videoPrompt = await geminiService.generateVideoPrompt(narrationText, duration, currentVisualStyle, currentColorTheme, currentAspectRatio, currentFaceMode, content.characterDescription, currentDurationSeconds, selectedAnimation, currentBackgroundPresence, currentAnimationSpeed, currentAnimationEasing, currentLinkEmotionsToAnimation, currentInteractiveBackgroundAction);
      setContent(prev => prev ? { ...prev, videoPrompt: videoPrompt || [] } : null);
    } catch (err) {
      console.error("Failed to regenerate video prompt", err);
    } finally {
      setIsGeneratingVideoPrompt(false);
    }
  };

  const handleUpdateScene = (index: number, updatedScene: any) => {
    if (!content) return;
    const newVideoPrompt = [...content.videoPrompt];
    newVideoPrompt[index] = updatedScene;
    setContent({ ...content, videoPrompt: newVideoPrompt });
  };

  // Check if everything is done to update main loading state if needed, 
  // though we primarily use the granular flags for UI now.
  React.useEffect(() => {
    if (!isGeneratingStory && !isGeneratingAudio && !isGeneratingImage && !isGeneratingVideoPrompt && !isGeneratingMetadata && !isGeneratingScienceEdu && content) {
      setLoadingState(LoadingState.COMPLETED);
      if (activeSavedId) {
        saveCurrentStoryState(content, activeSavedId);
      }
    }
  }, [isGeneratingStory, isGeneratingAudio, isGeneratingImage, isGeneratingVideoPrompt, isGeneratingMetadata, isGeneratingScienceEdu, content, activeSavedId]);

  const isAllCompleted = loadingState === LoadingState.COMPLETED;

  const getLoadingMessage = () => {
    if (isGeneratingStory) return "Menulis cerita...";
    if (isGeneratingImage) return "Membuat ilustrasi...";
    if (isGeneratingAudio) return "Mensintesis suara...";
    if (isGeneratingVideoPrompt) return "Menyusun video prompt...";
    if (isGeneratingMetadata) return "Menyiapkan metadata...";
    return "Memproses...";
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>
      <div className="min-h-screen bg-[#080c14] text-slate-100 pb-20 relative overflow-hidden">
        <ScientificBackdrop />
        <header className="bg-[#080c14]/85 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Zone 1: Brand title & badge */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <span className="text-lg">🧪</span>
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg text-white font-display tracking-tight flex items-center gap-1.5">
                  Cerita AI <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono font-medium">SCIENCE STUDIO</span>
                </span>
              </div>
            </div>
            
            {/* Zone 2: Nav links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Beranda</a>
              <a href="#saved-stories" className="hover:text-cyan-400 transition-colors">Riwayat Kisah</a>
              <a href="#input-form" className="hover:text-cyan-400 transition-colors">Studio Generator</a>
              <a href="#results-section" className="hover:text-cyan-400 transition-colors">Hasil & Video</a>
            </nav>

            {/* Zone 3: Studio Status Indicator */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Studio Aktif</span>
              </span>
            </div>
          </div>
        </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        <div id="saved-stories">
          <SavedStories
            savedStories={savedStories}
            activeSavedId={activeSavedId}
            onSelectStory={handleSelectStory}
            onDeleteStory={handleDeleteStory}
          />
        </div>

        <div id="input-form">
          <InputSection 
            onSubmit={handleGenerate} 
            loadingState={loadingState} 
            loadingMessage={getLoadingMessage()}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-950/40 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl border border-red-900/60 text-slate-200"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-300 font-medium">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <GenerationProgress 
          isGeneratingStory={isGeneratingStory}
          isGeneratingAudio={isGeneratingAudio}
          isGeneratingImage={isGeneratingImage}
          isGeneratingVideoPrompt={isGeneratingVideoPrompt}
          isGeneratingMetadata={isGeneratingMetadata}
          isGeneratingScienceEdu={isGeneratingScienceEdu}
          hasStarted={loadingState !== LoadingState.IDLE && loadingState !== LoadingState.COMPLETED && loadingState !== LoadingState.ERROR}
        />

        <AnimatePresence>
          {isGeneratingStory && (!content || content.story.length === 0) && (
            <motion.div 
              key="story-skeleton"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="mb-8"
            >
              <StorySkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {content && (
          <motion.div 
            ref={resultsRef} 
            id="results-section"
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            {(content.title || content.story.length > 0) && (
              <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <AnimatedTitle title={content.title} story={content.story} theme={currentColorTheme} />
              </motion.div>
            )}

            {(content.story.length > 0 || !isGeneratingStory) && (
              <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <StoryCard 
                  story={content.story} 
                  isGenerating={isGeneratingStory} 
                  currentTime={audioCurrentTime}
                  duration={audioDuration}
                  isAudioPlaying={isAudioPlaying}
                  onSeek={handleSeek}
                />
              </motion.div>
            )}
            
            {(content.scienceEdu || isGeneratingScienceEdu) && (
              <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <ScienceEducationBoard 
                  data={content.scienceEdu} 
                  isLoading={isGeneratingScienceEdu}
                />
              </motion.div>
            )}
            
            {content.imageUrl && (
              <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <VideoExporter
                  content={content}
                  aspectRatio={currentAspectRatio}
                  title={content.title}
                />
              </motion.div>
            )}

            <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
              <MediaCard 
                audioUrl={content.audioUrl} 
                imageUrl={content.imageUrl}
                title={content.title}
                onRegenerateAudio={handleRegenerateAudio}
                onRegenerateImage={handleRegenerateImage}
                isRegeneratingAudio={isRegeneratingAudio}
                isRegeneratingImage={isRegeneratingImage}
                isLoadingAudio={isGeneratingAudio}
                isLoadingImage={isGeneratingImage}
                audioRef={audioRef}
                onAudioTimeUpdate={setAudioCurrentTime}
                onAudioDurationChange={setAudioDuration}
                onAudioPlayStateChange={setIsAudioPlaying}
              />
            </motion.div>

            <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
              <VideoPromptCard 
                scenes={content.videoPrompt} 
                isLoading={isGeneratingVideoPrompt}
                onRegenerate={handleRegenerateVideoPrompt}
                isRegenerating={isGeneratingVideoPrompt}
                aspectRatio={currentAspectRatio}
                illustrationUrl={content.imageUrl}
                audioUrl={content.audioUrl}
              />
            </motion.div>
            
            <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
              <ImaginePromptCard 
                scenes={content.videoPrompt} 
                isLoading={isGeneratingVideoPrompt}
                aspectRatio={currentAspectRatio}
                visualStyle={currentVisualStyle}
                colorTheme={currentColorTheme}
              />
            </motion.div>

            {(content.title || isGeneratingMetadata) && (
              <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <MetadataCard 
                  title={content.title}
                  description={content.description}
                  hashtags={content.hashtags}
                  isLoading={isGeneratingMetadata}
                />
              </motion.div>
            )}

            {isAllCompleted && (
              <motion.div layout variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="flex flex-wrap justify-center mt-12 mb-8 gap-4">
                <button
                  onClick={handleRegenerateStory}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3.5 px-7 rounded-2xl shadow-xl shadow-cyan-950/40 transform transition hover:scale-105 flex items-center gap-2.5 text-sm cursor-pointer"
                >
                  <span>🔄</span> Buat Ulang Alur Cerita
                </button>
                <button
                  onClick={handleShare}
                  className="bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 font-bold py-3.5 px-7 rounded-2xl shadow-xl transform transition hover:scale-105 flex items-center gap-2.5 text-sm cursor-pointer"
                >
                  <span>🔗</span> Bagikan Hasil
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
    </>
  );
};

export default App;