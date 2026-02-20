
import React, { useMemo } from 'react';
import { Project } from '../types';

interface ExportConfigProps {
  project: Project | null;
  onBack: () => void;
  onNext: () => void;
  config: {
    author: string;
    isbn: string;
    pubYear: string;
    language: string;
    selectedFont: 'serif' | 'sans';
    exportRange: 'all' | 'custom';
    isPageNumbering: boolean;
    isHeadersFooters: boolean;
  };
  onUpdate: (key: string, value: any) => void;
}

const ExportConfig: React.FC<ExportConfigProps> = ({ project, onBack, onNext, config, onUpdate }) => {
  const languages = [
    "English", "繁體中文", "简体中文", "Español", "Português (Brasil)", "Português",
    "Deutsch", "Français", "Italiano", "Nederlands", "Svenska", "Türkçe", "Русский",
    "日本語", "한국어", "ไทย", "Tiếng Việt", "Bahasa Indonesia", "Bahasa Melayu", "العربية", "हिन्दी"
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-[#000000] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-white font-sans">
      <header className="h-20 px-6 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start text-gray-400">
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] flex-1 text-center">Export Configuration</h2>
        <button className="w-10 h-10 flex items-center justify-end text-blue-500 text-[10px] font-black uppercase tracking-widest">
          Help
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar space-y-10">
        <div className="bg-[#121214] rounded-[44px] p-10 border border-white/5 relative">
          <h4 className="text-[34px] font-black text-white tracking-tighter leading-none mb-1">{project?.name || '未命名專案'}</h4>
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-8">PAGE 1 OF {Math.ceil((project?.chapters.reduce((acc, c) => acc + c.wordCount, 0) || 0) / 400) || 1} • CHAPTER 1</p>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Document Preview</p>
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Visual representation based on current settings.</p>
            </div>
            <button className="px-8 py-3 border border-blue-600/30 text-blue-500 text-[11px] font-black rounded-2xl uppercase tracking-widest">Ready</button>
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-widest px-2">Output Options</h3>
           <div className="grid grid-cols-2 gap-4">
             <button onClick={() => onUpdate('exportRange', 'all')} className={`py-7 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${config.exportRange === 'all' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-[#121214] text-gray-600'}`}>All Chapters</button>
             <button onClick={() => onUpdate('exportRange', 'custom')} className={`py-7 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${config.exportRange === 'custom' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-[#121214] text-gray-600'}`}>Custom Range</button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onUpdate('selectedFont', 'serif')} className={`h-[240px] rounded-[44px] flex flex-col items-center justify-center space-y-2 border-2 transition-all ${config.selectedFont === 'serif' ? 'bg-[#121214] border-blue-600 shadow-[0_0_0_2px_rgba(37,99,235,0.5)]' : 'bg-[#121214] border-transparent opacity-30'}`}>
            <span className="text-[48px] font-serif">Aa</span>
            <span className="text-[16px] font-black">Serif</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Classic</span>
          </button>
          <button onClick={() => onUpdate('selectedFont', 'sans')} className={`h-[240px] rounded-[44px] flex flex-col items-center justify-center space-y-2 border-2 transition-all ${config.selectedFont === 'sans' ? 'bg-[#121214] border-blue-600 shadow-[0_0_0_2px_rgba(37,99,235,0.5)]' : 'bg-[#121214] border-transparent opacity-30'}`}>
            <span className="text-[48px] font-sans">Aa</span>
            <span className="text-[16px] font-black">Sans-serif</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Modern</span>
          </button>
        </div>

        <div className="space-y-4">
           <div className="bg-[#121214] h-[92px] rounded-[46px] px-8 flex items-center justify-between shadow-xl">
              <span className="text-[15px] font-black uppercase tracking-[0.2em]">Page Numbering</span>
              <button onClick={() => onUpdate('isPageNumbering', !config.isPageNumbering)} className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${config.isPageNumbering ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.isPageNumbering ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>
           <div className="bg-[#121214] h-[92px] rounded-[46px] px-8 flex items-center justify-between shadow-xl">
              <span className="text-[15px] font-black uppercase tracking-[0.2em]">Headers & Footers</span>
              <button onClick={() => onUpdate('isHeadersFooters', !config.isHeadersFooters)} className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${config.isHeadersFooters ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.isHeadersFooters ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>
        </div>

        <div className="space-y-4 pb-20">
          <div className="bg-[#121214] h-[92px] rounded-[46px] px-8 flex items-center shadow-xl">
            <input value={config.author} onChange={e => onUpdate('author', e.target.value)} placeholder="Author Name" className="w-full bg-transparent outline-none border-none text-[15px] font-black text-white placeholder-[#8E8E93]" />
          </div>
          <div className="bg-[#121214] h-[92px] rounded-[46px] px-8 flex items-center shadow-xl">
            <input value={config.isbn} onChange={e => onUpdate('isbn', e.target.value)} placeholder="ISBN-13 (Optional)" className="w-full bg-transparent outline-none border-none text-[15px] font-black text-white placeholder-[#8E8E93]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#121214] h-[92px] rounded-[46px] px-8 flex items-center shadow-xl">
                <input value={config.pubYear} onChange={e => onUpdate('pubYear', e.target.value)} placeholder="2026" className="w-full bg-transparent outline-none border-none text-[15px] font-black text-white placeholder-[#8E8E93]" />
             </div>
             <div className="bg-[#121214] h-[92px] rounded-[46px] px-8 flex items-center justify-between shadow-xl relative overflow-hidden">
                <select value={config.language} onChange={e => onUpdate('language', e.target.value)} className="w-full h-full bg-transparent outline-none border-none text-[15px] font-black text-white appearance-none cursor-pointer z-10">
                  {languages.map(lang => (<option key={lang} value={lang} className="bg-[#121214] text-white">{lang}</option>))}
                </select>
                <i className="fa-solid fa-chevron-down text-gray-800 text-[10px] absolute right-8 pointer-events-none"></i>
             </div>
          </div>
        </div>
      </main>

      <footer className="p-10 pb-12 shrink-0 bg-gradient-to-t from-black via-black/80 to-transparent">
         <button onClick={onNext} className="w-full h-[96px] bg-blue-600 rounded-[48px] flex items-center justify-center space-x-5 shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center"><i className="fa-solid fa-arrow-right text-xs"></i></div>
            <span className="text-[14px] font-black uppercase tracking-[0.4em]">Proceed to Distribution</span>
         </button>
      </footer>
    </div>
  );
};

export default ExportConfig;
