import { FormState, PromptResult } from '../types';

// Helper to get Style Details
const getStyleDetails = (style: string, mode: string, topic: string) => {
    let details = {
        gaya_desain: `${style} Style (${mode})`,
        tekstur: "Halus dan bersih",
        pencahayaan: "Studio lighting standar",
        palet: ["Warna Primer", "Putih", "Hitam"],
        font_style: "Sans-serif Modern Bold, Lurus & Bersih",
        bg_desc: "Solid color clean background"
    };

    // --- LOGIKA TEXT STYLE (Typography) ---
    const textShapes = ["Sedikit Melengkung (Arced)", "Dinamis Miring (Slanted)", "Floating Perspective", "Typographic Composition"];
    const randomShape = textShapes[Math.floor(Math.random() * textShapes.length)];

    // 1. Override details based on MODE
    if (mode.includes('3D') || mode.includes('Blender')) {
        details.gaya_desain = "High-End 3D CGI Render (Photorealistic)";
        details.tekstur = "Material PBR (Physically Based Rendering) realistis, detail permukaan mikro";
        details.pencahayaan = "Global Illumination, Ray Tracing, HDRI Environment Light, Volumetric Fog";
        details.bg_desc = "3D Environment dengan Depth of Field (Bokeh)";
        details.font_style = `3D Extruded Typography, Material Glossy/Metallic, ${randomShape}`;
    } 
    else if (mode === '2D Illustration' || mode === 'Vector Art') {
        details.font_style = `Custom Hand-lettering atau Bold Vector Font, ${randomShape}, Warna solid kontras`;
    }

    // 2. Override details based on SPECIFIC STYLES
    if (style === 'Papercraft') {
        details = {
            gaya_desain: "Papercraft Edukatif Style 3D (Layered Paper Art)",
            tekstur: "Kertas bertekstur (cardstock), potongan rapi, lipatan halus",
            pencahayaan: "Soft global illumination untuk menonjolkan kedalaman lapisan kertas",
            palet: ["Krem Kertas", "Warna Pastel Lembut", "Warna Utama Topik", "Putih"],
            font_style: `Huruf potongan kertas 3D (Paper Cutout Letters), Layered, Timbul`,
            bg_desc: "Latar belakang kertas berlapis dengan gradasi warna lembut"
        };
    } else if (style === 'Pixar') {
        details = {
            gaya_desain: "Disney Pixar 3D Animation Style",
            tekstur: "Surface halus (subsurface scattering), material plastik/kulit realistis stylized",
            pencahayaan: "Cinematic lighting, warm volumetric light, rim light",
            palet: ["Vibrant colors", "Saturated Blue/Orange", "Warm Yellow", "Glossy White"],
            font_style: `3D Bubbly Font (Huruf Gembung), Rounded, Tekstur Mengkilap, ${randomShape}, Playful`,
            bg_desc: "Dunia 3D yang blur (bokeh) with detail whimsical yang relevan dengan topik"
        };
    } else if (style === 'Viral3D') {
        details = {
            gaya_desain: "3D Commercial Advertising Style (Viral Marketing Aesthetic)",
            tekstur: "Smooth plastic, glossy 3D materials, high saturation",
            pencahayaan: "Bright Studio Lighting, soft shadows, high key, energetic vibe",
            palet: ["Vibrant Pink", "Bright Yellow", "Sky Blue", "White", "Confetti Colors"],
            font_style: "3D Bold Bubble Text, Thick White Outline, Floating Perspective, Sticker Art Aesthetic",
            bg_desc: "Explosion of 3D confetti, floating topic-related elements, dynamic motion blur, solid pastel background"
        };
    } else if (style === 'Nusantara') {
        details = {
            gaya_desain: "Tradisional Nusantara Heritage Style (Realistic & Warm)",
            tekstur: "Kayu Jati (Teak Wood), Kertas Kusam (Vintage Paper/Parchment), Tekstur Makanan Realistis",
            pencahayaan: "Warm Golden Hour Sunlight, Food Photography Lighting, Shadows for Depth",
            palet: ["Coklat Kayu", "Krem Kertas", "Hijau Daun", "Merah Cabai", "Emas"],
            font_style: "Typography Vintage pada Papan Kayu (Wooden Sign Typography)",
            bg_desc: "Meja kayu (Wooden Table) dengan properti tradisional (Cobek, Sendok Kayu, Rempah)"
        };
    } else if (style === 'Photorealistic') {
        details = {
            gaya_desain: "Award Winning Photography (Shot on Sony A7R IV)",
            tekstur: "Hyper-realistic textures, skin pores, high detail fidelity",
            pencahayaan: "Professional Cinematic Lighting, Softbox setup, or Natural Golden Hour",
            palet: ["True to life colors", "Neutral tones", "High Dynamic Range (HDR)"],
            font_style: "Minimalist Modern Sans-serif, Thin & Elegant Overlay",
            bg_desc: "Real world environment with Depth of Field (Bokeh)"
        };
    } else if (style === 'Isometric' || style === 'IsometricMiniStore') {
        details = {
            gaya_desain: "3D Isometric Stacked Diorama (Layered/Bertumpuk Style)",
            tekstur: "Clean 3D Render, Smooth Matte & Glossy Materials",
            pencahayaan: "Soft Global Illumination, Orthographic Camera View",
            palet: ["Vibrant Pastels", "Soft Blue", "Orange", "White", "Neon Accents"],
            font_style: "3D Floating Isometric Text, Sans-Serif Bold",
            bg_desc: "Solid color background (Soft Gradient) to isolate the floating stacked island"
        };
    } else if (style === 'VintageManual') {
        details = {
            gaya_desain: "Vintage Instructional Manual Illustration (Hand-Drawn Engraving Style)",
            tekstur: "Aged paper (kertas tua), ink lines, cross-hatching shading",
            pencahayaan: "Flat illustration lighting, uniform and clear",
            palet: ["Sepia", "Black Ink", "Faded Cream", "Muted Earth Tones"],
            font_style: "Classic Serif or Typewriter font for labels, numbered steps",
            bg_desc: "Parchment or blueprint grid background"
        };
    } else if (style === 'Rajut') {
        // STYLE KHUSUS RAJUT SESUAI REFERENSI
        details = {
            gaya_desain: "3D Knitted Amigurumi Style (Gaya Rajut Boneka)",
            tekstur: "Real Wool Yarn Texture (Tekstur Benang Wol Asli), Crochet Stitches (Jahitan Rajut), Soft Fuzz, Felt Fabric Details",
            pencahayaan: "Soft Studio Lighting (Cozy Atmosphere), Gentle Shadows untuk menonjolkan tekstur benang",
            palet: ["Warna Pastel Lembut", "Cream", "Soft Blue", "Warm Beige", "Earth Tones"],
            font_style: "3D Puffy Felt Letters (Huruf Timbul Kain Flanel) atau Stitched Typography (Huruf Jahitan Benang), Rounded",
            bg_desc: "Knitted fabric pattern (Pola Rajutan) atau Soft Room Environment dengan tekstur kain"
        };
    }

    return details;
};

// Helper to determine orientation from ratio
const getOrientation = (ratio: string): string => {
    if (ratio === '9:16' || ratio === '4:5' || ratio === '2:3') return 'Vertikal';
    if (ratio === '16:9') return 'Horizontal';
    if (ratio === '1:1') return 'Square';
    return 'Vertikal';
};

export const generatePrompt = (category: string, form: FormState): PromptResult => {
    // Check if Logo is Uploaded
    const hasLogo = !!form.brandLogo;
    const logoInstruction = hasLogo 
        ? "Sediakan ruang kosong (negative space) yang bersih di salah satu sudut (biasanya kanan atas atau kiri atas) agar logo brand dapat ditempatkan tanpa menutupi elemen penting." 
        : "";

    // --- SPECIAL LOGIC FOR ARCHITECTURE CATEGORY ---
    if (category === 'Arsitektur') {
        const { topic, title, subtitle } = form; // topic is Project Name
        
        const finalTitle = form.archTextEnabled ? (title || topic) : null;
        const finalTopic = topic || "Architecture Project";
        const orientation = getOrientation(form.ratio);

        const promptJson: any = {
            "prompt_type": "architecture_poster_generator",
            "category": "architecture",
            "description": "Poster visualisasi arsitektur profesional berdasarkan parameter visual yang dipilih pengguna.",
          
            "project_info": {
              "project_name": finalTopic,
              "aspect_ratio": form.ratio
            },
          
            "poster_configuration": {
              "poster_type": form.archType,
              "visual_style": form.archStyle
            },
          
            "camera_and_view": {
              "perspective": form.archPerspective,
              "camera_lens": "architectural lens",
              "view_focus": "clear building composition"
            },
          
            "lighting_setup": {
              "lighting": form.archLighting,
              "lighting_style": "natural architectural lighting"
            },
          
            "material_and_surface": {
              "dominant_materials": form.archMaterials && form.archMaterials.length > 0 ? form.archMaterials : ["Mix Materials"],
              "surface_detail": "clean and realistic texture"
            },
          
            "atmosphere_and_mood": {
              "atmosphere": form.archAtmosphere && form.archAtmosphere.length > 0 ? form.archAtmosphere : ["Professional"],
              "overall_mood": "professional architectural visualization"
            },
          
            "environment_context": {
              "environment_enabled": form.archContextEnabled,
              "environment_type": form.archContextEnabled ? form.archContext : "Clean Background"
            },
          
            "human_scale": {
              "human_presence": form.archHumanScale,
              "human_style": "faceless silhouette for scale reference"
            },
          
            "additional_elements": form.archElements || [],
          
            "text_elements": {
              "enabled": form.archTextEnabled,
              "title": finalTitle,
              "note": "Minimal typography, clean architectural caption"
            },
          
            "render_constraints": {
              "quality": "high",
              "detail_level": "architectural standard",
              "avoid": [
                "cartoon illustration",
                "unrealistic proportion",
                "fisheye distortion",
                "commercial advertising style",
                "excessive text overlay"
              ]
            },
          
            "output_instruction": {
              "output_type": "single architecture poster image",
              "resolution": "high resolution",
              "orientation": orientation,
              "render_finish": "professional architectural render"
            }
        };

        if (hasLogo) {
            promptJson.brand_logo = {
                "status": "uploaded",
                "instruction": logoInstruction
            };
        }

        // Midjourney Prompt Construction (Keeping string version for manual use)
        let mj = `/imagine prompt: ${form.archStyle}. ${form.archType} of ${finalTopic}. `;
        mj += `View: ${form.archPerspective}. `;
        mj += `Materials: ${(form.archMaterials || []).join(', ') || 'Mixed Materials'}. `;
        mj += `Lighting: ${form.archLighting}. Atmosphere: ${(form.archAtmosphere || []).join(', ')}. `;
        
        if (form.archContextEnabled) {
            mj += `Environment: ${form.archContext}. `;
        } else {
            mj += `Background: Clean/Neutral. `;
        }
        
        if (form.archHumanScale !== 'Tidak Ada') {
            mj += `Include: ${form.archHumanScale}. `;
        }
        
        if (form.archElements && form.archElements.length > 0) {
            mj += `Details: ${form.archElements.join(', ')}. `;
        }

        if (hasLogo) mj += " Reserve corner space for logo placement. ";

        mj += `8k resolution, architectural photography, photorealistic --ar ${form.ratio.replace(':','-')} --v 6.0`;
        if (!form.archTextEnabled) mj += " --no text watermark";

        return {
            json: JSON.stringify(promptJson, null, 2),
            description: mj
        };
    }

    // --- STANDARD GENERATOR VARIABLES ---
    const { topic, title, subtitle, content, cta, contact, watermark, funfact, instruction } = form;

    const finalTopic = topic || "Subjek";
    const finalTitle = form.isTitleAuto ? `\${finalTopic}` : (title || `Judul \${finalTopic}`);
    const finalSubtitle = form.isSubtitleAuto ? `Panduan lengkap tentang \${finalTopic}` : subtitle;
    const orientation = getOrientation(form.ratio);

    // Style Processing
    const styleData = getStyleDetails(form.style, form.mode, finalTopic);

    // Character Logic Context
    let characterContext = "";
    if (form.useCharacter === 'yes') {
        let charType = "Manusia";
        let charSkin = "";
        
        // JIKA GAYA RAJUT, paksa karakter jadi Boneka
        if (form.style === 'Rajut') {
            charType = "Boneka Rajut Amigurumi (Knitted Doll)";
            charSkin = "(Tekstur Benang Wol/Kain)";
        }

        let charDetail = `Seorang karakter \${charType} \${form.character} \${charSkin} \${form.faceless === 'yes' ? '(Faceless/Tanpa Detail Mata Mulut)' : '(Wajah Cute & Ekspresif)'}`;
        
        // --- FIXED: UNIVERSAL HIJAB/CADAR LOGIC ---
        // Apply hijab logic regardless of category if selected
        if (form.hijab === 'yes') {
             const mat = form.style === 'Rajut' ? "rajut (knitted)" : "kain modern";
             charDetail += ` Menggunakan Hijab/Jilbab \${mat} yang rapi dan menutup rambut sepenuhnya.`;
        }
        if (form.cadar === 'yes') {
             const mat = form.style === 'Rajut' ? "rajut (knitted)" : "kain";
             charDetail += ` Menggunakan Niqab/Cadar \${mat} yang menutupi wajah.`;
        }
        
        characterContext = `\n\n[KARAKTER WAJIB: Tampilkan \${charDetail} yang berinteraksi dengan objek utama atau menunjuk ke arah konten. Pastikan karakter menyatu dengan gaya visual.]`;
    }

    // --- PREPARE CHARACTER LOCK OBJECT ---
    let characterLock: any = null;
    if (form.useCharacter === 'yes') {
        let headwear = "Rambut Sederhana / Topi (Sesuai Konsep)";
        if (form.character === 'Perempuan' || form.character === 'Campuran') {
             if (form.cadar === 'yes') headwear = "Niqab / Cadar (Menutup Wajah)";
             else if (form.hijab === 'yes') headwear = "Hijab / Jilbab Modern (Menutup Rambut)";
        }

        // Logic Override for RAJUT Style
        let charVisualType = `Manusia (\${form.character})`;
        let charSkinType = "Konsisten";
        let charFaceType = form.faceless === 'yes' ? "Faceless atau semi-faceless (tanpa detail wajah realistis)" : "Wajah Detail, Ekspresif, dan Konsisten";
        let lockInstruction = "AI WAJIB menggunakan karakter yang SAMA dan KONSISTEN di seluruh slide.";

        if (form.style === 'Rajut') {
            charVisualType = `Boneka Rajut Amigurumi (\${form.character})`;
            charSkinType = "Tekstur Benang Wol (Knitted Fabric) - BUKAN KULIT MANUSIA";
            charFaceType = form.faceless === 'yes' ? "Polos Rajutan (Tanpa Mata/Mulut)" : "Mata Kancing/Jahitan (Cute Button Eyes)";
            lockInstruction += " Karakter HARUS terlihat seperti boneka rajutan tangan (hand-knitted doll).";
            headwear += " (Bahan Wol/Rajut)";
        }

        characterLock = {
            "status": "aktif",
            "tujuan": "Menjaga konsistensi karakter dari awal hingga akhir slide atau halaman",
            "instruksi_umum": lockInstruction,
            "karakter_utama": {
                "jumlah": "1 (Utama)",
                "jenis": charVisualType,
                "wajah": charFaceType,
                "postur_tubuh": "Proporsi tubuh konsisten, tidak berubah antar slide",
                "ekspresi": form.faceless === 'yes' ? "Ekspresi disampaikan melalui gesture tubuh" : "Ekspresi wajah konsisten",
                "warna_kulit": charSkinType,
                "rambut_penutup_kepala": headwear,
                "pakaian": {
                    "deskripsi": "Desain pakaian karakter ditentukan di awal (Simple & Modern) dan digunakan di semua slide",
                    "warna": "Tetap sama di seluruh slide",
                    "aksesoris": "Jika ada, harus konsisten dan tidak berubah"
                }
            },
            "gaya_visual_karakter": {
                "mengikuti": styleData.gaya_desain,
                "catatan": form.style === 'Rajut' ? "Gaya render WAJIB konsisten tekstur rajutan (Knitted Texture) di semua slide." : "Gaya render karakter harus sama di semua slide."
            },
            "pose_dan_aksi": {
                "aturan": "Pose dan aksi karakter boleh berubah sesuai kebutuhan cerita, NAMUN identitas visual harus tetap sama.",
                "larangan": ["perubahan bentuk wajah", "perubahan gaya pakaian", "perubahan proporsi tubuh", "karakter terlihat seperti orang berbeda"]
            },
            "kontinuitas_visual": {
                "aturan": "Karakter yang muncul di slide pertama HARUS menjadi referensi visual utama untuk seluruh slide berikutnya.",
                "konsistensi": ["warna", "bentuk", "gaya render", "skala relatif terhadap objek lain"]
            },
            "instruksi_teknis_tambahan": "Jika sistem AI mendukung, gunakan referensi karakter dari slide pertama sebagai acuan (visual anchor) untuk seluruh slide selanjutnya."
        };
    }

    // --- LOGIKA MULTI-HALAMAN KHUSUS KOMIK ---
    if (category === 'Komik') {
        const totalPages = parseInt(form.comicPages || '1');
        const slides = [];
        const allPagesJson = [];
        
        const storyLine = form.comicStoryline || "Powerful / Heroic";
        const emotion = form.comicEmotion || "Penasaran (Curious)";

        const comicWorkflowRules = {
            "prinsip_flow_panel": ["1 panel = 1 ide utama (Fokus)", "Jangan lompat logika (Alur harus nyambung)", "Jangan tiba-tiba solusi tanpa proses", "Visual harus membantu cerita, bukan bikin bingung"],
            "urutan_aman_cerita": "Masalah → Proses → Penjelasan → Dampak → Kesimpulan",
            "rumus_storytelling_powerful": "Masalah yang relatable → Proses yang masuk akal → Emosi yang terasa → Solusi yang jelas → Tujuan yang tercapai"
        };

        for (let i = 1; i <= totalPages; i++) {
            let pageJson: any = {};
            let pageType = "";

            if (i === 1) {
                pageType = "Cover Komik";
                pageJson = {
                    "halaman_ke": i,
                    "jenis_halaman": "Cover Komik (Halaman Utama)",
                    "judul_komik": finalTitle,
                    "topik_utama": finalTopic,
                    "rasio": form.ratio,
                    "orientasi": orientation,
                    "gaya_komik": styleData.gaya_desain,
                    "atmosfer_cerita": { "alur": storyLine, "emosi_dominan": emotion },
                    "deskripsi_visual_utama": `Cover komik menampilkan ilustrasi hero yang paling merepresentasikan tema \${finalTopic}. Fokus pada atmosfer \${storyLine}, konflik awal, atau pesan utama komik tanpa dialog panjang. Komposisi center, visual kuat, ekspresif, dan menggugah rasa \${emotion}. Judul komik tampil besar, jelas, dan menjadi fokus utama visual.\\n\\n[INSTRUKSI KHUSUS: gunakan gaya visual \${styleData.gaya_desain}. Pastikan desain cover mencerminkan tone cerita \${storyLine} dan konsisten untuk halaman berikutnya.]`,
                    "judul_visual": { "teks_judul": finalTitle, "sub_teks": finalSubtitle || null, "gaya_tipografi": styleData.font_style, "posisi": "Bagian atas atau tengah cover" },
                    "panel_komik": { "jumlah_panel": 1, "fungsi": "Ilustrasi cover utama (tanpa narasi panjang)" },
                    "negative_prompt": ["low quality", "blur", "unreadable title", "overcrowded layout", "bad anatomy"]
                };
            } else if (i === totalPages && totalPages > 1) {
                pageType = "Penutup Komik";
                pageJson = {
                    "halaman_ke": i,
                    "jenis_halaman": "Penutup Komik",
                    "judul_halaman": "Penutup / Kesimpulan",
                    "gaya_komik": styleData.gaya_desain,
                    "atmosfer_cerita": { "alur": "Resolusi / Ending dari " + storyLine, "emosi_dominan": "Puas / " + emotion },
                    "deskripsi_visual_utama": "Halaman penutup menampilkan kesimpulan cerita secara ringan dan positif. Tidak ada konflik. Visual memberi rasa selesai dan memuaskan pembaca.\\n\\n[INSTRUKSI KHUSUS: tampilkan ringkasan pesan utama atau call to action dalam bentuk visual komik.]",
                    "panel_komik": { "jumlah_panel": 1, "detail_panel": ["Panel tunggal: Kesimpulan visual atau pesan akhir cerita"] },
                    "cta_info": { "teks_cta": cta || "Tamat / Selesai", "kontak": contact || null, "style": "Bubble komik atau teks ringan di pojok" }
                };
            } else {
                let subType = "Inti Cerita";
                let detailPanel = ["Panel 1: Proses atau kejadian utama", "Panel 2: Penjelasan visual atau reaksi karakter", "Panel 3: Penegasan pesan inti cerita"];
                let desc = `Halaman ini berisi inti cerita dan penyampaian pesan utama dengan nuansa \${storyLine} dan emosi \${emotion}.`;

                if (i === 2) {
                    subType = "Pembukaan";
                    detailPanel = ["Panel 1: Pengenalan latar tempat dan waktu cerita", "Panel 2: Perkenalan karakter utama atau situasi awal", "Panel 3: Munculnya masalah, pertanyaan, atau konflik ringan"];
                    desc = "Halaman ini memperkenalkan latar cerita, suasana, dan karakter utama.";
                } else if (i === totalPages - 1 && totalPages > 3) {
                    subType = "Resolusi";
                    detailPanel = ["Panel 1: Penyelesaian masalah atau jawaban dari konflik", "Panel 2: Dampak atau hasil dari solusi yang diberikan"];
                    desc = "Halaman ini mengarahkan cerita menuju penyelesaian. Konflik atau permasalahan mulai terjawab.";
                }

                pageType = `Isi - \${subType}`;
                pageJson = {
                    "halaman_ke": i,
                    "jenis_halaman": `Isi Komik - \${subType}`,
                    "judul_halaman": `Halaman \${i}: \${subType}`,
                    "gaya_komik": styleData.gaya_desain,
                    "atmosfer_cerita": { "alur": storyLine, "emosi_dominan": emotion },
                    "deskripsi_visual_utama": `\${desc} Alur panel runtut dan fokus pada pemahaman pembaca.\\n\\n[INSTRUKSI KHUSUS: AI WAJIB menggunakan hasil riset poin_belajar secara mendalam untuk membangun cerita visual yang informatif, edukatif, dan tidak dangkal. Gunakan mood \${emotion} dalam ekspresi karakter.]`,
                    "panel_komik": { "jumlah_panel": subType === 'Resolusi' ? 2 : 3, "detail_panel": detailPanel }
                };
            }

            pageJson["panduan_teknis_cerita"] = comicWorkflowRules;
            if (characterLock) pageJson["character_lock"] = characterLock;
            if (watermark) pageJson.watermark = { "teks": watermark, "posisi": "Pojok bawah", "gaya": "Minimalis" };
            if (hasLogo) pageJson.brand_logo = { "status": "uploaded", "instruction": logoInstruction };
            if (form.isFunFactEnabled) {
                pageJson.fun_fact = { "status": "aktif", "sumber": form.isFunFactAuto ? "Smart AI" : "User Input", "isi": form.isFunFactAuto ? "Cari fakta unik" : funfact, "penempatan": "Diselipkan dalam narasi" };
            }
            if (instruction) pageJson.instruksi_tambahan = instruction;
            
            // Negative Prompt injection for Hijab
            if (!pageJson.negative_prompt) pageJson.negative_prompt = ["low quality", "blur"];
            if (form.hijab === 'yes' || form.cadar === 'yes') {
                pageJson.negative_prompt.push("hair showing", "loose hair", "visible hair", "no hijab", "revealing clothes");
            }

            // PIXAR NO LOGO OVERRIDE
            if (form.style === 'Pixar') {
                pageJson.negative_prompt.push("Disney logo", "Pixar logo", "studio logo", "movie title text", "production logo", "watermark", "text overlay");
            }

            allPagesJson.push(pageJson);
            slides.push({ title: `Halaman \${i} - \${pageType}`, prompt: JSON.stringify(pageJson, null, 2) });
        }

        return { json: JSON.stringify(allPagesJson, null, 2), description: `Berhasil membuat prompt komik (\${form.comicPages} Hal).`, carouselSlides: slides };
    }

    // --- LOGIKA CAROUSEL ---
    if (category === 'Carousel') {
        const totalSlides = parseInt(form.slideCount || '5');
        const slides = [];
        const allSlidesJson = [];
        const { carouselGoal, carouselStructure, carouselTone, carouselMainVisuals, carouselAddons } = form;

        const carouselConfig = {
            "tujuan_konten": carouselGoal || "Edukasi / Pembelajaran",
            "struktur_alur": carouselStructure || "Hook → Isi → Penutup",
            "gaya_bahasa": carouselTone || "Edukatif Santai",
            "elemen_visual_utama": carouselMainVisuals && carouselMainVisuals.length > 0 ? carouselMainVisuals : ["Ilustrasi"],
            "elemen_tambahan": carouselAddons || []
        };

        for (let i = 1; i <= totalSlides; i++) {
            let slideJson: any = {};
            let slideType = "";

            if (i === 1) {
                slideType = "Cover Carousel";
                slideJson = {
                    "slide_ke": i,
                    "jenis_slide": "Cover Carousel (Hook)",
                    "topik_bahasan": finalTopic,
                    "rasio": form.ratio,
                    "gaya_desain": styleData.gaya_desain,
                    "deskripsi_visual": `Desain cover carousel yang sangat menarik (eye-catching) sesuai gaya \${carouselTone} untuk menghentikan scroll (scroll-stopper). Fokus pada judul besar "\${finalTitle}" yang kontras dan mudah dibaca. Visual utama berupa \${carouselConfig.elemen_visual_utama.join(', ')} yang relevan dengan \${finalTopic}, ekspresif dan mengundang rasa ingin tahu. \${characterContext}`,
                    "teks_overlay": { "headline": finalTitle, "sub_headline": finalSubtitle || "Geser untuk info lengkap 👉" },
                    "instruksi_layout": "Judul dominan di bagian atas/tengah, visual pendukung di sekeliling atau bawah.",
                    "negative_prompt": ["cluttered", "text overload", "messy", "blur", "low resolution"]
                };
            } else if (i === totalSlides) {
                slideType = "Penutup / CTA";
                slideJson = {
                    "slide_ke": i,
                    "jenis_slide": "Penutup & Call to Action",
                    "gaya_desain": styleData.gaya_desain,
                    "deskripsi_visual": `Halaman penutup yang clean dan \${carouselTone}. Menampilkan ringkasan singkat atau ikon-ikon interaksi sosial media. Jika menggunakan karakter, tampilkan pose ramah/mengajak.`,
                    "teks_overlay": { "cta_utama": cta || "Jangan lupa Save & Share!", "info_kontak": contact || "@username" },
                    "instruksi_layout": "Fokus pada elemen ajakan bertindak. Layout minimalis.",
                    "negative_prompt": ["too much text", "distorted text"]
                };
            } else {
                slideType = "Konten";
                slideJson = {
                    "slide_ke": i,
                    "jenis_slide": "Slide Konten / Isi",
                    "poin_bahasan": `Poin penjelasan ke-\${i-1}`,
                    "gaya_desain": styleData.gaya_desain,
                    "deskripsi_visual": `Visualisasi menarik untuk poin konten ke-\${i-1} tentang \${finalTopic} dengan gaya bahasa \${carouselTone}. Gunakan \${carouselConfig.elemen_visual_utama.join(' atau ')} yang menjelaskan poin tersebut secara visual.`,
                    "teks_overlay": { "judul_poin": `Headline Poin \${i-1}`, "isi_poin": "Penjelasan ringkas" },
                    "instruksi_layout": "Split layout (Atas Visual, Bawah Teks) atau sebaliknya.",
                    "negative_prompt": ["wall of text", "boring layout"]
                };
            }

            slideJson["konfigurasi_carousel"] = carouselConfig;
            if (characterLock) slideJson["character_lock"] = characterLock;
            if (watermark) slideJson.watermark = { "teks": watermark, "posisi": "Footer", "gaya": "Konsisten" };
            if (hasLogo) slideJson.brand_logo = { "status": "uploaded", "instruction": logoInstruction };
            if (form.isFunFactEnabled) slideJson.fun_fact = { "status": "aktif", "sumber": form.isFunFactAuto ? "Smart AI" : "User Input", "isi": form.isFunFactAuto ? "Cari fakta unik" : funfact };
            
            let extraInstruction = instruction || "";
            if (carouselConfig.elemen_tambahan.length > 0) extraInstruction += ` Wajib sertakan elemen tambahan: \${carouselConfig.elemen_tambahan.join(', ')} secara rapi.`;
            if (extraInstruction) slideJson.instruksi_tambahan = extraInstruction;

            // Negative Prompt injection for Hijab
            if (!slideJson.negative_prompt) slideJson.negative_prompt = ["low quality"];
            if (form.hijab === 'yes' || form.cadar === 'yes') {
                slideJson.negative_prompt.push("hair showing", "loose hair", "visible hair", "no hijab");
            }

            // PIXAR NO LOGO OVERRIDE
            if (form.style === 'Pixar') {
                slideJson.negative_prompt.push("Disney logo", "Pixar logo", "studio logo", "movie title text", "production logo", "watermark", "text overlay");
            }

            allSlidesJson.push(slideJson);
            slides.push({ title: `Slide \${i} - \${slideType}`, prompt: JSON.stringify(slideJson, null, 2) });
        }

        return { json: JSON.stringify(allSlidesJson, null, 2), description: `Berhasil membuat prompt carousel.`, carouselSlides: slides };
    }

    // --- STANDARD SINGLE PAGE LOGIC (Poster, dsb) ---
    
    let poinBelajarObj;
    if (!form.isContentAuto && content && content.trim().length > 0) {
        poinBelajarObj = { "sistem": "Manual Input", "instruksi": "Gunakan data berikut.", "data": content.split('\\n'), "visualisasi": "Terjemahkan poin manual." };
    } else {
        poinBelajarObj = {
            "sistem": "Smart AI",
            "instruksi": "AI WAJIB melakukan riset mendalam berdasarkan judul dan topik poster. Susun poin belajar secara KOMPREHENSIF.",
            "jumlah_poin": "3–6 poin utama",
            "visualisasi": "Setiap poin belajar HARUS dapat diterjemahkan menjadi elemen visual.",
            "output_format": "Materi konseptual lengkap"
        };
    }

    let funFactObj = undefined;
    if (form.isFunFactEnabled) {
        funFactObj = { 
            "opsional": true,
            "sistem": form.isFunFactAuto ? "Smart AI" : "Manual Input",
            "instruksi": "Jika diaktifkan, AI WAJIB melakukan riset untuk menghasilkan fun fact yang benar-benar MENARIK, AKURAT, dan RELEVAN langsung dengan topik poster. Fun fact tidak boleh klise, spekulatif, atau terlalu umum. Harus memberikan wawasan baru, sudut pandang unik, data menarik, atau informasi tak terduga yang masih sesuai dengan target audiens.",
            "isi_konten": form.isFunFactAuto ? "Auto generated based on topic" : funfact,
            "jumlah": "2–4 fun fact",
            "kedalaman": "Setiap fun fact dijelaskan dengan kalimat informatif yang jelas, bukan hanya frasa pendek.",
            "validitas": "Fun fact harus berbasis pengetahuan yang dapat dipertanggungjawabkan (ilmiah, historis, edukatif, atau kontekstual).",
            "tampilan": "Ditampilkan dalam box atau container visual khusus",
            "catatan": "Jika tidak diaktifkan oleh user, bagian ini tidak ditampilkan sama sekali"
        };
    }

    const promptJson: any = {
        "judul_poster": finalTitle,
        "jenis_poster": `Poster \${category} (\${form.eduType || 'Umum'})`,
        "topik_utama": finalTopic,
        "rasio": form.ratio,
        "orientasi": orientation,
        "gaya_desain": styleData.gaya_desain,
        "deskripsi_visual_utama": `Visual utama harus menampilkan representasi paling relevan dari topik atau judul poster. Fokus pada objek atau subjek utama tanpa karakter manusia kecuali memang diperlukan oleh konsep. Objek utama harus dominan, detail, dan menjadi fokus komposisi. \${characterContext}\\n\\n[INSTRUKSI KHUSUS: gunakan gaya visual sesuai dengan "gaya_desain" yang dipilih oleh user. Sebelum mengenerate gambar, AI WAJIB meriset terlebih dahulu poin_belajar.] \${logoInstruction}`,
        "judul_visual": { "teks_judul": finalTitle, "sub_teks": finalSubtitle || "Subjudul / Tagline", "gaya_tipografi": styleData.font_style, "posisi": "Terintegrasi natural" },
        "background": { "deskripsi": "Background harus relevan dengan topik poster.", "warna": "Mengikuti palet warna harmonis", "tekstur": styleData.tekstur },
        "layout": { "header": "Judul dan subjudul", "konten_utama": "Visual utama", "footer": "CTA, fun fact, dan watermark" },
        "poin_belajar": poinBelajarObj,
        ...(funFactObj && { "fun_fact": funFactObj }),
        "palet_warna": styleData.palet,
        "pencahayaan": styleData.pencahayaan,
        "kualitas_visual": "High quality, ultra-detailed, clean, sharp",
        "watermark": { "teks": watermark || "Brand Name", "posisi": "Pojok", "gaya": "Minimalis" },
        "cta_info": { "teks_cta": cta || "Call To Action", "kontak": contact || "Opsional" },
        "negative_prompt": ["low quality", "blur", "pixelated", "noise", "distorted", "bad composition", "unreadable text", "typo", "overcrowded layout", "bad anatomy", "watermark overuse"]
    };

    if (hasLogo) promptJson.brand_logo = { "status": "uploaded", "instruction": logoInstruction };

    // ANATOMI OVERRIDE
    if (category === 'Anatomi') {
        promptJson.jenis_poster = "Technical Anatomy / Scientific Diagram";
        promptJson.layout.layout_style = "Center Subject with Surrounding Labels";
        promptJson.deskripsi_visual_utama = `Visualkan sebagai diagram anatomi atau struktur yang sangat detail untuk '\${finalTopic}'. Tampilkan objek utama di tengah (Center Composition). Gunakan garis penunjuk (leader lines).`;
        promptJson.negative_prompt.push("missing labels", "unclear lines", "messy text");
        if (form.isFunFactEnabled && promptJson.fun_fact) promptJson.fun_fact.tampilan = "Pojok bawah atau kotak info terpisah dengan gaya teknis";
    }

    // RAJUT OVERRIDE (Negative Prompt)
    if (form.style === 'Rajut') {
        promptJson.negative_prompt.push("realistic skin", "human flesh", "shiny plastic", "smooth skin", "2d", "flat", "drawing");
    }

    // --- HIJAB NEGATIVE PROMPT (UNIVERSAL) ---
    if (form.hijab === 'yes' || form.cadar === 'yes') {
        promptJson.negative_prompt.push("hair showing", "loose hair", "visible hair", "hair strand", "no hijab", "revealing clothes");
    }

    // --- PIXAR NO LOGO OVERRIDE ---
    if (form.style === 'Pixar') {
        promptJson.negative_prompt.push("Disney logo", "Pixar logo", "studio logo", "movie title text", "production logo", "watermark", "text overlay");
    }

    if (instruction) promptJson.instruksi_tambahan_user = instruction;
    if (form.mode.includes('3D') || form.mode.includes('Blender')) promptJson.negative_prompt.push("2D", "flat", "anime", "cartoon");

    // Standard Midjourney Prompt String
    let mjPrompt = `/imagine prompt: \${styleData.gaya_desain}. Poster for \${category} about \${finalTopic}. Title: "\${finalTitle}". `;
    mjPrompt += `\${promptJson.deskripsi_visual_utama} `;
    mjPrompt += `Colors: \${styleData.palet.join(', ')}. High quality, ultra-detailed. `;
    if (form.instruction) mjPrompt += `Note: \${form.instruction}. `;
    if (hasLogo) mjPrompt += " Leave negative space for logo. ";
    // Add hijab logic to MJ string specifically if needed, though desc_visual_utama covers it
    if (form.hijab === 'yes') mjPrompt += " Character wearing Hijab/Headscarf covering hair. ";
    
    mjPrompt += `--ar \${form.ratio.replace(':','-')} --v 6.0`;
    if (form.hijab === 'yes' || form.cadar === 'yes') mjPrompt += " --no hair";
    if (form.style === 'Pixar') mjPrompt += " --no Disney logo, Pixar logo, text";

    return {
        json: JSON.stringify(promptJson, null, 2),
        description: mjPrompt
    };
};
