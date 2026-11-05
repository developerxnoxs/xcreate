import { decodeBase64, createWavUrl } from "./audioUtils";
import { ScenePrompt, FaceMode, NarrativeStructure, TargetAudience, CreatorPersona, Pitch, Speed, AnimationSpeed, AnimationEasing, CharacterAppearanceOptions, ScienceEducationData } from "../types";

export const STYLE_INSTRUCTIONS: Record<string, string> = {
  "Pixar Style": "Render 3D, karakter lucu, pencahayaan cerah, tekstur halus, detail tinggi, mata ekspresif.",
  "Disney Style": "Gaya animasi gambar tangan 2D, atmosfer magis, tampilan Disney klasik, warna lembut.",
  "Anime Style": "Gaya animasi Jepang, mata besar, latar belakang detail, ekspresi emosional.",
  "Realistic": "Fotorealistik, detail tinggi, pencahayaan sinematik, tekstur realistis.",
  "Watercolor": "Lukisan cat air lembut, artistik, atmosfer seperti mimpi, sapuan kuas lembut, tekstur kertas.",
  "Cyberpunk": "Futuristik, lampu neon, kontras tinggi, elemen sci-fi, tekstur metalik.",
  "Paper Cut": "Gaya kerajinan kertas berlapis, kedalaman bidang, kotak bayangan, tampilan kertas bertekstur.",
  "Crayon Drawing": "Gambar seperti anak-anak, tekstur krayon lilin, warna primer cerah, goresan kasar di kertas.",
  "Classic Cartoon": "Gaya kartun vintage, garis tebal, warna datar, fitur berlebihan, nuansa animasi 1930-1990an.",
  "Pencil Sketch": "Gambar pensil grafit, arsir, cross-hatching, sketsa artistik, monokrom atau sepia.",
  "Claymation": "Tekstur plastisin/tanah liat, tampilan stop-motion, pencahayaan lembut, nuansa nyata, estetika buatan tangan.",
  "Pop-up Book": "Gaya rekayasa kertas, lapisan kertas 3D, tekstur kertas lipat, kedalaman, nuansa buku cerita.",
  "Mosaic Art": "Pola ubin rumit, tekstur kaca atau keramik cerah, bentuk geometris, komposisi artistik.",
  "3D Cartoon": "Gaya animasi 3D modern. Berikan lingkungan dan karakter tampilan yang modern, ramah, dan sangat mudah didekati (approachable) agar sangat menarik bagi anak-anak.",
  "Oil Painting": "Gaya lukisan minyak klasik, sapuan kuas terlihat, warna kaya, kanvas bertekstur, pencahayaan artistik.",
  "Pixel Art": "Gaya seni piksel retro 8-bit atau 16-bit, palet warna terbatas, bentuk kotak-kotak, nuansa game nostalgia.",
  "Flat Design": "Ilustrasi datar modern, garis bersih, warna berani, tanpa gradasi, minimalis, gaya seni vektor.",
  "Noir": "Gaya film noir hitam putih, kontras tinggi, bayangan dramatis, atmosfer misterius, pencahayaan sinematik.",
  "Ghibli Style": "Gaya animasi Studio Ghibli, latar belakang detail yang rimbun, karakter unik, pencahayaan alami lembut, realisme magis.",
  "Abstract Expressionism": "Gaya seni abstrak, sapuan kuas kacau, warna emosional, bentuk non-representasional, interpretasi artistik.",
  "Low Poly": "Gaya seni 3D poligon rendah, bentuk geometris, tepi tajam, bayangan datar, tampilan 3D minimalis.",
  "Pointillism": "Teknik melukis dengan titik-titik kecil warna murni yang berbaur di mata pemirsa, detail halus, tekstur unik.",
  "Impressionism": "Gaya lukisan yang menangkap kesan visual sesaat, sapuan kuas pendek dan tebal, warna cerah, penekanan pada cahaya.",
  "Cubism": "Objek dipecah, dianalisis, dan disusun kembali dalam bentuk abstrak, berbagai sudut pandang sekaligus, geometris.",
  "Surrealism": "Pemandangan mimpi yang aneh, penjajaran objek yang tidak logis, elemen fantastis, gaya Salvador Dali/Rene Magritte.",
  "Pop Art": "Gaya seni populer, warna cerah dan berani, garis tebal, citra komik, gaya Andy Warhol/Roy Lichtenstein.",
  "Art Nouveau": "Garis organik yang mengalir, motif bunga dan tanaman, bentuk asimetris, dekoratif, elegan.",
  "Ukiyo-e": "Gaya cetakan kayu Jepang klasik, garis luar tegas, warna datar, perspektif unik, tekstur kertas washi.",
  "Origami": "Seni lipat kertas 3D, bentuk geometris, tepi kertas tajam, tekstur kertas, pencahayaan studio.",
  "Steampunk": "Gaya retro-futuristik, elemen mekanik, roda gigi, kuningan, tembaga, era Victoria, mesin uap.",
  "Gothic Art": "Gaya gotik, gelap, misterius, bayangan dramatis, arsitektur megah, atmosfer muram.",
  "Art Deco": "Gaya Art Deco 1920-an, elegan, pola geometris, simetris, warna emas dan hitam, mewah.",
  "Lego Style": "Terbuat dari bata plastik Lego, tampilan 3D, blok bangunan, tekstur plastik, warna-warni, mainan.",
  "Synthwave": "Retro-futurisme 80-an, grid neon, warna magenta dan cyan, efek cahaya synthwave, pemandangan digital.",
  "Vaporwave": "Aestetika Vaporwave 90-an, patung klasik berwarna neon, warna pastel glitch, tata letak surealis, elemen UI retro.",
  "Fantasy Realism": "Realisme fantasi skala epik, pencahayaan sinematik yang intens, makhluk magis, detail luar biasa, mahakarya.",
  "Diorama": "Dunia miniatur kecil, kedalaman bidang yang sempit (tilt-shift), objek makro, pencahayaan studio terfokus.",
  "Stained Glass": "Karya seni kaca patri, pecahan kaca berwarna-warni, garis tepi timah yang tebal, cahaya bersinar tembus.",
  "Ink Wash": "Lukisan kuas tradisional Asia Timur, tinta hitam dan air, sapuan kuas minimalis, keseimbangan ruang negatif.",
  "3D CGI Cinematic": "Render 3D CGI ultra-realistis resolusi tinggi, pencahayaan global Unreal Engine 5, kedalaman bidang sinematik (bokeh), tekstur fisik berbasis fisik (PBR), kejelasan detail tingkat tinggi, dinamis."
};

export const suggestStoryTopics = async (): Promise<string[]> => {
  try {
    const res = await fetch('/api/gemini/suggest-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.suggestions || ["Petualangan Sains di Luar Angkasa", "Rahasia Partikel Ajaib", "Misteri Planet Biru"];
  } catch (error) {
    console.error("Failed to suggest topics:", error);
    return ["Petualangan Sains di Luar Angkasa", "Rahasia Partikel Ajaib", "Misteri Planet Biru"];
  }
};

export const generateStoryText = async (
  topic: string, 
  durationSeconds: number = 90, 
  storytellerName: string = "Kakak Riza", 
  narrativeStructure: NarrativeStructure = NarrativeStructure.LINEAR, 
  targetAudience: TargetAudience = TargetAudience.PAUD,
  customEvent?: string,
  characterIdentities?: string,
  onChunk?: (text: string) => void,
  creatorPersona: CreatorPersona = CreatorPersona.YOUTUBE_PRO
): Promise<string> => {
  const res = await fetch('/api/gemini/stream-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      durationSeconds,
      storytellerName,
      narrativeStructure,
      targetAudience,
      customEvent,
      characterIdentities,
      creatorPersona
    })
  });

  if (!res.ok || !res.body) {
    throw new Error(`Gagal menghubungi server untuk pembuatan cerita (HTTP ${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullStory = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const jsonStr = trimmed.replace(/^data:\s*/, '');
      try {
        const payload = JSON.parse(jsonStr);
        if (payload.error) {
          throw new Error(payload.error);
        }
        if (payload.chunk) {
          fullStory += payload.chunk;
          if (onChunk) {
            onChunk(payload.chunk);
          }
        }
        if (payload.done && payload.fullText) {
          fullStory = payload.fullText;
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Gagal')) throw e;
      }
    }
  }

  return fullStory.trim();
};

export const generateSpeech = async (
  text: string, 
  voiceName: string = 'Puck', 
  tone: string = 'soothing', 
  pitch: string = Pitch.DEFAULT, 
  speed: string = Speed.DEFAULT
): Promise<{ url: string | null; duration: number }> => {
  try {
    const res = await fetch('/api/gemini/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName, tone, pitch, speed })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const { base64Audio, sampleRate = 24000 } = await res.json();
    if (!base64Audio) throw new Error("No audio data returned from server");

    const rawPcmData = decodeBase64(base64Audio);
    let pcmData = rawPcmData;

    // Optional client-side audio normalization and filtering
    try {
      const OfflineAudioCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
      if (OfflineAudioCtx) {
        const numSamples = rawPcmData.length / 2;
        const float32Data = new Float32Array(numSamples);
        const dataView = new DataView(rawPcmData.buffer, rawPcmData.byteOffset, rawPcmData.byteLength);

        for (let i = 0; i < numSamples; i++) {
          const int16 = dataView.getInt16(i * 2, true);
          float32Data[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
        }

        const offlineCtx = new OfflineAudioCtx(1, numSamples, sampleRate);
        const audioBuffer = offlineCtx.createBuffer(1, numSamples, sampleRate);
        audioBuffer.copyToChannel(float32Data, 0);

        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;

        const highpass = offlineCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 80;

        const presenceBoost = offlineCtx.createBiquadFilter();
        presenceBoost.type = 'peaking';
        presenceBoost.frequency.value = 3500;
        presenceBoost.gain.value = 2.0;

        source.connect(highpass);
        highpass.connect(presenceBoost);
        presenceBoost.connect(offlineCtx.destination);

        source.start(0);
        const renderedBuffer = await offlineCtx.startRendering();
        const renderedData = renderedBuffer.getChannelData(0);

        let maxAmplitude = 0;
        for (let i = 0; i < renderedData.length; i++) {
          const abs = Math.abs(renderedData[i]);
          if (abs > maxAmplitude) maxAmplitude = abs;
        }
        const targetAmplitude = Math.pow(10, -1 / 20);
        const gain = maxAmplitude > 0 ? targetAmplitude / maxAmplitude : 1;

        const outPcmData = new Uint8Array(renderedData.length * 2);
        const outDataView = new DataView(outPcmData.buffer);

        for (let i = 0; i < renderedData.length; i++) {
          let sample = renderedData[i] * gain;
          if (sample > 1) sample = 1;
          if (sample < -1) sample = -1;
          outDataView.setInt16(i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
        }
        pcmData = outPcmData;
      }
    } catch (e) {
      console.warn("Client audio filtering skipped, using direct PCM", e);
    }

    const audioUrl = createWavUrl(pcmData, sampleRate);
    const numSamples = pcmData.length / 2;
    const duration = numSamples / sampleRate;

    return { url: audioUrl, duration };
  } catch (error) {
    console.error("Error generating speech via server:", error);
    throw error;
  }
};

export const generateIllustration = async (
  storyText: string, 
  aspectRatio: string = "1:1", 
  visualStyle: string = "Pixar Style", 
  colorTheme: string = "Warm", 
  faceMode: FaceMode = FaceMode.WITH_FACE, 
  characterDescription?: string, 
  durationSeconds: number = 90
): Promise<string | null> => {
  try {
    const res = await fetch('/api/gemini/illustration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyText,
        aspectRatio,
        visualStyle,
        colorTheme,
        faceMode,
        characterDescription,
        durationSeconds
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error("Error generating illustration via server:", error);
    return null;
  }
};

export const generateMetadata = async (
  storyText: string, 
  visualStyle: string, 
  colorTheme: string
): Promise<{ title: string; description: string; hashtags: string[] }> => {
  try {
    const res = await fetch('/api/gemini/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyText, visualStyle, colorTheme })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error generating metadata via server:", error);
    return {
      title: "Petualangan Sains Spektakuler",
      description: "Sebuah penjelajahan seru menguak rahasia semesta untuk para petualang muda.",
      hashtags: ["#SainsAnak", "#EdukasiSains", "#PetualanganAI", "#BelajarSeru", "#CeritaSains"]
    };
  }
};

export const suggestCharacterDialogStyles = async (
  topic: string, 
  primaryApp: string, 
  secondaryApp: string, 
  tertiaryApp: string
): Promise<{ primary: string; secondary: string; tertiary: string }> => {
  try {
    const res = await fetch('/api/gemini/character-dialog-styles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, primaryApp, secondaryApp, tertiaryApp })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to suggest dialog styles:", error);
    return { primary: "Penuh rasa ingin tahu dan kritis", secondary: "Hati-hati dan bijaksana", tertiary: "Cepat dan humoris" };
  }
};

export const generateRandomCharacterAppearance = async (topic: string): Promise<Partial<CharacterAppearanceOptions> | null> => {
  try {
    const res = await fetch('/api/gemini/character-appearance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, role: "primary" })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.appearance || null;
  } catch (error) {
    console.error("Error generating random character appearance:", error);
    return null;
  }
};

export const generateRandomSecondaryCharacterAppearance = async (topic: string): Promise<Partial<CharacterAppearanceOptions> | null> => {
  try {
    const res = await fetch('/api/gemini/character-appearance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, role: "secondary" })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.appearance || null;
  } catch (error) {
    console.error("Error generating secondary appearance:", error);
    return null;
  }
};

export const generateRandomTertiaryCharacterAppearance = async (topic: string): Promise<Partial<CharacterAppearanceOptions> | null> => {
  try {
    const res = await fetch('/api/gemini/character-appearance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, role: "tertiary" })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.appearance || null;
  } catch (error) {
    console.error("Error generating tertiary appearance:", error);
    return null;
  }
};

export const suggestCharacterColors = async (topic: string, appearance: any): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/character-colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, appearance })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.colors || "Rambut hitam berkilau, pakaian sains biru elektrik";
  } catch (error) {
    return "Pakaian laboratorium cerah dengan aksen neon";
  }
};

export const generateRandomCustomEvent = async (topic: string): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/custom-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.event || "Reaksi kimia menghasilkan gelembung bercahaya!";
  } catch (error) {
    return "Alat detektor berbunyi menemukan sinyal kosmik misterius!";
  }
};

export const generateRandomInteractiveAction = async (topic: string): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/interactive-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.action || "Karakter latar belakang sibuk mengamati mikroskop.";
  } catch (error) {
    return "Robot kecil di sudut lab membantu mencatat hasil observasi.";
  }
};

export const generateCharacterDescription = async (
  storyText: string, 
  visualStyle: string, 
  faceMode: FaceMode = FaceMode.WITH_FACE, 
  characterAppearance?: string
): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/character-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyText, visualStyle, faceMode, characterAppearance })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.description || "A curious young Indonesian science student with expressive eyes and a lab coat";
  } catch (error) {
    return "An energetic young explorer with bright eyes and futuristic adventurer gear";
  }
};

export const generateVideoPrompt = async (
  storyText: string, 
  audioDuration: number, 
  visualStyle: string = "Pixar Style", 
  colorTheme: string = "Warm", 
  aspectRatio: string = "16:9", 
  faceMode: FaceMode = FaceMode.WITH_FACE, 
  inputCharacterDescription?: string, 
  durationSeconds: number = 90, 
  animationStyle: string = "Smooth", 
  backgroundPresence: string = "Background Only", 
  animationSpeed: string = "Default Speed", 
  animationEasing: string = "Ease In-Out", 
  linkEmotions: boolean = true, 
  interactiveBackgroundAction: string = ""
): Promise<ScenePrompt[]> => {
  try {
    const res = await fetch('/api/gemini/video-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyText,
        audioDuration,
        visualStyle,
        colorTheme,
        aspectRatio,
        faceMode,
        characterDescription: inputCharacterDescription,
        durationSeconds,
        animationStyle,
        backgroundPresence,
        animationSpeed,
        animationEasing,
        linkEmotions,
        interactiveBackgroundAction
      })
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.scenes || [];
  } catch (error) {
    console.error("Error generating video prompt via server:", error);
    const paragraphs = storyText.split("\n").filter(p => p.trim().length > 0);
    return paragraphs.map((para, idx) => ({
      scene_id: idx + 1,
      duration: 10,
      camera: { angle: "Default", zoom: "Medium" },
      dialog: para.trim(),
      action: `Visual illustration of the narration, heavily styled in ${visualStyle}`,
      character_interactions: "Characters interact dynamically with the environment.",
      image_prompt: `Illustration of ${para.trim().substring(0, 80)}, ${visualStyle} style`,
      video_prompt: `Cinematic shot of ${para.trim().substring(0, 80)}, ${visualStyle} style`,
      sound_environment: "Ambient laboratory hum and gentle wind",
      transition: "Cut"
    }));
  }
};

export const generateVideoFromPrompt = async (prompt: string, aspectRatio: string = "16:9"): Promise<string | null> => {
  try {
    const res = await fetch('/api/gemini/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.videoUrl || null;
  } catch (error: any) {
    console.error("Error in generateVideoFromPrompt:", error);
    throw new Error(error.message || "Gagal membuat video AI. Gunakan tombol 'Render Video Adegan (Instan)' untuk render bebas kuota!");
  }
};

export const generateScienceEducationData = async (
  storyText: string, 
  targetAudience: TargetAudience
): Promise<ScienceEducationData> => {
  try {
    const res = await fetch('/api/gemini/science-edu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyText, targetAudience })
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error generating science education data via server:", error);
    return {
      learningPoints: [
        { icon: "🌍", concept: "Eksplorasi Alam Semesta", explanation: "Semesta ini penuh dengan rahasia luar biasa yang menunggu untuk dipecahkan melalui rasa ingin tahu kita!" },
        { icon: "💡", concept: "Metode Ilmiah", explanation: "Ilmuwan belajar dengan bertanya, mengamati, mencoba eksperimen, dan menyimpulkan hasilnya." },
        { icon: "🧬", concept: "Koneksi Kehidupan", explanation: "Semua makhluk hidup dan benda di alam semesta saling terhubung melalui hukum alam." }
      ],
      dictionary: [
        { term: "Sains", definition: "Cara kita mempelajari segala sesuatu di alam semesta dengan melakukan eksperimen dan pengamatan." },
        { term: "Atmosfer", definition: "Selimut udara tebal yang melindungi planet dari batuan luar angkasa dan radiasi ekstrem." },
        { term: "Energi", definition: "Kekuatan ajaib yang membuat benda bisa bergerak, bersinar, atau menghasilkan panas." }
      ],
      quiz: [
        {
          question: "Apakah kunci utama ilmuwan dalam mengungkap rahasia sains alam semesta?",
          options: ["Rasa ingin tahu dan observasi", "Menebak tanpa eksperimen", "Membaca komik saja", "Menunggu keajaiban"],
          correctAnswerIndex: 0,
          explanation: "Rasa ingin tahu dan pengamatan yang disiplin adalah fondasi semua penemuan sains terbesar!"
        }
      ]
    };
  }
};