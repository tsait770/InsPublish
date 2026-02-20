
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SupportedLanguage } from '../types';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
}

const ALL_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'es', name: 'Español' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sv', name: 'Svenska' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

const PRIMARY_CODES: SupportedLanguage[] = ['en', 'es', 'pt-BR', 'fr', 'de', 'ja', 'ko', 'ar'];
const REGIONS = ['TW', 'US', 'UK', 'CN', 'JP', 'KR', 'ES', 'FR', 'DE'];

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  userCountryCode?: string;
  onSelect: (lang: SupportedLanguage) => void;
  onCountrySelect?: (code: string) => void;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, userCountryCode = 'TW', onSelect, onCountrySelect, onClose }) => {
  const [showAll, setShowAll] = useState(false);

  // Layer 1: Recommended (Current + Standard defaults)
  const recommended = useMemo(() => {
    return ALL_LANGUAGES.filter(l => l.code === currentLanguage || l.code === 'en' || l.code === 'zh-TW').slice(0, 3);
  }, [currentLanguage]);

  // Layer 2: Primary (Fixed top-tier languages)
  const primary = useMemo(() => {
    return ALL_LANGUAGES.filter(l => PRIMARY_CODES.includes(l.code));
  }, []);

  const handleLanguageClick = (code: SupportedLanguage) => {
    onSelect(code);
  };

  const handleCountryClick = (code: string) => {
    if (onCountrySelect) onCountrySelect(code);
  };

  const renderItem = (lang: LanguageOption) => (
    <button
      key={lang.code}
      onClick={() => handleLanguageClick(lang.code)}
      className={`w-full h-16 px-8 flex items-center justify-between transition-all active:scale-[0.98] ${
        currentLanguage === lang.code ? 'bg-blue-600/10' : 'hover:bg-white/5'
      }`}
    >
      <span className={`text-[15px] font-bold ${currentLanguage === lang.code ? 'text-blue-500' : 'text-gray-200'}`}>
        {lang.name}
      </span>
      {currentLanguage === lang.code && (
        <i className="fa-solid fa-check text-blue-500 text-xs"></i>
      )}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-xl bg-[#0F0F10] border-t sm:border border-white/10 rounded-t-[44px] sm:rounded-[44px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
        
        {/* Header */}
        <header className="px-8 pt-10 pb-6 shrink-0 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">系統設定 / Settings</h2>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">Language & Region Preferences</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-10">
          
          {/* Section 0: Region (Persistent Feature) */}
          <section className="space-y-4 px-8">
            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em]">Region Preference (Persistent)</h3>
            <div className="flex flex-wrap gap-2">
               {REGIONS.map(code => (
                 <button 
                    key={code}
                    onClick={() => handleCountryClick(code)}
                    className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all border ${userCountryCode === code ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'}`}
                 >
                   {code}
                 </button>
               ))}
            </div>
            <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest mt-2">設定後將自動持久化儲存於本地 IndexedDB。</p>
          </section>

          {/* Section 1: Recommended */}
          <section className="space-y-3">
            <h3 className="px-8 text-[11px] font-black text-gray-600 uppercase tracking-[0.3em]">Recommended Languages</h3>
            <div className="divide-y divide-white/5 border-y border-white/5">
              {recommended.map(renderItem)}
            </div>
          </section>

          {/* Section 2: Primary Languages */}
          <section className="space-y-3">
            <h3 className="px-8 text-[11px] font-black text-gray-600 uppercase tracking-[0.3em]">Primary Languages</h3>
            <div className="divide-y divide-white/5 border-y border-white/5">
              {primary.map(renderItem)}
            </div>
          </section>

          {/* Section 3: All Languages (Collapsed/Expandable) */}
          <section className="px-8 pb-10">
            {!showAll ? (
              <button 
                onClick={() => setShowAll(true)}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                View All Languages ({ALL_LANGUAGES.length})
              </button>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em]">All Languages</h3>
                <div className="divide-y divide-white/5 border border-white/5 rounded-3xl overflow-hidden bg-black/20">
                  {ALL_LANGUAGES.map(renderItem)}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="p-8 bg-[#0F0F10] border-t border-white/5 shrink-0">
          <button onClick={onClose} className="w-full py-6 rounded-[32px] bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all">
             Save and Exit
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default LanguageSelector;
