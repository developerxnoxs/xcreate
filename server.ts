import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Server GEMINI_API_KEY environment variable is not configured. Please ensure GEMINI_API_KEY is set in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

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

// ==========================================
// 1. SUGGEST TOPICS
// ==========================================
app.post('/api/gemini/suggest-topics', async (req: Request, res: Response) => {
  const fallbackSuggestions = [
    "Petualangan Rover Nano di Dalam Sel Tubuh Manusia Menyelidiki DNA",
    "Misteri Lubang Hitam Mini di Laboratorium Sekolah dan Gravitasi",
    "Perjalanan Tetesan Air Pintar Melintasi Siklus Hujan Menembus Awan",
    "Eksperimen Roket Foton: Menjelajah Menuju Sabuk Asteroid",
    "Rahasia Fotosintesis: Ketika Kloroplas Mengubah Cahaya Jadi Energi"
  ];

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      // Instant response if key is not configured yet
      return res.json({ suggestions: fallbackSuggestions.slice(0, 3) });
    }

    const ai = getAiClient();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 4000)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Bertindaklah sebagai 'Master Storyteller' edukasi sains anak.
        Berikan 3 ide topik cerita sains anak yang sangat kreatif dan edukatif.
        Kembalikan HANYA array JSON berisi 3 string.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const response: any = await Promise.race([callPromise, timeoutPromise]);
    const text = response.text || "[]";
    const suggestions = JSON.parse(text);
    return res.json({
      suggestions: Array.isArray(suggestions) && suggestions.length > 0 
        ? suggestions.slice(0, 3) 
        : fallbackSuggestions.slice(0, 3)
    });
  } catch (error: any) {
    console.error("suggest-topics using fallback:", error?.message || error);
    return res.json({ suggestions: fallbackSuggestions.slice(0, 3) });
  }
});

// ==========================================
// 2. STREAM STORY (SSE Streaming)
// ==========================================
app.post('/api/gemini/stream-story', async (req: Request, res: Response) => {
  const { topic, durationSeconds = 90, storytellerName = "Kakak Riza", narrativeStructure = "Linear", targetAudience = "PAUD (3-5 Tahun)", customEvent, characterIdentities, creatorPersona } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const ai = getAiClient();
    const estimatedWords = Math.round((Number(durationSeconds) / 60) * 150);
    const estimatedParagraphs = Math.max(1, Math.round(estimatedWords / 50));
    const lengthPrompt = `${durationSeconds} Detik (sekitar ${estimatedWords} kata, ${estimatedParagraphs} paragraf). ${Number(durationSeconds) <= 60 ? "Langsung pada inti cerita tanpa bertele-tele." : Number(durationSeconds) <= 120 ? "Cerita memiliki pengembangan karakter, alur terstruktur (pengenalan, konflik, penyelesaian), dan lingkungan yang kaya." : "Cerita epik dengan world-building detail, karakterisasi dalam, subplot, klimaks matang, dan penyelesaian emosional."} PASTIKAN jumlah kata narasi BENAR-BENAR MENGISI waktu ${durationSeconds} detik ini (berkisar ${estimatedWords} kata) dengan detail cerita sains & imajinasi yang kaya.`;

    let personaPrompt = "Bertindak sebagai tim produksi YouTube sains edukasi profesional. Fokus penuh pada cerita sains yang memikat anak-anak dan remaja melalui eksplorasi, fakta menarik, serta visualisasi yang hidup.";
    if (creatorPersona === "Motivasi & Inspiratif") {
      personaPrompt = "Bertindak sebagai kreator konten motivasi sains. Ciptakan narasi inspirasional tentang semangat pantang menyerah dalam memecahkan misteri alam semesta.";
    } else if (creatorPersona === "Bisnis Digital") {
      personaPrompt = "Bertindak sebagai content creator teknologi masa depan dan inovasi sains modern.";
    } else if (creatorPersona === "Islami") {
      personaPrompt = "Bertindak sebagai penulis konten Islami yang mengaitkan keagungan alam semesta dan sains dengan rasa syukur dan akhlak mulia.";
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: `
        ROLE:
        Kamu adalah Penulis Serial Cerita Anak Profesional, Showrunner Animasi, Editor Kontinuitas Cerita, Character Designer, Storyboard Artist, dan Prompt Engineer AI.
        Kamu juga merupakan Interactive Science Education AI. Jelaskan konsep sains/dunia secara luas, menarik, visual, dan sederhana menggunakan storytelling, petualangan, eksplorasi, dan imajinasi.
        
        ATURAN UTAMA KONSISTENSI & KONTINUITAS:
        • Gunakan data identitas karakter sebagai acuan resmi. Jangan pernah mengubah wajah, bentuk tubuh, warna kulit, pakaian utama, aksesori, atau sifat tokoh.
        • Sebelum menghasilkan cerita, lakukan pemeriksaan kontinuitas: nama tokoh, pakaian, suara, sifat, lokasi, dan gaya visual harus konsisten.

        PERAN KHUSUS:
        ${personaPrompt}

        INPUT SISTEM:
        - Topik / Judul: "${topic}"
        - Kategori Umur (Target Audiens): "${targetAudience}"
        - Cerita dibawakan oleh: "${storytellerName}"
        - Panjang Target: "${lengthPrompt}"
        - Mode Naratif: "${narrativeStructure}"
        ${customEvent ? `- Instruksi Tambahan/Kejadian Khusus (WAJIB DIMASUKKAN): "${customEvent}"` : ''}
        ${characterIdentities ? `- Nama Karakter & Identitas (WAJIB DIIKUTI): "${characterIdentities}"` : ''}

        ATURAN PENULISAN:
        1. Judul / Topik dari user menjadi inti utama cerita. Jangan keluar dari tema utama.
        2. Dialog WAJIB digunakan sebagai alat utama bercerita (Show, Don't Tell).
        3. FORMAT DIALOG WAJIB: [NAMA KARAKTER] (emosi, gesture, posisi kamera) "Isi dialog"
        4. Tanamkan konsep sains secara natural ke dalam alur (misal: gravitasi, reaksi kimia, astronomi, ekosistem).

        FORMAT OUTPUT FINAL (Ikuti persis struktur ini):
        1. CHARACTER BIBLE & ANALISIS KARAKTER
        2. DUNIA CERITA
        3. RINGKASAN CERITA
        4. SINOPSIS SINGKAT
        5. TARGET USIA
        6. GENRE
        7. Alur Lengkap (Tuliskan naskah sinematik penuh menggunakan FORMAT DIALOG WAJIB di atas sesuai target durasi ${lengthPrompt}.)
        8. Perjalanan Emosi Karakter Utama
        9. Nilai Moral/Pesan Cerita
        10. Ide Episode Berikutnya
      `,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      if (text) {
        fullText += text;
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Error in /api/gemini/stream-story:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Failed to generate story" })}\n\n`);
    res.end();
  }
});

// ==========================================
// 3. SPEECH GENERATION (TTS)
// ==========================================
app.post('/api/gemini/speech', async (req: Request, res: Response) => {
  const { text, voiceName = 'Puck', tone = 'soothing', pitch = 'Default', speed = 'Default' } = req.body;

  try {
    const ai = getAiClient();
    const cleanText = String(text || "")
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/>\s?/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .trim();

    const VOICE_MAPPING: Record<string, { apiVoice: string, style: string }> = {
      'Grandpa': { apiVoice: 'Charon', style: "Warm, elderly grandfather storyteller, deep and comforting." },
      'Fairy': { apiVoice: 'Zephyr', style: "Magical high-pitched fairy, bubbly, airy." },
      'Robot': { apiVoice: 'Puck', style: "Monotone synthetic computer robot intelligence, electronic cadence." },
      'Professor': { apiVoice: 'Puck', style: "Enthusiastic and eccentric scientist professor, bright excited pauses." },
      'Detective': { apiVoice: 'Fenrir', style: "Classic noir detective, gravelly voice, suspenseful mystery." },
      'Puck': { apiVoice: 'Puck', style: "Playful, witty, and mischievous." },
      'Charon': { apiVoice: 'Charon', style: "Deep, resonant, and authoritative." },
      'Kore': { apiVoice: 'Kore', style: "Gentle, motherly, and warm." },
      'Fenrir': { apiVoice: 'Fenrir', style: "Gruff, intense, and wild." },
      'Zephyr': { apiVoice: 'Zephyr', style: "Soft, breathy, and ethereal." },
    };

    const voiceConfig = VOICE_MAPPING[voiceName] || { apiVoice: 'Puck', style: 'Engaging, clear, expressive' };
    const promptText = `Please read the following text with a ${tone} tone. Voice style: ${voiceConfig.style}. Pitch: ${pitch}. Speed: ${speed}. Maintain consistent studio quality:\n\n${cleanText}`;

    // Standard Gemini TTS model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceConfig.apiVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS");
    }

    return res.json({ base64Audio, sampleRate: 24000 });
  } catch (error: any) {
    console.error("Error in /api/gemini/speech:", error);
    return res.status(500).json({ error: error.message || "Speech generation failed" });
  }
});

// ==========================================
// 4. ILLUSTRATION GENERATION
// ==========================================
app.post('/api/gemini/illustration', async (req: Request, res: Response) => {
  const { storyText, aspectRatio = "1:1", visualStyle = "Pixar Style", colorTheme = "Warm", faceMode = "with_face", characterDescription } = req.body;

  try {
    const ai = getAiClient();
    let apiAspectRatio = aspectRatio;
    if (aspectRatio === "21:9") apiAspectRatio = "16:9";

    const styles = String(visualStyle).split(',').map(s => s.trim());
    const specificStylePrompt = styles.map(style => STYLE_INSTRUCTIONS[style] || style).join('. ');

    const faceModeInstruction = faceMode === "faceless"
      ? "CHARACTER WITHOUT VISIBLE FACE (FACELESS): Shot from behind, silhouette, or covered by environmental shadow."
      : "CHARACTER WITH EXPRESIVE FACE: Clearly visible, high facial detail, lively eyes.";

    const prompt = `
      A full-body master character design reference sheet of the main character from this educational science story.
      The character must be facing the camera, clearly visible from head to toe in an appealing pose.
      
      BACKGROUND: Solid chroma key green screen background (#00FF00) ONLY. Absolutely NO other elements, completely blank flat green background.
      
      CHARACTER IDENTITY AND OUTFIT: ${characterDescription || "A curious young explorer/scientist character with distinct accessories"}
      ${faceModeInstruction}
      
      VISUAL STYLE: ${visualStyle} (${specificStylePrompt})
      COLOR THEME: ${colorTheme}
      
      Ensure professional studio lighting without casting harsh shadows onto the green screen.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: apiAspectRatio as any,
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      }
    }

    return res.status(500).json({ error: "No image generated" });
  } catch (error: any) {
    console.error("Error in /api/gemini/illustration:", error);
    return res.status(500).json({ error: error.message || "Failed to generate illustration" });
  }
});

// ==========================================
// 5. METADATA GENERATION
// ==========================================
app.post('/api/gemini/metadata', async (req: Request, res: Response) => {
  const { storyText, visualStyle, colorTheme } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Berdasarkan cerita sains anak berikut, buatlah metadata YouTube/media sosial yang memikat:
        1. Judul (title): Sangat menarik, memicu rasa ingin tahu ilmiah.
        2. Deskripsi (description): Sinopsis ringkas yang menggugah emosi, sejalan dengan gaya ${visualStyle} dan warna ${colorTheme}.
        3. Hashtags (hashtags): 5 hashtag sains/edukasi yang relevan.

        CERITA:
        "${storyText}"
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "hashtags"]
        }
      }
    });

    const metadata = JSON.parse(response.text || "{}");
    return res.json(metadata);
  } catch (error: any) {
    console.error("Error in /api/gemini/metadata:", error);
    return res.json({
      title: "Petualangan Sains Spektakuler",
      description: "Sebuah penjelajahan seru menguak rahasia semesta untuk para petualang muda.",
      hashtags: ["#SainsAnak", "#EdukasiSains", "#PetualanganAI", "#BelajarSeru", "#CeritaSains"]
    });
  }
});

// ==========================================
// 6. CHARACTER DIALOG STYLES
// ==========================================
app.post('/api/gemini/character-dialog-styles', async (req: Request, res: Response) => {
  const { topic, primaryApp, secondaryApp, tertiaryApp } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Topik cerita: "${topic || 'Petualangan sains'}"
        Karakter Utama: "${primaryApp || 'Penjelajah muda'}"
        Karakter Pendukung: "${secondaryApp || 'Teman setia'}"
        Karakter Pendukung Kedua: "${tertiaryApp || 'Robot asisten'}"

        Buatlah saran gaya bicara untuk ketiga karakter di atas dalam format JSON.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary: { type: Type.STRING },
            secondary: { type: Type.STRING },
            tertiary: { type: Type.STRING }
          },
          required: ["primary", "secondary", "tertiary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Error in /api/gemini/character-dialog-styles:", error);
    return res.json({
      primary: "Penuh rasa ingin tahu, kritis, dan bersemangat",
      secondary: "Hati-hati, teliti, dan bijaksana",
      tertiary: "Cepat, humoris, dan penuh kejutan"
    });
  }
});

// ==========================================
// 7. CHARACTER APPEARANCE
// ==========================================
app.post('/api/gemini/character-appearance', async (req: Request, res: Response) => {
  const { topic, role = "primary" } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Topik: "${topic || 'Eksplorasi Sains'}"
        Peran: ${role === 'secondary' ? 'Karakter pendukung' : role === 'tertiary' ? 'Karakter pendukung kedua' : 'Karakter utama'}
        Buat deskripsi penampilan karakter anak/remaja yang menarik dan tematis dalam JSON.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customDetails: { type: Type.STRING },
            headwear: { type: Type.STRING },
            upperBodyClothing: { type: Type.STRING },
            lowerBodyClothing: { type: Type.STRING },
            footwear: { type: Type.STRING },
            accessories: { type: Type.STRING },
          },
          required: ["customDetails", "headwear", "upperBodyClothing", "lowerBodyClothing", "footwear", "accessories"]
        }
      }
    });

    const appearance = JSON.parse(response.text || "{}");
    return res.json({ appearance });
  } catch (error: any) {
    console.error("Error in /api/gemini/character-appearance:", error);
    return res.json({
      appearance: {
        customDetails: "Mata bulat berkilau penuh rasa ingin tahu, rambut ikal biru tua",
        headwear: "Kacamata Lab (Goggles) 🧪",
        upperBodyClothing: "Jas Laboratorium Putih 🥼",
        lowerBodyClothing: "Celana Cargo Kantong Banyak 🥾",
        footwear: "Sepatu Kets Nyaman 👟",
        accessories: "Tablet Sains & Peta Semesta 📱"
      }
    });
  }
});

// ==========================================
// 8. CHARACTER COLORS
// ==========================================
app.post('/api/gemini/character-colors', async (req: Request, res: Response) => {
  const { topic, appearance } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Berikan saran kombinasi palet warna pakaian dan rambut (1 kalimat ringkas) untuk karakter pada topik "${topic}":
        ${JSON.stringify(appearance || {})}
        Contoh: "Rambut cokelat gelap, jas lab putih bersih dengan aksen biru cyan neon"
      `
    });
    return res.json({ colors: response.text?.trim() || "Rambut hitam berkilau, pakaian sains biru elektrik" });
  } catch (error: any) {
    return res.json({ colors: "Warna pakaian bertema petualangan cerah" });
  }
});

// ==========================================
// 9. CUSTOM EVENT & INTERACTIVE ACTION
// ==========================================
app.post('/api/gemini/custom-event', async (req: Request, res: Response) => {
  const { topic } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buat 1 plot twist atau momen penemuan sains krusial untuk topik "${topic}". Kembalikan 1 kalimat deskriptif.`
    });
    return res.json({ event: response.text?.trim() || "Alat detektor tiba-tiba menyala terang menemukan kristal langka!" });
  } catch (error) {
    return res.json({ event: "Terjadi reaksi kimia mengejutkan yang menghasilkan gelembung warna-warni!" });
  }
});

app.post('/api/gemini/interactive-action', async (req: Request, res: Response) => {
  const { topic } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buat 1 kalimat aksi interaksi latar belakang yang dinamis untuk topik "${topic}".`
    });
    return res.json({ action: response.text?.trim() || "Robot-robot mini di latar belakang sibuk memilah sampel batuan luar angkasa." });
  } catch (error) {
    return res.json({ action: "Burung-burung mekanik terbang beriringan melintasi langit senja." });
  }
});

// ==========================================
// 10. CHARACTER DESCRIPTION FOR PROMPTS
// ==========================================
app.post('/api/gemini/character-description', async (req: Request, res: Response) => {
  const { storyText, visualStyle, faceMode = "with_face", characterAppearance } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Ekstrak dan rangkum deskripsi visual karakter utama dari cerita ini ke dalam bahasa Inggris ringkas (2-3 kalimat) untuk digunakan sebagai prompt gambar/video yang konsisten:
        Gaya Visual: ${visualStyle}
        Deskripsi Tambahan: ${characterAppearance || 'None'}
        Mode Wajah: ${faceMode}
        Cerita:
        ${storyText.substring(0, 1500)}
      `
    });
    return res.json({ description: response.text?.trim() || "A curious young Indonesian science student with expressive eyes and a lab coat" });
  } catch (error) {
    return res.json({ description: "An energetic young explorer with bright eyes and futuristic adventurer gear" });
  }
});

// ==========================================
// 11. VIDEO PROMPTS & SCENES
// ==========================================
app.post('/api/gemini/video-prompt', async (req: Request, res: Response) => {
  const {
    storyText,
    audioDuration = 60,
    visualStyle = "Pixar Style",
    colorTheme = "Warm",
    aspectRatio = "16:9",
    faceMode = "with_face",
    characterDescription = "",
    durationSeconds = 90,
    animationStyle = "Smooth",
    backgroundPresence = "Balanced",
    animationSpeed = "Default Speed",
    animationEasing = "Ease In-Out",
    linkEmotions = true,
  } = req.body;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Sebagai AI Director & Storyboard Artist, pecahkan alur cerita sains berikut ke dalam serangkaian adegan video berdurasi tepat 10 detik per adegan.
        Gaya Visual: ${visualStyle}
        Palet Warna: ${colorTheme}
        Deskripsi Karakter: ${characterDescription}
        Gaya Animasi: ${animationStyle} (${animationSpeed}, ${animationEasing})
        
        Naskah Cerita:
        ${storyText}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scene_id: { type: Type.INTEGER },
              duration: { type: Type.INTEGER },
              camera: {
                type: Type.OBJECT,
                properties: {
                  angle: { type: Type.STRING },
                  zoom: { type: Type.STRING }
                },
                required: ["angle", "zoom"]
              },
              dialog: { type: Type.STRING },
              action: { type: Type.STRING },
              character_interactions: { type: Type.STRING },
              image_prompt: { type: Type.STRING },
              video_prompt: { type: Type.STRING },
              sound_environment: { type: Type.STRING },
              transition: { type: Type.STRING }
            },
            required: ["scene_id", "duration", "camera", "dialog", "action", "character_interactions", "image_prompt", "video_prompt", "sound_environment", "transition"]
          }
        }
      }
    });

    const scenes = JSON.parse(response.text || "[]");
    return res.json({ scenes });
  } catch (error: any) {
    console.error("Error in /api/gemini/video-prompt:", error);
    // Manual fallback
    const paragraphs = String(storyText).split("\n").filter(p => p.trim().length > 0);
    const fallbackScenes = paragraphs.slice(0, 5).map((para, idx) => ({
      scene_id: idx + 1,
      duration: 10,
      camera: { angle: "Smooth Pan", zoom: "Medium" },
      dialog: para.trim().substring(0, 120),
      action: `Visual action of ${para.trim().substring(0, 80)}, styled in ${visualStyle}`,
      character_interactions: "Character explores with curiosity.",
      image_prompt: `High quality cinematic render of ${para.trim().substring(0, 80)}, ${visualStyle} style, ${colorTheme} lighting`,
      video_prompt: `Cinematic camera tracking shot of ${para.trim().substring(0, 80)}, ${visualStyle} style, 8k resolution`,
      sound_environment: "Ambient laboratory hum and gentle wind",
      transition: "Crossfade"
    }));
    return res.json({ scenes: fallbackScenes });
  }
});

// ==========================================
// 12. AI VIDEO GENERATION (Omni Flash)
// ==========================================
app.post('/api/gemini/generate-video', async (req: Request, res: Response) => {
  const { prompt, aspectRatio = "16:9" } = req.body;
  try {
    const ai = getAiClient();
    const veoAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";

    const interaction = await ai.interactions.create({
      model: 'gemini-omni-1.2-flash',
      input: prompt,
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: veoAspectRatio as any,
        duration: '10s',
        resolution: '720p',
      }
    }, { timeout: 300000 });

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      return res.json({ videoUrl: `data:video/mp4;base64,${videoPart.data}` });
    }

    return res.status(500).json({ error: "Video processing could not be completed." });
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-video:", error);
    const msg = String(error?.message || error || "");
    if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("paid") || msg.includes("billing")) {
      return res.status(403).json({
        error: "Model Video AI (gemini-omni-1.2-flash) memerlukan API Key Google Cloud dengan penagihan aktif (Paid API Key). Anda dapat menggunakan tombol 'Render Video Adegan (Instan)' di bawah yang 100% gratis dan langsung menghasilkan video klip animasi MP4/WebM!"
      });
    }
    return res.status(500).json({
      error: error.message || "Gagal membuat video AI. Gunakan fitur 'Render Video Adegan (Instan)' untuk render bebas kuota langsung di peramban!"
    });
  }
});

// ==========================================
// 13. SCIENCE EDUCATION DATA
// ==========================================
app.post('/api/gemini/science-edu', async (req: Request, res: Response) => {
  const { storyText, targetAudience = "PAUD" } = req.body;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
        Sebagai Interactive Science Educator, analisislah materi sains dalam cerita ini untuk audiens ${targetAudience}:
        1. learningPoints: 3 poin pembelajaran sains utama (icon, concept, explanation).
        2. dictionary: 3 istilah sains penting beserta definisinya yang mudah dicerna (term, definition).
        3. quiz: 3 soal kuis pilihan ganda yang menguji pemahaman (question, options [4 items], correctAnswerIndex [0-3], explanation).

        CERITA:
        "${storyText}"
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            learningPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  icon: { type: Type.STRING },
                  concept: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["icon", "concept", "explanation"]
              }
            },
            dictionary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["learningPoints", "dictionary", "quiz"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ data });
  } catch (error: any) {
    console.error("Error in /api/gemini/science-edu:", error);
    return res.json({
      data: {
        learningPoints: [
          { icon: "🌍", concept: "Eksplorasi Alam Semesta", explanation: "Semesta ini penuh dengan rahasia luar biasa yang menunggu untuk dipecahkan melalui rasa ingin tahu kita!" },
          { icon: "💡", concept: "Metode Ilmiah", explanation: "Ilmuwan belajar dengan bertanya, mengamati, mencoba eksperimen, dan menyimpulkan hasilnya." },
          { icon: "🧬", concept: "Koneksi Kehidupan", explanation: "Semua makhluk hidup dan benda di alam semesta saling terhubung melalui hukum fisika dan biokimia." }
        ],
        dictionary: [
          { term: "Sains", definition: "Cara kita mempelajari segala sesuatu di alam semesta dengan melakukan eksperimen dan pengamatan." },
          { term: "Atmosfer", definition: "Selimut udara tebal yang melindungi bumi kita dari batuan luar angkasa dan radiasi matahari." },
          { term: "Energi", definition: "Kekuatan yang membuat segala sesuatu bisa bergerak, bersinar, atau menghasilkan panas!" }
        ],
        quiz: [
          {
            question: "Apakah yang membantu ilmuwan memahami rahasia alam semesta?",
            options: ["Rasa ingin tahu dan pengamatan", "Hanya menebak-nebak saja", "Membaca buku fiksi", "Menyerah sebelum mencoba"],
            correctAnswerIndex: 0,
            explanation: "Rasa ingin tahu dan pengamatan yang disiplin adalah kunci utama semua penemuan sains terbesar di dunia!"
          }
        ]
      }
    });
  }
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
