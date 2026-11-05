import { buildCharacterAppearanceString } from '../utils';
import { CharacterAppearanceForm } from './CharacterAppearanceForm';
import { CharacterAppearanceOptions } from '../types';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState, AspectRatio, VisualStyle, ColorTheme, FaceMode, NarrativeStructure, TargetAudience, CreatorPersona, Pitch, Speed, AnimationStyle, AnimationSpeed, AnimationEasing, BackgroundPresence, CharacterGender, CharacterStyle, DialogStyle, CharacterVoiceConfig } from '../types';
import { VOICES } from '../constants';
import { Loader2, Sparkles, Lightbulb, ToggleLeft, ToggleRight, Sliders, Settings2, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { suggestStoryTopics, generateRandomCharacterAppearance, generateRandomCustomEvent, generateRandomInteractiveAction, suggestCharacterDialogStyles, generateRandomSecondaryCharacterAppearance, generateRandomTertiaryCharacterAppearance, suggestCharacterColors } from '../services/geminiService';

interface InputSectionProps {
  onSubmit: (topic: string, voice: string, durationSeconds: number, aspectRatio: AspectRatio, visualStyle: VisualStyle, colorTheme: ColorTheme, storytellerName: string, faceMode: FaceMode, narrativeStructure: NarrativeStructure, targetAudience: TargetAudience, pitch: string, speed: string, characterAppearance: string, animationStyle: AnimationStyle, customEvent: string, backgroundPresence: BackgroundPresence, characterGender: CharacterGender, characterStyle: CharacterStyle, animationSpeed: AnimationSpeed, animationEasing: AnimationEasing, linkEmotionsToAnimation: boolean, interactiveBackgroundAction: string, creatorPersona: CreatorPersona) => void;
  loadingState: LoadingState;
  loadingMessage?: string;
}

const NARRATIVE_STRUCTURE_OPTIONS = [
  { id: NarrativeStructure.LINEAR, label: 'Linear', description: 'Cerita mengalir dari awal sampai akhir secara berurutan.' },
  { id: NarrativeStructure.NON_LINEAR, label: 'Non-Linear', description: 'Cerita melompat-lompat waktu atau perspektif.' },
  { id: NarrativeStructure.FLASHBACK, label: 'Flashback', description: 'Cerita dimulai dari masa depan/sekarang lalu kembali ke masa lalu.' },
  { id: NarrativeStructure.CIRCULAR, label: 'Circular', description: 'Cerita berakhir di tempat yang sama saat dimulai.' },
  { id: NarrativeStructure.REVERSE_CHRONOLOGICAL, label: 'Reverse', description: 'Cerita diceritakan dari akhir ke awal.' },
];

const ASPECT_RATIO_OPTIONS = [
  { id: AspectRatio.SQUARE, label: '1:1 (Square)', description: 'Ideal untuk kiriman media sosial seperti Instagram.' },
  { id: AspectRatio.PORTRAIT, label: '9:16 (Portrait)', description: 'Sangat cocok untuk mobile, TikTok, dan Reels.' },
  { id: AspectRatio.LANDSCAPE, label: '16:9 (Landscape)', description: 'Format standar untuk YouTube dan layar desktop.' },
  { id: AspectRatio.CINEMATIC, label: '21:9 (Cinematic)', description: 'Format ultra-lebar untuk tampilan dramatis seperti bioskop.' },
];

const FACE_MODE_OPTIONS = [
  { id: FaceMode.WITH_FACE, label: 'Dengan Wajah', description: 'Karakter memiliki wajah yang ekspresif.' },
  { id: FaceMode.FACELESS, label: 'Tanpa Wajah (Faceless)', description: 'Karakter digambarkan dari belakang/samping untuk visual puitis.' },
];

const VISUAL_STYLE_OPTIONS = [
  { id: VisualStyle.PIXAR, label: 'Gaya Pixar 3D', description: 'Animasi 3D modern penuh warna ceria, tekstur halus, dan mata ekspresif.', icon: '🧸' },
  { id: VisualStyle.DISNEY, label: 'Gaya Disney Klasik', description: 'Animasi 2D klasik legendaris yang membawa aura magis layaknya dongeng.', icon: '✨' },
  { id: VisualStyle.ANIME, label: 'Gaya Anime', description: 'Animasi Jepang dengan mata besar, emosi mendalam, dan pencahayaan sinematik.', icon: '🎌' },
  { id: VisualStyle.REALISTIC, label: 'Fotorealistik', description: 'Detail super tinggi dengan pencahayaan layaknya kamera DSLR profesional.', icon: '📸' },
  { id: VisualStyle.WATERCOLOR, label: 'Cat Air (Watercolor)', description: 'Seni cat air yang lembut, dreamy, mengalir indah di atas tekstur kertas.', icon: '🖌️' },
  { id: VisualStyle.CYBERPUNK, label: 'Cyberpunk Sci-Fi', description: 'Masa depan futuristik dengan kontras tinggi dan pendaran lampu neon.', icon: '🤖' },
  { id: VisualStyle.PAPER_CUT, label: 'Layer Kertas (Paper Cut)', description: 'Seni kertas potong berlayer 3D dengan bayangan lembut bertekstur unik.', icon: '✂️' },
  { id: VisualStyle.CRAYON, label: 'Gambar Krayon', description: 'Gaya gambar lilin anak-anak yang polos, penuh warna-warni ceria yang ramah.', icon: '🖍️' },
  { id: VisualStyle.CARTOON, label: 'Kartun Retro', description: 'Kartun klasik dengan garis luar tebal (outline) dan gerakan elastis.', icon: '📺' },
  { id: VisualStyle.SKETCH, label: 'Sketsa Pensil', description: 'Gaya sketsa arsir tangan monokrom yang artistik dan bercita rasa tinggi.', icon: '✏️' },
  { id: VisualStyle.CLAYMATION, label: 'Stop-Motion Tanah Liat', description: 'Karakter tanah liat stop-motion layaknya mainan buatan tangan.', icon: '🏺' },
  { id: VisualStyle.POP_UP_BOOK, label: 'Buku Pop-up 3D', description: 'Elemen lingkungan mencuat ke atas saat halaman buku cerita dibuka.', icon: '📖' },
  { id: VisualStyle.MOSAIC, label: 'Mosaik Pola', description: 'Susunan ubin kaca patri atau keramik berwarna-warni geometris.', icon: '🧩' },
  { id: VisualStyle.THREE_D_CARTOON, label: 'Kartun 3D Modern', description: 'Visual 3D ramah anak dengan bentuk bulat lembut yang hangat.', icon: '🎈' },
  { id: VisualStyle.THREE_D_CGI, label: 'CGI Sinematik AAA', description: 'Tekstur fisik realistis (PBR) dengan kedalaman bokeh sinematik tinggi.', icon: '🎮' },
  { id: VisualStyle.OIL_PAINTING, label: 'Lukisan Cat Minyak', description: 'Sapuan kuas tebal (impasto) artistik layaknya mahakarya museum.', icon: '🖼️' },
  { id: VisualStyle.PIXEL_ART, label: 'Seni Pixel Retro', description: 'Nostalgia game arcade 16-bit klasik dengan kotak-kotak piksel rapi.', icon: '👾' },
  { id: VisualStyle.FLAT_DESIGN, label: 'Flat Vector Modern', description: 'Ilustrasi vektor bersih, minimalis, dan sangat elegan.', icon: '📐' },
  { id: VisualStyle.NOIR, label: 'Noir Hitam Putih', description: 'Atmosfer dramatis film kriminal klasik dengan kontras bayangan tajam.', icon: '🕵️' },
  { id: VisualStyle.GHIBLI, label: 'Gaya Ghibli Magis', description: 'Latar pemandangan alam rimbun, tenang, dan penuh keajaiban damai.', icon: '🍃' },
  { id: VisualStyle.ABSTRACT, label: 'Ekspresi Abstrak', description: 'Komposisi bentuk dan warna bebas untuk menyampaikan emosi puitis.', icon: '🌀' },
  { id: VisualStyle.LOW_POLY, label: 'Poli Rendah (Low Poly)', description: 'Bentuk geometris bersudut tajam menciptakan kesan modern minimalis.', icon: '🔷' },
  { id: VisualStyle.POINTILLISM, label: 'Titik Pointillisme', description: 'Lukisan indah yang sepenuhnya tersusun dari ribuan titik warna halus.', icon: '⚫' },
  { id: VisualStyle.IMPRESSIONISM, label: 'Impresionisme', description: 'Menangkap kilasan cahaya alami dengan sapuan warna cepat berenergi.', icon: '🎨' },
];

const COLOR_THEME_OPTIONS = [
  { id: ColorTheme.WARM, label: 'Warm & Cozy', description: 'Nuansa hangat sore hari', icon: '🌅' },
  { id: ColorTheme.COOL, label: 'Cool & Mystical', description: 'Biru tenang & misterius', icon: '❄️' },
  { id: ColorTheme.VIBRANT, label: 'Vibrant & Playful', description: 'Warna-warni berenergi tinggi', icon: '🌈' },
  { id: ColorTheme.PASTEL, label: 'Pastel & Sweet', description: 'Warna lembut menenangkan', icon: '🌸' },
  { id: ColorTheme.DARK, label: 'Dark & Moody', description: 'Atmosfer dramatis malam', icon: '🌑' },
  { id: ColorTheme.MONOCHROME, label: 'Monokrom Klasik', description: 'Hitam putih abadi', icon: '🎹' },
  { id: ColorTheme.NATURE, label: 'Nature & Forest', description: 'Warna organik alam hijau', icon: '🌿' },
  { id: ColorTheme.NEON, label: 'Neon Cyber', description: 'Warna berpendar masa depan', icon: '⚡' },
  { id: ColorTheme.SUNSET, label: 'Matahari Terbenam', description: 'Gradasi senja jingga ungu', icon: '🌅' },
  { id: ColorTheme.GALAXY, label: 'Galaksi Kosmik', description: 'Bintang luar angkasa ungu biru', icon: '🌌' },
];

const TARGET_AUDIENCE_OPTIONS = [
  { id: TargetAudience.PAUD, label: 'PAUD (3-6 Tahun)', description: 'Sains sederhana & keajaiban alam dengan visual interaktif dan alur sangat mudah dipahami.', icon: '🧸', focus: 'Keajaiban Alam Dasar' },
  { id: TargetAudience.ELEMENTARY, label: 'SD (7-12 Tahun)', description: 'Petualangan seru mengeksplorasi eksperimen, makhluk purba, tata surya, dan rahasia fisika.', icon: '🧪', focus: 'Eksperimen & Penjelajahan' },
  { id: TargetAudience.TEENAGERS, label: 'Remaja (13-18 Tahun)', description: 'Konsep sains mendalam, fiksi ilmiah astronomi, teknologi futuristik, dan misteri kosmos teoretis.', icon: '🔬', focus: 'Misteri Kosmos & Teori' },
  { id: TargetAudience.ADULTS, label: 'Dewasa (19+ Tahun)', description: 'Eksplorasi teoretis filosofis, mekanika kuantum, kosmologi, dan sejarah revolusi penemuan sains.', icon: '🧠', focus: 'Sains Filosofis Mendalam' },
];

const CREATOR_PERSONA_OPTIONS = [
  { id: CreatorPersona.YOUTUBE_PRO, label: 'Kreator YouTube Pro', description: 'Gaya visual dinamis, hook pembuka kuat, narasi menarik ala konten modern YouTube.' },
  { id: CreatorPersona.MOTIVASI, label: 'Motivasi YouTube', description: 'Kisah penuh inspirasi, dorongan moral, emosional, dan nilai kebijaksanaan hidup.' },
  { id: CreatorPersona.BISNIS_DIGITAL, label: 'Bisnis Digital', description: 'Konsep bisnis, taktik marketing, startup, dan inovasi teknologi digital.' },
  { id: CreatorPersona.ISLAMI, label: 'Konten Islami', description: 'Kisah religius, akhlak luhur, dipandu bahasa santun ramah keluarga.' },
  { id: CreatorPersona.HOROR, label: 'Horor Profesional', description: 'Atmosfer menegangkan, misterius, hawa dingin mencekam, dan plot twist mendebarkan.' },
  { id: CreatorPersona.YOUTUBE_AI, label: 'YouTube AI Pro', description: 'Struktur adegan logis, efisien, optimal untuk transisi generator gambar-ke-video AI.' },
];

const ANIMATION_STYLE_OPTIONS = [
  { id: AnimationStyle.SMOOTH, label: 'Lancar & Alami (SMOOTH)', description: 'Gerakan fluida lembut', icon: '🌊' },
  { id: AnimationStyle.STOP_MOTION, label: 'Stop Motion', description: 'Frame-by-frame artistik', icon: '📸' },
  { id: AnimationStyle.CARTOON_2D, label: 'Kartun 2D', description: 'Gaya animasi datar klasik', icon: '📺' },
  { id: AnimationStyle.PIXAR_3D, label: '3D Pixar-Style', description: 'Animasi 3D kaya ekspresi', icon: '🧸' },
  { id: AnimationStyle.MOTION_GRAPHICS, label: 'Motion Graphics', description: 'Seni grafis bergerak presisi', icon: '✨' },
];

const ANIMATION_SPEED_OPTIONS = [
  { id: AnimationSpeed.DEFAULT, label: 'Normal', icon: '⏱️' },
  { id: AnimationSpeed.SLOW, label: 'Sangat Lambat (Slow-mo)', icon: '🐢' },
  { id: AnimationSpeed.FAST, label: 'Cepat (Timelapse)', icon: '🐇' },
  { id: AnimationSpeed.VARIES, label: 'Menyesuaikan Emosi', icon: '🎢' }
];

const ANIMATION_EASING_OPTIONS = [
  { id: AnimationEasing.LINEAR, label: 'Linier', icon: '📏' },
  { id: AnimationEasing.EASE_IN_OUT, label: 'Ease In-Out', icon: '〰️' },
  { id: AnimationEasing.BOUNCE, label: 'Membal (Bouncy)', icon: '🏀' },
  { id: AnimationEasing.SNAPPY, label: 'Cepat Tanggap (Snappy)', icon: '⚡' }
];

const PRESETS = [
  { id: 'fantasy_adventure', label: 'Fantasy Adventure', visualStyle: VisualStyle.GHIBLI, colorTheme: ColorTheme.FOREST, icon: '🌲' },
  { id: 'sci_fi_noir', label: 'Sci-Fi Noir', visualStyle: VisualStyle.CYBERPUNK, colorTheme: ColorTheme.DARK, icon: '🌃' },
  { id: 'magical_dream', label: 'Magical Dream', visualStyle: VisualStyle.WATERCOLOR, colorTheme: ColorTheme.PASTEL, icon: '🦄' },
  { id: 'retro_arcade', label: 'Retro Arcade', visualStyle: VisualStyle.PIXEL_ART, colorTheme: ColorTheme.NEON, icon: '🕹️' },
  { id: 'classic_fairytale', label: 'Classic Fairytale', visualStyle: VisualStyle.DISNEY, colorTheme: ColorTheme.ROYAL, icon: '🏰' },
];

export const CURATED_SCIENCE_TOPICS = [
  "Misteri Perjalanan Foton Cahaya dari Inti Matahari Menuju Bumi Selama 100.000 Tahun",
  "Petualangan Kapsul Nano Menjelajahi Sistem Kekebalan Tubuh Melawan Pasukan Virus",
  "Ekspedisi Menembus Gravitasi Ekstrem di Sekitar Cakrawala Peristiwa Lubang Hitam",
  "Kisah Dua Atom Hidrogen dan Satu Atom Oksigen Menari Membentuk Molekul Air Pertama",
  "Detektif DNA: Memecahkan Misteri Kode Genetik dan Sintesis Protein di Dalam Inti Sel",
  "Menyelam ke Lautan Bawah Es di Bulan Europa Mencari Jejak Kehidupan Ekstraterestrial",
  "Rahasia Superkonduktor: Ketika Elektron Meluncur Bebas Tanpa Hambatan di Suhu Arktik",
  "Dapur Magma Gunung Berapi: Bagaimana Pergeseran Lempeng Tektonik Melahirkan Benua",
  "Perjalanan Dinosaurus Purba yang Bertransformasi Menjadi Minyak Bumi dan Siklus Karbon",
  "Mengapa Langit Berwarna Biru dan Senja Memerah: Rahasia Hamburan Spektrum Cahaya Rayleigh",
  "Ledakan Epik Supernova: Pabrik Kosmik yang Menciptakan Unsur Emas dan Besi di Alam Semesta",
  "Petualangan Listrik Statis: Dari Petir Menggelegar di Awan Hingga Kejutan Halus di Ujung Jari"
];


const PITCH_OPTIONS = [
  { id: Pitch.LOW, label: 'Rendah (Low)' },
  { id: Pitch.DEFAULT, label: 'Normal (Default)' },
  { id: Pitch.HIGH, label: 'Tinggi (High)' },
  { id: Pitch.CUSTOM, label: 'Kustom (Custom)' },
];

const SPEED_OPTIONS = [
  { id: Speed.SLOW, label: 'Lambat (Slow)' },
  { id: Speed.DEFAULT, label: 'Normal (Default)' },
  { id: Speed.FAST, label: 'Cepat (Fast)' },
  { id: Speed.CUSTOM, label: 'Kustom (Custom)' },
];

const BACKGROUND_PRESENCE_OPTIONS = [
  { id: BackgroundPresence.NONE, label: 'Tanpa Karakter Latar', description: 'Lingkungan fokus murni pada karakter utama', icon: '⬛' },
  { id: BackgroundPresence.BACKGROUND_ONLY, label: 'Latar Belakang Aktif', description: 'Lingkungan hidup dengan aktivitas mandiri', icon: '🖼️' },
  { id: BackgroundPresence.INTERACTIVE, label: 'Interaktif Penuh', description: 'Lingkungan bereaksi aktif terhadap emosi cerita', icon: '🎭' },
];

const CHARACTER_ARCHETYPE_PRESETS = [
  { id: 'wise_elder', label: '🧙‍♂️ Wise Elder (Kakek Bijak)', pitch: Pitch.LOW, speed: Speed.SLOW, dialog: 'Bijaksana, tenang, banyak kiasan sains' },
  { id: 'professor_sains', label: '👨‍🔬 Professor (Eksentrik)', pitch: Pitch.DEFAULT, speed: Speed.FAST, dialog: 'Sangat antusias, jenius, gemar mempraktekkan eksperimen' },
  { id: 'curious_child', label: '👧 Curious Child (Sangat Penasaran)', pitch: Pitch.HIGH, speed: Speed.FAST, dialog: 'Gemar bertanya "kenapa?", ceria, penuh energi eksploratif' },
  { id: 'shy_fairy', label: '🧚‍♀️ Shy Fairy (Peri Pemalu)', pitch: Pitch.HIGH, speed: Speed.SLOW, dialog: 'Suara lembut bertutur indah tentang keajaiban alam' }
];

// Curated Visual Presets for Simple Mode
const SIMPLE_VISUAL_PRESETS = [
  { id: 'pixar', label: '3D Pixar Klasik', icon: '🧸', style: VisualStyle.PIXAR, color: ColorTheme.WARM, desc: 'Warna hangat, kaya emosi, bersahabat.' },
  { id: 'ghibli', label: 'Ghibli Magis', icon: '🍃', style: VisualStyle.GHIBLI, color: ColorTheme.NATURE, desc: 'Indah, rimbun, keajaiban sains & alam.' },
  { id: 'watercolor', label: 'Lukisan Cat Air', icon: '🖌️', style: VisualStyle.WATERCOLOR, color: ColorTheme.PASTEL, desc: 'Estetik, lembut, layaknya mimpi fiksi.' },
  { id: 'cgi', label: 'CGI Sinematik', icon: '🎮', style: VisualStyle.THREE_D_CGI, color: ColorTheme.GALAXY, desc: 'Gaya luar angkasa, megah, detail fiksi ilmiah.' },
  { id: 'anime', label: 'Anime Jepang', icon: '🎌', style: VisualStyle.ANIME, color: ColorTheme.VIBRANT, desc: 'Dinamis, penuh warna, ekspresi kuat.' },
  { id: 'crayon', label: 'Krayon Lucu', icon: '🖍️', style: VisualStyle.CRAYON, color: ColorTheme.PASTEL, desc: 'Gaya polos, sangat disukai anak-anak.' }
];

export const InputSection: React.FC<InputSectionProps> = ({ onSubmit, loadingState, loadingMessage }) => {
  const [topic, setTopic] = useState('');
  const [narratorVoice, setNarratorVoice] = useState<CharacterVoiceConfig>({ voice: 'Puck', pitch: Pitch.DEFAULT, speed: Speed.DEFAULT });
  const [customPitch, setCustomPitch] = useState<string>('');
  const [customSpeed, setCustomSpeed] = useState<string>('');
  
  const [durationSeconds, setDurationSeconds] = useState<number>(90);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<VisualStyle>(VisualStyle.THREE_D_CARTOON);
  const [selectedColorTheme, setSelectedColorTheme] = useState<ColorTheme>(ColorTheme.WARM);
  const [customColorTheme, setCustomColorTheme] = useState<string>('');
  const [storytellerName, setStorytellerName] = useState<string>('Kakak Riza');
  const [selectedFaceMode, setSelectedFaceMode] = useState<FaceMode>(FaceMode.WITH_FACE);
  const [selectedNarrativeStructure, setSelectedNarrativeStructure] = useState<NarrativeStructure>(NarrativeStructure.LINEAR);
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<TargetAudience>(TargetAudience.ELEMENTARY);
  const [selectedCreatorPersona, setSelectedCreatorPersona] = useState<CreatorPersona>(CreatorPersona.YOUTUBE_PRO);
  
  const [primaryVoice, setPrimaryVoice] = useState<CharacterVoiceConfig>({ voice: 'Puck', pitch: Pitch.DEFAULT, speed: Speed.DEFAULT });
  const [characterAppearance, setCharacterAppearance] = useState<CharacterAppearanceOptions>({ headwear: '', upperBodyClothing: '', lowerBodyClothing: '', footwear: '', accessories: '', customDetails: '' });
  const [primaryCharacterDialog, setPrimaryCharacterDialog] = useState<string>('');

  const [secondaryVoice, setSecondaryVoice] = useState<CharacterVoiceConfig>({ voice: 'Kore', pitch: Pitch.DEFAULT, speed: Speed.DEFAULT });
  const [secondaryCharacterAppearance, setSecondaryCharacterAppearance] = useState<CharacterAppearanceOptions>({ headwear: '', upperBodyClothing: '', lowerBodyClothing: '', footwear: '', accessories: '', customDetails: '' });
  const [secondaryCharacterDialog, setSecondaryCharacterDialog] = useState<string>('');

  const [tertiaryVoice, setTertiaryVoice] = useState<CharacterVoiceConfig>({ voice: 'Fenrir', pitch: Pitch.DEFAULT, speed: Speed.DEFAULT });
  const [tertiaryCharacterAppearance, setTertiaryCharacterAppearance] = useState<CharacterAppearanceOptions>({ headwear: '', upperBodyClothing: '', lowerBodyClothing: '', footwear: '', accessories: '', customDetails: '' });
  const [tertiaryCharacterDialog, setTertiaryCharacterDialog] = useState<string>('');

  const [selectedAnimation, setSelectedAnimation] = useState<AnimationStyle>(AnimationStyle.SMOOTH);
  const [selectedAnimationSpeed, setSelectedAnimationSpeed] = useState<AnimationSpeed>(AnimationSpeed.DEFAULT);
  const [selectedAnimationEasing, setSelectedAnimationEasing] = useState<AnimationEasing>(AnimationEasing.EASE_IN_OUT);
  const [linkEmotionsToAnimation, setLinkEmotionsToAnimation] = useState<boolean>(true);
  const [dynamicBackgroundPresence, setDynamicBackgroundPresence] = useState<boolean>(true);
  const [customEvent, setCustomEvent] = useState<string>('');
  const [selectedBackgroundPresence, setSelectedBackgroundPresence] = useState<BackgroundPresence>(BackgroundPresence.INTERACTIVE);
  const [interactiveBackgroundAction, setInteractiveBackgroundAction] = useState<string>('Karakter latar secara aktif merespon kejadian utama, seperti menunjuk dengan kagum, tersenyum lebar, atau bertepuk tangan menyesuaikan emosi cerita.');
  const [selectedCharacterGender, setSelectedCharacterGender] = useState<CharacterGender>(CharacterGender.MALE);
  const [selectedCharacterStyle, setSelectedCharacterStyle] = useState<CharacterStyle>(CharacterStyle.DEFAULT);
  
  // Refined Simple / Pro UI Switch State
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [activeSimpleVisualId, setActiveSimpleVisualId] = useState<string>('pixar');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestFeedback, setSuggestFeedback] = useState<string | null>(null);
  const topicIndexRef = React.useRef<number>(0);
  const [isGeneratingAppearance, setIsGeneratingAppearance] = useState(false);
  const [isGeneratingSecondaryAppearance, setIsGeneratingSecondaryAppearance] = useState(false);
  const [isGeneratingTertiaryAppearance, setIsGeneratingTertiaryAppearance] = useState(false);
  const [isGeneratingCustomEvent, setIsGeneratingCustomEvent] = useState(false);
  const [isGeneratingInteractiveAction, setIsGeneratingInteractiveAction] = useState(false);
  const [isGeneratingDialogStyles, setIsGeneratingDialogStyles] = useState(false);
  const [isGeneratingColors, setIsGeneratingColors] = useState(false);
  const [isGeneratingSecondaryColors, setIsGeneratingSecondaryColors] = useState(false);
  const [isGeneratingTertiaryColors, setIsGeneratingTertiaryColors] = useState(false);

  const handleAutofillColors = async () => {
    setIsGeneratingColors(true);
    try {
      const colors = await suggestCharacterColors(topic, characterAppearance);
      if (colors) {
        setCharacterAppearance(prev => ({ ...prev, customDetails: colors }));
      }
    } catch (error) {
      console.error("Failed to autofill colors", error);
    } finally {
      setIsGeneratingColors(false);
    }
  };

  const handleAutofillSecondaryColors = async () => {
    setIsGeneratingSecondaryColors(true);
    try {
      const colors = await suggestCharacterColors(topic, secondaryCharacterAppearance);
      if (colors) {
        setSecondaryCharacterAppearance(prev => ({ ...prev, customDetails: colors }));
      }
    } catch (error) {
      console.error("Failed to autofill secondary colors", error);
    } finally {
      setIsGeneratingSecondaryColors(false);
    }
  };

  const handleAutofillTertiaryColors = async () => {
    setIsGeneratingTertiaryColors(true);
    try {
      const colors = await suggestCharacterColors(topic, tertiaryCharacterAppearance);
      if (colors) {
        setTertiaryCharacterAppearance(prev => ({ ...prev, customDetails: colors }));
      }
    } catch (error) {
      console.error("Failed to autofill tertiary colors", error);
    } finally {
      setIsGeneratingTertiaryColors(false);
    }
  };

  const handleAutofillAppearance = async () => {
    setIsGeneratingAppearance(true);
    try {
      const appearance = await generateRandomCharacterAppearance(topic);
      if (appearance) {
        setCharacterAppearance(prev => ({ ...prev, ...appearance }));
      }
    } catch (error) {
      console.error("Failed to autofill appearance", error);
    } finally {
      setIsGeneratingAppearance(false);
    }
  };

  const handleAutofillSecondaryAppearance = async () => {
    setIsGeneratingSecondaryAppearance(true);
    try {
      const appearance = await generateRandomSecondaryCharacterAppearance(topic);
      if (appearance) {
        setSecondaryCharacterAppearance(prev => ({ ...prev, ...appearance }));
      }
    } catch (error) {
      console.error("Failed to autofill secondary appearance", error);
    } finally {
      setIsGeneratingSecondaryAppearance(false);
    }
  };

  const handleAutofillTertiaryAppearance = async () => {
    setIsGeneratingTertiaryAppearance(true);
    try {
      const appearance = await generateRandomTertiaryCharacterAppearance(topic);
      if (appearance) {
        setTertiaryCharacterAppearance(prev => ({ ...prev, ...appearance }));
      }
    } catch (error) {
      console.error("Failed to autofill tertiary appearance", error);
    } finally {
      setIsGeneratingTertiaryAppearance(false);
    }
  };

  const handleAutofillCustomEvent = async () => {
    setIsGeneratingCustomEvent(true);
    try {
      const event = await generateRandomCustomEvent(topic);
      if (event) {
        setCustomEvent(event);
      }
    } catch (error) {
      console.error("Failed to autofill custom event", error);
    } finally {
      setIsGeneratingCustomEvent(false);
    }
  };

  const handleAutofillInteractiveAction = async () => {
    setIsGeneratingInteractiveAction(true);
    try {
      const action = await generateRandomInteractiveAction(topic);
      if (action) {
        setInteractiveBackgroundAction(action);
      }
    } catch (error) {
      console.error("Failed to autofill interactive action", error);
    } finally {
      setIsGeneratingInteractiveAction(false);
    }
  };

  const handleAutofillDialogStyles = async () => {
    setIsGeneratingDialogStyles(true);
    try {
      const styles = await suggestCharacterDialogStyles(topic, buildCharacterAppearanceString(characterAppearance), buildCharacterAppearanceString(secondaryCharacterAppearance), buildCharacterAppearanceString(tertiaryCharacterAppearance));
      if (styles.primary) setPrimaryCharacterDialog(styles.primary);
      if (styles.secondary) setSecondaryCharacterDialog(styles.secondary);
      if (styles.tertiary) setTertiaryCharacterDialog(styles.tertiary);
    } catch (error) {
      console.error("Failed to autofill dialog styles", error);
    } finally {
      setIsGeneratingDialogStyles(false);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    
    // Pick topic immediately from CURATED_SCIENCE_TOPICS so the user experiences 0ms latency
    const availableTopics = CURATED_SCIENCE_TOPICS;
    const nextIdx = (topicIndexRef.current + 1) % availableTopics.length;
    topicIndexRef.current = nextIdx;
    const pickedTopic = availableTopics[nextIdx];
    
    // 1. Instantly populate the input field!
    setTopic(pickedTopic);
    
    // 2. Pick 3 distinct alternative suggestions
    const alternativeTopics = availableTopics
      .filter((t) => t !== pickedTopic)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setSuggestions(alternativeTopics);
    
    setSuggestFeedback("✨ Topik sains ajaib berhasil dipilih! Klik lagi untuk ide lain.");
    setTimeout(() => {
      setSuggestFeedback(null);
    }, 3500);

    // 3. Concurrently fetch fresh dynamic suggestions from AI backend
    try {
      const aiSuggestions = await suggestStoryTopics();
      if (aiSuggestions && aiSuggestions.length > 0) {
        const filtered = aiSuggestions.filter(s => s !== pickedTopic);
        if (filtered.length > 0) {
          setSuggestions(filtered.slice(0, 3));
        }
      }
    } catch (error) {
      console.warn("Background AI suggestions fallback in use:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      const finalColorTheme = selectedColorTheme === ColorTheme.CUSTOM ? customColorTheme : selectedColorTheme;
      const finalPitch = narratorVoice.pitch === Pitch.CUSTOM ? customPitch : narratorVoice.pitch;
      const finalSpeed = narratorVoice.speed === Speed.CUSTOM ? customSpeed : narratorVoice.speed;
      
      const combinedAppearance = [
         buildCharacterAppearanceString(characterAppearance) ? `Penampilan Karakter Utama: ${buildCharacterAppearanceString(characterAppearance)}` : '',
         primaryCharacterDialog ? `Gaya Dialog/Logat Karakter Utama: ${primaryCharacterDialog} (Suara: ${primaryVoice.voice}, Nada: ${primaryVoice.pitch}, Kecepatan: ${primaryVoice.speed})` : '',
         buildCharacterAppearanceString(secondaryCharacterAppearance) ? `Penampilan Karakter Pendukung: ${buildCharacterAppearanceString(secondaryCharacterAppearance)}` : '',
         secondaryCharacterDialog ? `Gaya Dialog/Logat Karakter Pendukung: ${secondaryCharacterDialog} (Suara: ${secondaryVoice.voice}, Nada: ${secondaryVoice.pitch}, Kecepatan: ${secondaryVoice.speed})` : '',
         buildCharacterAppearanceString(tertiaryCharacterAppearance) ? `Penampilan Karakter Pendukung Kedua: ${buildCharacterAppearanceString(tertiaryCharacterAppearance)}` : '',
         tertiaryCharacterDialog ? `Gaya Dialog/Logat Karakter Pendukung Kedua: ${tertiaryCharacterDialog} (Suara: ${tertiaryVoice.voice}, Nada: ${tertiaryVoice.pitch}, Kecepatan: ${tertiaryVoice.speed})` : ''
      ].filter(Boolean).join(' | ');

      let finalBackgroundPresence = selectedBackgroundPresence;
      if (dynamicBackgroundPresence) {
        if (durationSeconds <= 60) {
           finalBackgroundPresence = BackgroundPresence.NONE;
        } else if (durationSeconds > 180) {
           finalBackgroundPresence = BackgroundPresence.INTERACTIVE;
        } else {
           const simpleStyles = [VisualStyle.FLAT_DESIGN, VisualStyle.PAPER_CUT, VisualStyle.LOW_POLY, VisualStyle.SKETCH, VisualStyle.NOIR, VisualStyle.ABSTRACT];
           if (simpleStyles.includes(selectedVisualStyle)) {
             finalBackgroundPresence = BackgroundPresence.NONE;
           } else {
             finalBackgroundPresence = BackgroundPresence.BACKGROUND_ONLY;
           }
        }
      }

      let finalInteractiveAction = interactiveBackgroundAction;
      if (dynamicBackgroundPresence || finalBackgroundPresence !== BackgroundPresence.INTERACTIVE) {
        finalInteractiveAction = '';
      }

      onSubmit(topic, narratorVoice.voice, durationSeconds, selectedAspectRatio, selectedVisualStyle, finalColorTheme as ColorTheme, storytellerName, selectedFaceMode, selectedNarrativeStructure, selectedTargetAudience, finalPitch, finalSpeed, combinedAppearance, selectedAnimation, customEvent, finalBackgroundPresence, selectedCharacterGender, selectedCharacterStyle, selectedAnimationSpeed, selectedAnimationEasing, linkEmotionsToAnimation, finalInteractiveAction, selectedCreatorPersona);
    }
  };

  const isProcessing = loadingState !== LoadingState.IDLE && loadingState !== LoadingState.COMPLETED && loadingState !== LoadingState.ERROR;

  // Handler for quick curated visual selection in Simple Mode
  const handleSelectSimpleVisual = (presetId: string, style: VisualStyle, colorTheme: ColorTheme) => {
    setActiveSimpleVisualId(presetId);
    setSelectedVisualStyle(style);
    setSelectedColorTheme(colorTheme);
  };

  return (
    <section className="max-w-4xl mx-auto text-center mb-12">
      {/* Title Header Section */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          INTERACTIVE SCIENCE & AI STORYTELLING STUDIO
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 font-display mt-2 mb-3 tracking-tight">
          xCreate Studio Cerita Sains AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Kembangkan imajinasi dan pemahaman sains melalui dongeng ajaib, narasi bersuara sintetis, ilustrasi beresolusi tinggi, dan pengarah video sinematik.
        </p>
      </div>

      {/* Mode Toggle Bar */}
      <div className="flex p-1 bg-slate-950/80 rounded-2xl gap-1 mb-8 max-w-xs mx-auto border border-slate-800 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsProMode(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            !isProMode
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Mode Cepat
        </button>
        <button
          type="button"
          onClick={() => setIsProMode(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            isProMode
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Studio Pro
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl mx-auto">
        
        {/* ===================== ZONE 1: CORE TOPIC INPUT (ALWAYS VISIBLE) ===================== */}
        <div className="bg-[#0b0f19]/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4 text-left">
          <div className="flex justify-between items-center">
            <label htmlFor="story-topic" className="text-white font-bold text-sm md:text-base flex items-center gap-2">
              <span>🚀</span> Topik / Konsep Sains Utama:
            </label>
            <button
              type="button"
              onClick={handleSuggest}
              disabled={isSuggesting || isProcessing}
              title="Klik untuk memilih ide topik sains menarik secara instan!"
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border border-cyan-500/40 hover:border-cyan-400 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-cyan-500/20 shadow-inner"
            >
              {isSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" /> : <Lightbulb className="w-3.5 h-3.5 text-amber-300 animate-pulse" />}
              <span>Inspirasi Sains Ajaib</span>
            </button>
          </div>

          <AnimatePresence>
            {suggestFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <span>{suggestFeedback}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative">
            <input
              id="story-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isProcessing}
              placeholder="Contoh: Petualangan atom hidrogen dan oksigen membentuk molekul air di bumi..."
              className="w-full px-5 py-4 text-sm sm:text-base rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all pr-32 shadow-inner"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isProcessing || !topic.trim() || (selectedColorTheme === ColorTheme.CUSTOM && !customColorTheme.trim())}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 text-xs sm:text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer border border-indigo-400/30"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="hidden sm:inline">Memproses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Mulai Cerita</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-3 border-t border-slate-800/80 mt-2 space-y-1.5"
              >
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <span>💡 Ide pilihan lainnya (klik untuk gunakan):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setTopic(suggestion);
                        const remaining = CURATED_SCIENCE_TOPICS.filter(t => t !== suggestion).sort(() => 0.5 - Math.random()).slice(0, 3);
                        setSuggestions(remaining);
                      }}
                      className="text-xs text-left bg-slate-900/90 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-200 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors font-medium cursor-pointer shadow-sm active:scale-95"
                    >
                      ✨ {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ===================== ZONE 2: SIMPLE MODE CONTENT (HIDES PRO COMPLEXITY) ===================== */}
        {!isProMode ? (
          <div className="space-y-6">
            
            {/* Simple Target Audience Selection */}
            <div className="bg-[#0b0f19]/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="text-left">
                <h4 className="text-white font-bold text-sm md:text-base flex items-center gap-2">
                  <span>🎯</span> Level Edukasi Sains & Target Umur:
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Membantu menyelaraskan kedalaman materi sains yang dijelaskan oleh AI.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TARGET_AUDIENCE_OPTIONS.map((opt) => {
                  const isSelected = selectedTargetAudience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setSelectedTargetAudience(opt.id as TargetAudience)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-full relative cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/50 ring-1 ring-indigo-400 shadow-lg shadow-indigo-500/20'
                          : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl filter drop-shadow">{opt.icon}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <h5 className="font-bold font-display text-xs sm:text-sm text-white">{opt.label}</h5>
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">{opt.description}</p>
                      </div>
                      <div className="mt-3.5 text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg text-center">
                        🔭 {opt.focus}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simple Visual Styles Pre-curated Grid */}
            <div className="bg-[#0b0f19]/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="text-left">
                <h4 className="text-white font-bold text-sm md:text-base flex items-center gap-2">
                  <span>🎨</span> Gaya Visual Animasi:
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Pilih tampilan artistik yang disukai untuk merender ilustrasi cerita.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {SIMPLE_VISUAL_PRESETS.map((preset) => {
                  const isSelected = activeSimpleVisualId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleSelectSimpleVisual(preset.id, preset.style, preset.color)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center text-center h-full relative cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/50 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                          : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-3xl filter drop-shadow mb-2">{preset.icon}</span>
                      <h5 className="font-bold font-display text-xs text-white line-clamp-1">{preset.label}</h5>
                      <span className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">{preset.desc}</span>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simple Voice / Storyteller Narrator Picker */}
            <div className="bg-[#0b0f19]/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="text-left">
                <h4 className="text-white font-bold text-sm md:text-base flex items-center gap-2">
                  <span>🎙️</span> Suara Pencerita:
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Pilih persona pembawa cerita sains yang imersif dan khas.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { id: 'Grandpa', icon: '👴', name: 'Kakek Bijak', tone: 'Legenda', pitch: Pitch.LOW, speed: Speed.SLOW },
                  { id: 'Fairy', icon: '🧚', name: 'Peri Magis', tone: 'Ajaib', pitch: Pitch.HIGH, speed: Speed.DEFAULT },
                  { id: 'Professor', icon: '👨‍🔬', name: 'Profesor Sains', tone: 'Energetik', pitch: Pitch.DEFAULT, speed: Speed.FAST },
                  { id: 'Detective', icon: '🕵️', name: 'Detektif Noir', tone: 'Misteri', pitch: Pitch.LOW, speed: Speed.DEFAULT },
                  { id: 'Robot', icon: '🤖', name: 'Robot AI', tone: 'Mekanis', pitch: Pitch.DEFAULT, speed: Speed.DEFAULT },
                ].map((profile) => {
                  const isSelected = narratorVoice.voice === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setNarratorVoice({
                          voice: profile.id,
                          pitch: profile.pitch,
                          speed: profile.speed
                        });
                        setStorytellerName(profile.name);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center justify-between relative cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/50 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                          : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-1.5 filter drop-shadow">{profile.icon}</span>
                        <h5 className="font-bold font-display text-xs text-white">{profile.name}</h5>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md mt-2">
                        {profile.tone}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simple Config Footer */}
            <div className="bg-slate-950/70 rounded-3xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-1">
                <span className="text-[11px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">Konfigurasi Aktif</span>
                <p className="text-xs text-slate-300">
                  Durasi Narasi: <strong className="text-white font-bold">{durationSeconds} Detik</strong> · Pencerita: <strong className="text-white font-bold">{storytellerName}</strong> · Aspek Layar: <strong className="text-white font-bold">{selectedAspectRatio}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProMode(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white text-xs font-bold rounded-xl border border-indigo-500/30 shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Kustomisasi Studio (Pro)
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          // ===================== ZONE 3: PRO MODE FULL CONFIGURATION (DETAILED PANEL) =====================
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Primary Storyteller Custom Config */}
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 text-white">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <span className="text-xl">🎙️</span>
                <div className="text-left">
                  <h4 className="text-sm font-bold font-display text-white">1. Konfigurasi Narator & Profil Cerita</h4>
                  <p className="text-[11px] text-slate-400">Sesuaikan karakter narrator, durasi, target umur, dan persona kreator edukasi sains.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Voice Speaker */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="voice-select" className="text-slate-300 font-medium text-xs flex items-center gap-1">
                    🎙️ Karakter Suara:
                  </label>
                  <select
                    id="voice-select"
                    value={narratorVoice.voice}
                    onChange={(e) => setNarratorVoice(prev => ({ ...prev, voice: e.target.value }))}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full"
                  >
                    {VOICES.map((v) => <option key={v.id} value={v.id} className="bg-slate-950 text-slate-200">{v.label}</option>)}
                  </select>
                </div>

                {/* Pitch Customization */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="pitch-select" className="text-slate-300 font-medium text-xs flex items-center gap-1">
                    🎵 Nada Suara:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="pitch-select"
                      value={narratorVoice.pitch}
                      onChange={(e) => setNarratorVoice(prev => ({ ...prev, pitch: e.target.value as Pitch }))}
                      disabled={isProcessing}
                      className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full"
                    >
                      {PITCH_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.label}</option>)}
                    </select>
                    {narratorVoice.pitch === Pitch.CUSTOM && (
                      <input
                        type="text"
                        value={customPitch}
                        onChange={(e) => setCustomPitch(e.target.value)}
                        disabled={isProcessing}
                        placeholder="sangat tinggi"
                        className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 outline-none block p-2 w-28 placeholder:text-slate-600"
                      />
                    )}
                  </div>
                </div>

                {/* Speech Speed Customization */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="speed-select" className="text-slate-300 font-medium text-xs flex items-center gap-1">
                    ⏱️ Kecepatan Suara:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="speed-select"
                      value={narratorVoice.speed}
                      onChange={(e) => setNarratorVoice(prev => ({ ...prev, speed: e.target.value as Speed }))}
                      disabled={isProcessing}
                      className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full"
                    >
                      {SPEED_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.label}</option>)}
                    </select>
                    {narratorVoice.speed === Speed.CUSTOM && (
                      <input
                        type="text"
                        value={customSpeed}
                        onChange={(e) => setCustomSpeed(e.target.value)}
                        disabled={isProcessing}
                        placeholder="sangat cepat"
                        className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 outline-none block p-2 w-28 placeholder:text-slate-600"
                      />
                    )}
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="duration-slider" className="text-slate-300 font-medium text-xs flex items-center justify-between">
                    <span>⏱️ Target Durasi:</span>
                    <span className="text-cyan-400 font-bold font-mono">{durationSeconds}s</span>
                  </label>
                  <input
                    id="duration-slider"
                    type="range"
                    min={15}
                    max={300}
                    step={15}
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    disabled={isProcessing}
                    className="accent-cyan-500 cursor-pointer w-full my-auto"
                  />
                </div>

                {/* Narrative Arc Structure */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="narrative-select" className="text-slate-300 font-medium text-xs flex items-center gap-1">
                    📖 Alur Struktur:
                  </label>
                  <select
                    id="narrative-select"
                    value={selectedNarrativeStructure}
                    onChange={(e) => setSelectedNarrativeStructure(e.target.value as NarrativeStructure)}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full"
                  >
                    {NARRATIVE_STRUCTURE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.label}</option>)}
                  </select>
                </div>

                {/* Creator Persona Style */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="creator-persona-select" className="text-slate-300 font-medium text-xs flex items-center gap-1">
                    🎬 Persona Kreator AI:
                  </label>
                  <select
                    id="creator-persona-select"
                    value={selectedCreatorPersona}
                    onChange={(e) => setSelectedCreatorPersona(e.target.value as CreatorPersona)}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full"
                  >
                    {CREATOR_PERSONA_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.label}</option>)}
                  </select>
                </div>

                {/* Storyteller Name */}
                <div className="flex flex-col gap-1.5 text-left md:col-span-3">
                  <label htmlFor="storyteller-name" className="text-slate-300 font-medium text-xs flex items-center gap-1">
                    👤 Nama Pencerita / Host Sains:
                  </label>
                  <input
                    id="storyteller-name"
                    type="text"
                    value={storytellerName}
                    onChange={(e) => setStorytellerName(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Contoh: Profesor Nova / Kakak Riza"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-700/80 bg-slate-900/90 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                {/* Target Audience selection in Pro */}
                <div className="flex flex-col gap-2 md:col-span-3 border-t border-slate-800/80 pt-4 mt-2">
                  <label className="text-slate-300 font-medium text-xs text-left">
                    🎯 Target Pembaca & Tingkat Sains:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {TARGET_AUDIENCE_OPTIONS.map((opt) => {
                      const isSelected = selectedTargetAudience === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setSelectedTargetAudience(opt.id as TargetAudience)}
                          className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-full relative cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500/80 bg-cyan-950/30 shadow-lg shadow-cyan-950/30'
                              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-xl filter drop-shadow-sm">{opt.icon}</span>
                            <h5 className="font-bold text-xs text-white">{opt.label}</h5>
                            <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Character Creator forms */}
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 text-white">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <span className="text-xl">🧑</span>
                <div className="text-left">
                  <h4 className="text-sm font-bold font-display text-white">2. Kreator Karakter & Pakaian (Character Creator)</h4>
                  <p className="text-[11px] text-slate-400">Desain penampilan karakter utama, pendukung, warna, serta gaya bicaranya.</p>
                </div>
              </div>

              {/* Character Gender & Basic Style Options */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCharacterGender}
                  onChange={(e) => {
                    setSelectedCharacterGender(e.target.value as CharacterGender);
                    setSelectedCharacterStyle(CharacterStyle.DEFAULT);
                  }}
                  disabled={isProcessing}
                  className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-3 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full sm:w-1/2"
                >
                  <option value={CharacterGender.MALE} className="bg-slate-950 text-slate-200">👦 Laki-laki</option>
                  <option value={CharacterGender.FEMALE} className="bg-slate-950 text-slate-200">👧 Perempuan</option>
                  <option value={CharacterGender.MIXED} className="bg-slate-950 text-slate-200">🧑‍🤝‍🧑 Campuran (Grup/Dua Karakter)</option>
                </select>

                <select
                  value={selectedCharacterStyle}
                  onChange={(e) => setSelectedCharacterStyle(e.target.value as CharacterStyle)}
                  disabled={isProcessing}
                  className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-3 outline-none hover:border-slate-600 transition-colors cursor-pointer w-full sm:w-1/2"
                >
                  <option value={CharacterStyle.DEFAULT} className="bg-slate-950 text-slate-200">👕 Pakaian Biasa/Kasual</option>
                  {selectedCharacterGender === CharacterGender.MALE && (
                    <optgroup label="Spesifik Gender (Laki-laki)" className="bg-slate-950 text-slate-400 font-bold">
                      <option value={CharacterStyle.KOPYAH} className="bg-slate-950 text-slate-200">Memakai Kopyah/Songkok</option>
                      <option value={CharacterStyle.NO_KOPYAH} className="bg-slate-950 text-slate-200">Tidak Memakai Kopyah</option>
                    </optgroup>
                  )}
                  {selectedCharacterGender === CharacterGender.FEMALE && (
                    <optgroup label="Spesifik Gender (Perempuan)" className="bg-slate-950 text-slate-400 font-bold">
                      <option value={CharacterStyle.HIJAB} className="bg-slate-950 text-slate-200">🧕 Berhijab/Kerudung</option>
                      <option value={CharacterStyle.NO_HIJAB} className="bg-slate-950 text-slate-200">👩 Tidak Berhijab</option>
                    </optgroup>
                  )}
                  <optgroup label="Pakaian Tematik" className="bg-slate-950 text-slate-400 font-bold">
                    <option value={CharacterStyle.SCHOOL_UNIFORM} className="bg-slate-950 text-slate-200">🎒 Seragam Sekolah</option>
                    <option value={CharacterStyle.TRADITIONAL_INDONESIAN} className="bg-slate-950 text-slate-200">👘 Tradisional Nusantara</option>
                    <option value={CharacterStyle.ISLAMIC} className="bg-slate-950 text-slate-200">🌙 Pakaian Islami</option>
                    <option value={CharacterStyle.FANTASY_ARMOR} className="bg-slate-950 text-slate-200">⚔️ Baju Zirah/Fantasi</option>
                    <option value={CharacterStyle.ROYALTY} className="bg-slate-950 text-slate-200">👑 Pakaian Kerajaan</option>
                    <option value={CharacterStyle.SCI_FI_SUIT} className="bg-slate-950 text-slate-200">🚀 Pakaian Sci-Fi/Futuristik</option>
                    <option value={CharacterStyle.FARMER} className="bg-slate-950 text-slate-200">🌾 Pakaian Petani/Pedesaan</option>
                    <option value={CharacterStyle.WINTER} className="bg-slate-950 text-slate-200">🧣 Pakaian Musim Dingin</option>
                  </optgroup>
                </select>
              </div>

              {/* Primary Character appearance */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <label className="text-white font-bold text-xs flex items-center gap-1">
                    👤 Penampilan Karakter Utama:
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillAppearance}
                    disabled={isGeneratingAppearance || isProcessing}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 cursor-pointer font-bold transition-colors"
                  >
                    {isGeneratingAppearance ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Autofill Karakter
                  </button>
                </div>
                <CharacterAppearanceForm 
                  value={characterAppearance} 
                  onChange={setCharacterAppearance} 
                  disabled={isProcessing} 
                  prefixId="primary-character" 
                  onAutofillColors={handleAutofillColors}
                  isGeneratingColors={isGeneratingColors}
                />
              </div>

              {/* Primary character vocal / dialogue profile */}
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-bold text-xs">
                    💬 Gaya Bicara & Vokal Karakter Utama:
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillDialogStyles}
                    disabled={isGeneratingDialogStyles || isProcessing}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 font-bold cursor-pointer transition-colors"
                  >
                    {isGeneratingDialogStyles ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Saran Dialog
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value=""
                    onChange={(e) => {
                      const preset = CHARACTER_ARCHETYPE_PRESETS.find(p => p.id === e.target.value);
                      if (preset) {
                        setPrimaryVoice(prev => ({ ...prev, pitch: preset.pitch }));
                        setPrimaryVoice(prev => ({ ...prev, speed: preset.speed }));
                        setPrimaryCharacterDialog(preset.dialog);
                      }
                      e.target.value = "";
                    }}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl block p-2.5 outline-none hover:border-slate-600 cursor-pointer"
                  >
                    <option value="" className="bg-slate-950 text-slate-300">✨ Terapkan Preset Karakter...</option>
                    {CHARACTER_ARCHETYPE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id} className="bg-slate-950 text-slate-200">{preset.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={primaryCharacterDialog}
                    onChange={(e) => setPrimaryCharacterDialog(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Gaya bicara (Contoh: Penuh rasa ingin tahu, kritis)..."
                    className="px-3 py-2 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 outline-none w-full bg-slate-900/90 text-slate-200 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Secondary Character Customization */}
              <div className="space-y-4 border-t border-slate-800/80 pt-5 mt-2">
                <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <label className="text-white font-bold text-xs">
                    🧑 Penampilan Karakter Pendukung (Opsional):
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillSecondaryAppearance}
                    disabled={isGeneratingSecondaryAppearance || isProcessing}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 cursor-pointer font-bold transition-colors"
                  >
                    {isGeneratingSecondaryAppearance ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Autofill
                  </button>
                </div>
                <CharacterAppearanceForm 
                  value={secondaryCharacterAppearance} 
                  onChange={setSecondaryCharacterAppearance} 
                  disabled={isProcessing} 
                  prefixId="secondary-character"
                  onAutofillColors={handleAutofillSecondaryColors}
                  isGeneratingColors={isGeneratingSecondaryColors}
                />
                <input
                  type="text"
                  value={secondaryCharacterDialog}
                  onChange={(e) => setSecondaryCharacterDialog(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Gaya bicara karakter pendukung..."
                  className="px-3 py-2 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 outline-none w-full bg-slate-900/90 text-slate-200 placeholder:text-slate-600"
                />
              </div>

              {/* Tertiary Character Customization */}
              <div className="space-y-4 border-t border-slate-800/80 pt-5 mt-2">
                <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <label className="text-white font-bold text-xs">
                    🧑 Penampilan Karakter Pendukung Kedua (Opsional):
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillTertiaryAppearance}
                    disabled={isGeneratingTertiaryAppearance || isProcessing}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 cursor-pointer font-bold transition-colors"
                  >
                    {isGeneratingTertiaryAppearance ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Autofill
                  </button>
                </div>
                <CharacterAppearanceForm 
                  value={tertiaryCharacterAppearance} 
                  onChange={setTertiaryCharacterAppearance} 
                  disabled={isProcessing} 
                  prefixId="tertiary-character" 
                  onAutofillColors={handleAutofillTertiaryColors}
                  isGeneratingColors={isGeneratingTertiaryColors}
                />
                <input
                  type="text"
                  value={tertiaryCharacterDialog}
                  onChange={(e) => setTertiaryCharacterDialog(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Gaya bicara karakter pendukung kedua..."
                  className="px-3 py-2 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 outline-none w-full bg-slate-900/90 text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Custom Events / Scene Actions */}
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-4 text-left text-white">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h4 className="text-sm font-bold font-display text-white">3. Kejadian Khusus / Plot Twist Cerita</h4>
                <button
                  type="button"
                  onClick={handleAutofillCustomEvent}
                  disabled={isGeneratingCustomEvent || isProcessing}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 font-bold cursor-pointer transition-colors"
                >
                  {isGeneratingCustomEvent ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Autofill Kejadian
                </button>
              </div>
              <textarea
                id="custom-event"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                disabled={isProcessing}
                placeholder="Masukkan momen ilmiah penting atau twist dalam cerita. Contoh: Rover mendeteksi lapisan es di bawah tanah Mars saat badai pasir datang!"
                className="w-full px-4 py-3 text-xs rounded-xl border border-slate-700/80 bg-slate-900/90 text-slate-200 focus:border-cyan-500 outline-none h-20 resize-none placeholder:text-slate-600"
              />
            </div>

            {/* Advanced Camera and Cinematic parameters */}
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 text-left text-white">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <span className="text-xl">🎬</span>
                <div>
                  <h4 className="text-sm font-bold font-display text-white">4. Pengaturan Latar Belakang & Detail Kamera</h4>
                  <p className="text-[11px] text-slate-400">Konfigurasi dimensi media render, framing visual, gaya seni, dan kurva gerak kamera.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Aspect Ratio */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ratio-select" className="text-slate-300 font-medium text-xs">📐 Dimensi Layar (Aspect Ratio):</label>
                  <select
                    id="ratio-select"
                    value={selectedAspectRatio}
                    onChange={(e) => setSelectedAspectRatio(e.target.value as AspectRatio)}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl p-2.5 cursor-pointer outline-none focus:border-cyan-500"
                  >
                    {ASPECT_RATIO_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.label}</option>)}
                  </select>
                </div>

                {/* Face Mode */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="face-mode-select" className="text-slate-300 font-medium text-xs">👤 Tampilan Detil Wajah:</label>
                  <select
                    id="face-mode-select"
                    value={selectedFaceMode}
                    onChange={(e) => setSelectedFaceMode(e.target.value as FaceMode)}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl p-2.5 cursor-pointer outline-none focus:border-cyan-500"
                  >
                    {FACE_MODE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.label}</option>)}
                  </select>
                </div>

                {/* Visual Style Selection in Pro */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="style-select" className="text-slate-300 font-medium text-xs">🎨 Gaya Ilustrasi:</label>
                  <select
                    id="style-select"
                    value={selectedVisualStyle}
                    onChange={(e) => setSelectedVisualStyle(e.target.value as VisualStyle)}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl p-2.5 cursor-pointer outline-none focus:border-cyan-500"
                  >
                    {VISUAL_STYLE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.icon} {opt.label}</option>)}
                  </select>
                </div>

                {/* Color Palette in Pro */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="color-select" className="text-slate-300 font-medium text-xs">🌈 Palet Warna:</label>
                  <select
                    id="color-select"
                    value={selectedColorTheme}
                    onChange={(e) => setSelectedColorTheme(e.target.value as ColorTheme)}
                    disabled={isProcessing}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl p-2.5 cursor-pointer outline-none focus:border-cyan-500"
                  >
                    {COLOR_THEME_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.icon} {opt.label}</option>)}
                    <option value={ColorTheme.CUSTOM} className="bg-slate-950 text-slate-200">✨ Kustom...</option>
                  </select>
                  {selectedColorTheme === ColorTheme.CUSTOM && (
                    <input
                      type="text"
                      value={customColorTheme}
                      onChange={(e) => setCustomColorTheme(e.target.value)}
                      placeholder="Tema warna kustom..."
                      className="px-3 py-2 mt-1 border border-slate-700/80 bg-slate-900/90 text-slate-200 text-xs rounded-xl"
                      disabled={isProcessing}
                    />
                  )}
                </div>

                {/* Background Presence Picker */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bg-presence-select" className="text-slate-300 font-medium text-xs">👥 Kepadatan Lingkungan Latar:</label>
                  <select
                    id="bg-presence-select"
                    value={dynamicBackgroundPresence ? "" : selectedBackgroundPresence}
                    onChange={(e) => setSelectedBackgroundPresence(e.target.value as BackgroundPresence)}
                    disabled={isProcessing || dynamicBackgroundPresence}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-xl p-2.5 cursor-pointer outline-none focus:border-cyan-500"
                  >
                    {dynamicBackgroundPresence ? (
                      <option value="" className="bg-slate-950 text-slate-300">✨ Dinamis / Auto-sync</option>
                    ) : BACKGROUND_PRESENCE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.icon} {opt.label}</option>)}
                  </select>
                </div>

                {/* Dynamic Background check */}
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={dynamicBackgroundPresence}
                      onChange={(e) => setDynamicBackgroundPresence(e.target.checked)}
                      disabled={isProcessing}
                      className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700"
                    />
                    Sesuaikan Kepadatan Latar Otomatis
                  </label>
                </div>
              </div>

              {/* Specific interactive action if selected */}
              {!dynamicBackgroundPresence && selectedBackgroundPresence === BackgroundPresence.INTERACTIVE && (
                <div className="flex flex-col gap-1.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-300 font-bold">Aksi Interaksi Karakter Latar Belakang:</label>
                    <button
                      type="button"
                      onClick={handleAutofillInteractiveAction}
                      disabled={isGeneratingInteractiveAction || isProcessing}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 font-bold cursor-pointer transition-colors"
                    >
                      {isGeneratingInteractiveAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Autofill Aksi
                    </button>
                  </div>
                  <textarea
                    value={interactiveBackgroundAction}
                    onChange={(e) => setInteractiveBackgroundAction(e.target.value)}
                    disabled={isProcessing}
                    className="bg-slate-950/80 text-slate-200 border border-slate-700/80 rounded-xl text-xs p-3 min-h-[50px] outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Interactive Physics & Easing options */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h5 className="text-xs font-bold text-cyan-400">🎞️ Kecepatan Gerak Kamera & Kurva Easing</h5>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 font-medium">
                    <input
                      type="checkbox"
                      checked={linkEmotionsToAnimation}
                      onChange={(e) => setLinkEmotionsToAnimation(e.target.checked)}
                      disabled={isProcessing}
                      className="w-3.5 h-3.5 text-cyan-500 rounded bg-slate-900 border-slate-700"
                    />
                    Auto-sync Emosi
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">Gaya Animasi:</span>
                    <select
                      value={linkEmotionsToAnimation ? "" : selectedAnimation}
                      onChange={(e) => setSelectedAnimation(e.target.value as AnimationStyle)}
                      disabled={isProcessing || linkEmotionsToAnimation}
                      className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-lg p-2 outline-none focus:border-cyan-500"
                    >
                      {linkEmotionsToAnimation ? <option value="" className="bg-slate-950 text-slate-300">✨ Dinamis (Auto)</option> : ANIMATION_STYLE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.icon} {opt.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">Kecepatan Gerak:</span>
                    <select
                      value={linkEmotionsToAnimation ? "" : selectedAnimationSpeed}
                      onChange={(e) => setSelectedAnimationSpeed(e.target.value as AnimationSpeed)}
                      disabled={isProcessing || linkEmotionsToAnimation}
                      className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-lg p-2 outline-none focus:border-cyan-500"
                    >
                      {linkEmotionsToAnimation ? <option value="" className="bg-slate-950 text-slate-300">✨ Dinamis (Auto)</option> : ANIMATION_SPEED_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.icon} {opt.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">Kurva Easing:</span>
                    <select
                      value={linkEmotionsToAnimation ? "" : selectedAnimationEasing}
                      onChange={(e) => setSelectedAnimationEasing(e.target.value as AnimationEasing)}
                      disabled={isProcessing || linkEmotionsToAnimation}
                      className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs rounded-lg p-2 outline-none focus:border-cyan-500"
                    >
                      {linkEmotionsToAnimation ? <option value="" className="bg-slate-950 text-slate-300">✨ Dinamis (Auto)</option> : ANIMATION_EASING_OPTIONS.map((opt) => <option key={opt.id} value={opt.id} className="bg-slate-950 text-slate-200">{opt.icon} {opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets row in Pro Mode */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap gap-2 items-center justify-between text-left">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">⚡ Preset Kombinasi Visual:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedVisualStyle(preset.visualStyle);
                      setSelectedColorTheme(preset.colorTheme);
                    }}
                    disabled={isProcessing}
                    className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700/80 transition-colors font-medium shadow-sm cursor-pointer"
                  >
                    {preset.icon} {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </section>
  );
};
