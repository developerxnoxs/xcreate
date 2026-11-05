export interface FormState {
  brandLogo?: string | null;
  archTextEnabled?: boolean;
  title?: string;
  topic?: string;
  ratio: string;
  archType?: string;
  archStyle?: string;
  archPerspective?: string;
  archLighting?: string;
  archMaterials: string[];
  archAtmosphere: string[];
  archContextEnabled?: boolean;
  archContext?: string;
  archHumanScale?: string;
  archElements: string[];
  style: string;
  mode: string;
  category: string;
  subtitle?: string;
  content: string;
  cta?: string;
  contact?: string;
  watermark?: string;
  funfact?: string;
  instruction?: string;
  isTitleAuto?: boolean;
  isSubtitleAuto?: boolean;
  useCharacter?: string;
  character?: string;
  faceless?: string;
  hijab?: string;
  cadar?: string;
  comicPages?: string;
  comicStoryline?: string;
  comicEmotion?: string;
  isFunFactEnabled?: boolean;
  isFunFactAuto?: boolean;
  isContentAuto?: boolean;
  eduType?: string;
  slideCount?: string;
  carouselGoal?: string;
  carouselStructure?: string;
  carouselTone?: string;
  carouselMainVisuals: string[];
  carouselAddons: string[];
}

export interface PromptResult {
  json: string;
  description: string;
  carouselSlides?: { title: string; prompt: string }[];
}

export interface ScenePrompt {
  scene_id: number;
  duration: number;
  camera: {
    angle: string;
    zoom: string;
  };
  dialog: string;
  action: string;
  character_interactions?: string;
  image_prompt: string;
  video_prompt: string;
  sound_environment: string;
  transition: string;
  generated_video_url?: string | null;
}

export interface ScienceLearningPoint {
  icon: string;
  concept: string;
  explanation: string;
}

export interface ScienceDictionaryTerm {
  term: string;
  definition: string;
}

export interface ScienceQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ScienceEducationData {
  learningPoints: ScienceLearningPoint[];
  dictionary: ScienceDictionaryTerm[];
  quiz: ScienceQuizQuestion[];
}

export interface GeneratedContent {
  story: string;
  audioUrl: string | null;
  imageUrl: string | null;
  videoPrompt: ScenePrompt[];
  title: string;
  description: string;
  hashtags: string[];
  characterDescription?: string;
  scienceEdu?: ScienceEducationData | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_STORY = 'GENERATING_STORY',
  GENERATING_MEDIA = 'GENERATING_MEDIA',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9',
  CINEMATIC = '21:9'
}

export enum VisualStyle {
  PIXAR = 'Pixar Style',
  DISNEY = 'Disney Style',
  ANIME = 'Anime Style',
  REALISTIC = 'Realistic',
  WATERCOLOR = 'Watercolor',
  CYBERPUNK = 'Cyberpunk',
  PAPER_CUT = 'Paper Cut',
  CRAYON = 'Crayon Drawing',
  CARTOON = 'Classic Cartoon',
  SKETCH = 'Pencil Sketch',
  CLAYMATION = 'Claymation',
  POP_UP_BOOK = 'Pop-up Book',
  MOSAIC = 'Mosaic Art',
  THREE_D_CARTOON = '3D Cartoon',
  THREE_D_CGI = '3D CGI Cinematic',
  OIL_PAINTING = 'Oil Painting',
  PIXEL_ART = 'Pixel Art',
  FLAT_DESIGN = 'Flat Design',
  NOIR = 'Noir',
  GHIBLI = 'Ghibli Style',
  ABSTRACT = 'Abstract Expressionism',
  LOW_POLY = 'Low Poly',
  POINTILLISM = 'Pointillism',
  IMPRESSIONISM = 'Impressionism',
  CUBISM = 'Cubism',
  SURREALISM = 'Surrealism',
  POP_ART = 'Pop Art',
  ART_NOUVEAU = 'Art Nouveau',
  UKIYO_E = 'Ukiyo-e',
  ORIGAMI = 'Origami',
  STEAMPUNK = 'Steampunk',
  GOTHIC_ART = 'Gothic Art',
  ART_DECO = 'Art Deco',
  LEGO = 'Lego Style',
  SYNTHWAVE = 'Synthwave',
  VAPORWAVE = 'Vaporwave',
  FANTASY_REALISM = 'Fantasy Realism',
  DIORAMA = 'Diorama',
  STAINED_GLASS = 'Stained Glass',
  INK_WASH = 'Ink Wash'
}

export enum ColorTheme {
  WARM = 'Warm (Orange/Yellow)',
  COOL = 'Cool (Blue/Cyan)',
  VIBRANT = 'Vibrant & Colorful',
  PASTEL = 'Pastel & Soft',
  DARK = 'Dark & Moody',
  MONOCHROME = 'Monochrome',
  VINTAGE = 'Vintage & Retro',
  NATURE = 'Nature & Earthy',
  NEON = 'Neon & Cyber',
  ROYAL = 'Royal & Luxurious',
  ROMANTIC = 'Soft Romantic',
  OCEANIC = 'Oceanic & Fresh',
  SUNSET = 'Sunset Glow',
  AUTUMN = 'Autumn Warmth',
  WINTER = 'Winter Frost',
  CANDY = 'Candy Pop',
  FOREST = 'Forest Fantasy',
  FIRE = 'Fire & Lava',
  GALAXY = 'Galaxy & Cosmic',
  MINIMAL = 'Minimal & Clean',
  CUSTOM = 'Custom'
}

export enum FaceMode {
  WITH_FACE = 'WITH_FACE',
  FACELESS = 'FACELESS'
}



export enum Pitch {
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
  CUSTOM = 'custom'
}

export enum Speed {
  SLOW = 'slow',
  DEFAULT = 'default',
  FAST = 'fast',
  CUSTOM = 'custom'
}

export enum AnimationStyle {
  SMOOTH = 'SMOOTH',
  STOP_MOTION = 'STOP_MOTION',
  CARTOON_2D = '2D CARTOON',
  CARTOON_3D = '3D CARTOON',
  CLAYMATION = 'CLAYMATION',
  PIXAR_3D = 'PIXAR-STYLE 3D',
  TRADITIONAL_2D = 'TRADITIONAL 2D CEL ANIMATION',
  MOTION_GRAPHICS = 'MOTION GRAPHICS',
  STOP_MOTION_PUPPET = 'STOP-MOTION PUPPET',
  CGI_VFX_3D = '3D CGI & VFX Cinematic'
}

export enum AnimationSpeed {
  SLOW = 'Slow Motion',
  DEFAULT = 'Default Speed',
  FAST = 'Fast Motion/Timelapse',
  VARIES = 'Varies by Emotion'
}

export enum AnimationEasing {
  LINEAR = 'Linear (Constant Pace)',
  EASE_IN_OUT = 'Ease In-Out (Smooth start/stop)',
  BOUNCE = 'Bouncy/Elastic',
  SNAPPY = 'Snappy/Fast-Paced'
}

export enum TargetAudience {
  PAUD = 'PAUD (3-6 Years)',
  ELEMENTARY = 'Elementary School (7-12 Years)',
  TEENAGERS = 'Teenagers (13-18 Years)',
  ADULTS = 'Adults'
}

export enum CreatorPersona {
  YOUTUBE_PRO = 'Kreator Konten YouTube Profesional',
  MOTIVASI = 'Kreator Konten Motivasi YouTube',
  BISNIS_DIGITAL = 'Content Creator Bisnis Digital',
  ISLAMI = 'Penulis Konten Islami',
  HOROR = 'Penulis Cerita Horor Profesional',
  YOUTUBE_AI = 'Tim Produksi YouTube AI Profesional'
}

export enum NarrativeStructure {
  LINEAR = 'LINEAR',
  NON_LINEAR = 'NON_LINEAR',
  FLASHBACK = 'FLASHBACK',
  CIRCULAR = 'CIRCULAR',
  REVERSE_CHRONOLOGICAL = 'REVERSE_CHRONOLOGICAL'
}

export enum BackgroundPresence {
  NONE = 'None',
  BACKGROUND_ONLY = 'Background Only',
  INTERACTIVE = 'Interactive'
}

export enum CharacterGender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan',
  MIXED = 'Campuran'
}

export enum CharacterStyle {
  DEFAULT = 'Pakaian Biasa/Kasual',
  KOPYAH = 'Memakai Kopyah/Songkok/Peci',
  NO_KOPYAH = 'Tidak Memakai Kopyah',
  HIJAB = 'Berhijab/Kerudung',
  NO_HIJAB = 'Tidak Berhijab',
  TRADITIONAL_INDONESIAN = 'Pakaian Tradisional Nusantara Indonesia',
  ISLAMIC = 'Pakaian Islami',
  FANTASY_ARMOR = 'Baju Zirah/Pakaian Fantasi Petualang',
  SCHOOL_UNIFORM = 'Seragam Sekolah',
  SCI_FI_SUIT = 'Pakaian Sci-Fi/Futuristik',
  ROYALTY = 'Pakaian Kerajaan (Pangeran/Putri)',
  FARMER = 'Pakaian Petani/Pedesaan',
  WINTER = 'Pakaian Musim Dingin (Tebal)',
  SUMMER = 'Pakaian Musim Panas (Tipis)'
}

export enum DialogStyle {
  CUSTOM = 'Kustom (Ketik Sendiri/Autofill)',
  CHEERFUL = 'Ceria dan Bersemangat',
  CURIOUS = 'Penasaran dan Suka Bertanya',
  GRUMPY = 'Pemarah dan Ketus',
  FORMAL = 'Sopan dan Formal',
  INFORMAL = 'Santai dan Kasual',
  SHY = 'Pemalu dan Lembut',
  WISE = 'Bijaksana dan Tenang',
  FUNNY = 'Lucu dan Jenaka',
  SARCASTIC = 'Sarkastik dan Jahil',
}
export interface CharacterVoiceConfig {
  voice: string;
  pitch: Pitch;
  speed: Speed;
}

export interface SavedStory {
  id: string;
  timestamp: number;
  topic: string;
  creatorPersona: CreatorPersona;
  content: GeneratedContent;
  voice: string;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  visualStyle: VisualStyle;
  colorTheme: ColorTheme;
  storytellerName: string;
  faceMode: FaceMode;
  narrativeStructure: NarrativeStructure;
  targetAudience: TargetAudience;
  pitch: string;
  speed: string;
  characterAppearance: string;
  animationStyle: AnimationStyle;
  customEvent: string;
  backgroundPresence: BackgroundPresence;
  characterGender: CharacterGender;
  characterStyle: CharacterStyle;
  animationSpeed: AnimationSpeed;
  animationEasing: AnimationEasing;
  linkEmotionsToAnimation: boolean;
  interactiveBackgroundAction: string;
}

export interface CharacterAppearanceOptions { headwear: string; upperBodyClothing: string; lowerBodyClothing: string; footwear: string; accessories: string; customDetails: string; }

