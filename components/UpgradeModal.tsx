
import React, { useEffect } from 'react';
import { MembershipLevel } from '../types';

interface UpgradeModalProps {
  variant: 'A' | 'B';
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ variant, onClose }) => {
  const copy = variant === 'A' ? {
    headline: "守護您的文字遺產",
    sub: "文字是靈魂的碎片。InsPublish Pro 為您提供完整的版本歷史，確保每一個字都能在時光中永恆留存。",
    cta: "開始 90 天試用"
  } : {
    headline: "開啟專業出版之路",
    sub: "整合出版級排版與 Gemini AI 專家分析。現在升級，獲得全方位專業作家支援。",
    cta: "立即解鎖專業版"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-[#1e293b] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-700">
        <div className="p-12 md:w-1/2">
           <span className="text-blue-500 font-bold text-[10px] tracking-widest uppercase mb-4 block">Limited Offer</span>
           <h2 className="text-4xl font-bold text-white mb-6 leading-tight shine-text">{copy.headline}</h2>
           <p className="text-slate-400 text-sm mb-8">{copy.sub}</p>
           
           <div className="space-y-4 mb-10">
              <div className="flex items-center space-x-3 text-slate-300 text-xs">
                 <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                 <span>無限里程碑版本回溯</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300 text-xs">
                 <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                 <span>多格式出版級匯出 (EPUB/PDF)</span>
              </div>
           </div>

           <button onClick={onClose} className="primary-button w-full h-12">
             {copy.cta}
           </button>
           <p className="text-center text-[9px] text-slate-500 mt-4 uppercase tracking-tighter">無需信用卡 · 試用期後自動轉為 $4.99/mo</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-900/20 md:w-1/2 p-12 flex items-center justify-center">
           <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">90</div>
              <div className="text-sm font-bold text-blue-400 tracking-[0.2em] uppercase">Free Days</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
