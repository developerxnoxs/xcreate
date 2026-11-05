import React from 'react';
import { CharacterAppearanceOptions } from '../types';
import { Loader2, Sparkles, User, HelpCircle } from 'lucide-react';

interface CharacterAppearanceFormProps {
  value: CharacterAppearanceOptions;
  onChange: (value: CharacterAppearanceOptions) => void;
  disabled: boolean;
  prefixId: string;
  onAutofillColors?: () => void;
  isGeneratingColors?: boolean;
}

const COMMON_HEADWEAR = [
  "Tidak Ada",
  "Helm Astronot 🚀",
  "Kacamata Lab (Goggles) 🧪",
  "Topi Penjelajah Hutan 🤠",
  "Topi Petualang / Fedora 🧭",
  "Helm Penyelam 🤿",
  "Topi Wisuda / Sarjana 🎓",
  "Topi",
  "Mahkota",
  "Kupluk",
  "Bandana",
  "Pita Rambut"
];

const COMMON_UPPER_BODY = [
  "Kaos",
  "Jas Laboratorium Putih 🥼",
  "Baju Astronaut Ketat 🧑‍🚀",
  "Kemeja Peneliti Rapi 👔",
  "Jaket Penjelajah Tebal 🧥",
  "Kemeja",
  "Gaun",
  "Baju Zirah",
  "Mantel",
  "Hoodie",
  "Sweater"
];

const COMMON_LOWER_BODY = [
  "Celana Panjang",
  "Celana Pendek",
  "Celana Cargo Kantong Banyak 🥾",
  "Celana Zirah / Pelindung 🛡️",
  "Rok",
  "Jeans",
  "Legging"
];

const COMMON_FOOTWEAR = [
  "Sepatu Kets Nyaman 👟",
  "Sepatu Bot Penjelajah 🥾",
  "Sepatu Bot Astronaut 🧑‍🚀",
  "Sepatu",
  "Sandal",
  "Nyeker / Tanpa Sepatu"
];

const COMMON_ACCESSORIES = [
  "Tidak Ada",
  "Kaca Pembesar Magic 🔍",
  "Tablet Sains & Peta Semesta 📱",
  "Kompas Penunjuk Arah 🧭",
  "Tabung Reaksi Kimia Berkilau 🧪",
  "Ransel Ekspedisi Besar 🎒",
  "Kacamata",
  "Kalung",
  "Anting",
  "Gelang",
  "Jubah",
  "Syal",
  "Sarung Tangan"
];

export const CharacterAppearanceForm: React.FC<CharacterAppearanceFormProps> = ({ value, onChange, disabled, prefixId, onAutofillColors, isGeneratingColors }) => {
  const handleChange = (field: keyof CharacterAppearanceOptions) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange({ ...value, [field]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden backdrop-blur-sm">
      {/* Decorative subtle background icon */}
      <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
        <User className="w-24 h-24 text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Penutup Kepala */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefixId}-headwear`} className="text-xs text-slate-300 font-bold flex items-center gap-1">
            Penutup Kepala / Aksesoris Wajah
          </label>
          <select
            id={`${prefixId}-headwear`}
            value={value.headwear}
            onChange={handleChange('headwear')}
            disabled={disabled}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none bg-slate-950/80 text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value="">-- Pilih Aksesoris Kepala --</option>
            {COMMON_HEADWEAR.map(opt => <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>)}
          </select>
        </div>

        {/* Pakaian Atas */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefixId}-upper-body`} className="text-xs text-slate-300 font-bold flex items-center gap-1">
            Pakaian Atas
          </label>
          <select
            id={`${prefixId}-upper-body`}
            value={value.upperBodyClothing}
            onChange={handleChange('upperBodyClothing')}
            disabled={disabled}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none bg-slate-950/80 text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value="">-- Pilih Pakaian Atas --</option>
            {COMMON_UPPER_BODY.map(opt => <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>)}
          </select>
        </div>

        {/* Pakaian Bawah */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefixId}-lower-body`} className="text-xs text-slate-300 font-bold flex items-center gap-1">
            Pakaian Bawah
          </label>
          <select
            id={`${prefixId}-lower-body`}
            value={value.lowerBodyClothing}
            onChange={handleChange('lowerBodyClothing')}
            disabled={disabled}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none bg-slate-950/80 text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value="">-- Pilih Pakaian Bawah --</option>
            {COMMON_LOWER_BODY.map(opt => <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>)}
          </select>
        </div>

        {/* Alas Kaki */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefixId}-footwear`} className="text-xs text-slate-300 font-bold flex items-center gap-1">
            Alas Kaki
          </label>
          <select
            id={`${prefixId}-footwear`}
            value={value.footwear}
            onChange={handleChange('footwear')}
            disabled={disabled}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none bg-slate-950/80 text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value="">-- Pilih Alas Kaki --</option>
            {COMMON_FOOTWEAR.map(opt => <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>)}
          </select>
        </div>

        {/* Aksesoris Sains / Umum */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefixId}-accessories`} className="text-xs text-slate-300 font-bold flex items-center gap-1">
            Alat Sains & Gadget Spesial
          </label>
          <select
            id={`${prefixId}-accessories`}
            value={value.accessories}
            onChange={handleChange('accessories')}
            disabled={disabled}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none bg-slate-950/80 text-slate-200 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value="">-- Pilih Alat Bawaan --</option>
            {COMMON_ACCESSORIES.map(opt => <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>)}
          </select>
        </div>

        {/* Detail Warna / Khusus */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center">
            <label htmlFor={`${prefixId}-custom`} className="text-xs text-slate-300 font-bold flex items-center gap-1">
              Palet Warna Rambut & Tubuh
            </label>
            {onAutofillColors && (
              <button
                type="button"
                onClick={onAutofillColors}
                disabled={disabled || isGeneratingColors}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 transition-all font-bold cursor-pointer"
                title="Saran warna menarik secara otomatis"
              >
                {isGeneratingColors ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5 text-cyan-400" />}
                Autofill Warna
              </button>
            )}
          </div>
          <input
            type="text"
            id={`${prefixId}-custom`}
            value={value.customDetails}
            onChange={handleChange('customDetails')}
            disabled={disabled}
            placeholder="Contoh: Rambut biru galaksi, jas lab putih neon"
            className="w-full p-2.5 text-xs rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none bg-slate-950/80 text-slate-200 hover:border-slate-600 transition-colors placeholder:text-slate-600"
          />
        </div>
      </div>
    </div>
  );
};

