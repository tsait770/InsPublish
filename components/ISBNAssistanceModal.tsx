import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Landmark, UserCheck, ArrowUpRight, Globe, X, Barcode, PaperPlane } from 'lucide-react';
import { SupportedLanguage, Project, SpineNodeId, PublishingSpineState } from '../types';
import { INITIAL_SPINE_NODES } from '../constants';

interface ISBNAssistanceModalProps {
  currentLanguage: SupportedLanguage;
  userCountryCode: string;
  onClose: () => void;
  onISBNValidated: (isbn: string) => void;
  project?: Project | null;
  onUpdateProject?: (p: Project) => void;
}

const ISBN_ASSISTANCE_DATA: Record<string, any> = {
  'TW': {
    agency: '國家圖書館國際標準書號中心 (NCL)',
    url: 'https://isbn.ncl.edu.tw/',
    eligibility: '個人創作者 / 出版社 / 公司行號',
    desc: '台灣 ISBN 由國圖免費核發，申請流程約 3-5 個工作日。建議先申請「全國圖書書目資訊網」帳號。'
  },
  'US': {
    agency: 'Bowker Identifier Services',
    url: 'https://www.myidentifiers.com/',
    eligibility: 'Self-Publishers / Companies',
    desc: 'United States ISBNs are managed by Bowker. They require a fee per number or for blocks of 10/100.'
  },
  'CN': {
    agency: '中國版本圖書館 (國家新聞出版署)',
    url: 'https://www.capub.cn/',
    eligibility: '具備出版資質的出版社',
    desc: '中國 ISBN 需透過正規出版社進行「書號申領」，個人無法直接向政府機構申請。'
  },
  'UK': {
    agency: 'Nielsen Book Services',
    url: 'https://www.nielsenbook.co.uk/',
    eligibility: 'Publishers / Individuals',
    desc: 'Nielsen is the official ISBN agency for the UK and Ireland.'
  },
  'DE': {
    agency: 'MVB (Marketing- und Verlagsservice des Buchhandels)',
    url: 'https://www.isbn-shop.de/',
    eligibility: 'Verlage / Selbstverleger',
    desc: 'In Deutschland ist die MVB die offizielle Agentur. Eine Registrierung ist für den gewerblichen Verkauf im Buchhandel essentiell.'
  },
  'FR': {
    agency: 'AFNIL (Agence Francophone pour la Numérotation Internationale du Livre)',
    url: 'https://www.afnil.org/',
    eligibility: 'Éditeurs / Auteurs auto-édités',
    desc: "L'AFNIL gère l'attribution des ISBN en France. Le délai de處理時間約 3 週。"
  }
};

const ISBNAssistanceModal: React.FC<ISBNAssistanceModalProps> = ({ currentLanguage, userCountryCode, onClose, onISBNValidated, project, onUpdateProject }) => {
  const [inputIsbn, setInputIsbn] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(userCountryCode);

  const isAlreadyPending = project?.publishingSpine?.nodes[SpineNodeId.ISBN_ASSIGNED]?.isPendingReview;

  const isValidISBN13 = (isbn: string) => {
    const clean = isbn.replace(/[- ]/g, "");
    if (!/^\d{13}$/.test(clean)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(clean[12]);
  };

  const isCurrentValid = useMemo(() => isValidISBN13(inputIsbn), [inputIsbn]);

  const assistanceInfo = useMemo(() => {
    return ISBN_ASSISTANCE_DATA[selectedCountry] || ISBN_ASSISTANCE_DATA['US'];
  }, [selectedCountry]);

  const showCrossBorderHint = userCountryCode !== 'TW' && currentLanguage === 'zh-TW';

  const handleGenerateMock = () => {
    const prefix = "978";
    const body = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const fullPrefix = prefix + body;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(fullPrefix[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    setInputIsbn(`${prefix}-${body}-${checkDigit}`);
  };

  const handleMarkAsSubmitted = () => {
    if (!project || !onUpdateProject) return;
    const currentSpine = project.publishingSpine || { currentNode: SpineNodeId.WRITING, nodes: INITIAL_SPINE_NODES() };
    
    const updatedSpine: PublishingSpineState = {
      ...currentSpine,
      nodes: {
        ...currentSpine.nodes,
        [SpineNodeId.ISBN_ASSIGNED]: {
          id: SpineNodeId.ISBN_ASSIGNED,
          isCompleted: false,
          isPendingReview: true,
          timestamp: Date.now()
        }
      }
    };

    onUpdateProject({
      ...project,
      publishingSpine: updatedSpine
    });
    alert("ISBN 申請狀態已更新為：已送審（審核中）。");
  };

  return createPortal(
    <div className="fixed inset-0 z-[7000] flex items-end sm:items-center justify-center p-0 sm:p-8 animate-in fade-in duration-500 font-sans">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-[#0F0F11] border-t sm:border border-white/10 rounded-t-[44px] sm:rounded-[44px] shadow-3xl overflow-hidden flex flex-col h-[90vh] animate-in slide-in-from-bottom duration-700">
        
        <header className="px-8 sm:px-12 pt-10 pb-8 border-b border-white/5 bg-[#0F0F11] shrink-0">
          <div className="flex justify-between items-start">
             <div>
               <h2 className="text-3xl font-black text-white tracking-tighter">國際 ISBN 協助引擎</h2>
               <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] mt-1">GLOBAL PUBLISHING IDENTIFIER HUB</p>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 active:scale-90 transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 sm:p-12 space-y-12 pb-40">
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-2">地域性建議 REGIONAL GUIDANCE</h3>
                <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                   {['TW', 'US', 'UK', 'DE', 'FR', 'CN'].map(c => (
                     <button key={c} onClick={() => setSelectedCountry(c)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${selectedCountry === c ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{c}</button>
                   ))}
                </div>
             </div>

             <div className="p-10 bg-gradient-to-br from-[#1A2538] to-black rounded-[44px] border border-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex items-start space-x-6 relative z-10">
                   <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-white text-3xl shadow-2xl"><i className="fa-solid fa-landmark"></i></div>
                   <div className="space-y-4">
                      <h4 className="text-xl font-black text-white">{assistanceInfo.agency}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">{assistanceInfo.desc}</p>
                      <div className="flex flex-wrap gap-4 pt-4">
                         <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                            <i className="fa-solid fa-user-check text-[10px] text-blue-400"></i>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{assistanceInfo.eligibility}</span>
                         </div>
                         <a href={assistanceInfo.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-5 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                            <span>訪問官網</span>
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                         </a>
                      </div>
                   </div>
                </div>
                
                {showCrossBorderHint && (
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-start space-x-4 animate-in fade-in slide-in-from-top-2 duration-500">
                     <i className="fa-solid fa-earth-americas text-amber-500 mt-0.5"></i>
                     <div className="space-y-1">
                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">跨國出版提示</p>
                        <p className="text-[12px] text-gray-500 font-medium">您的地區與寫作語言不同。若打算在台灣出版繁體中文版，建議取得 NCL (國圖) 的 ISBN。</p>
                     </div>
                  </div>
                )}
             </div>

             <button onClick={handleMarkAsSubmitted} className={`w-full py-5 rounded-[28px] flex items-center justify-center space-x-4 transition-all border ${isAlreadyPending ? 'bg-amber-600/10 border-amber-600/30 text-amber-500' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                <i className={`fa-solid ${isAlreadyPending ? 'fa-circle-check' : 'fa-paper-plane'}`}></i>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isAlreadyPending ? '已標記為送審中' : '我已在外部機構提交申請'}</span>
             </button>
          </section>

          <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest">驗證與配置 VALIDATION</h3>
                <button onClick={handleGenerateMock} className="text-[9px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 rounded-full hover:bg-amber-500/10">生成臨時 ISBN</button>
             </div>

             <div className="bg-[#121214] p-10 rounded-[44px] border border-white/5 space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">請輸入 13 位數 ISBN 碼</label>
                   <div className="relative">
                      <input value={inputIsbn} onChange={(e) => setInputIsbn(e.target.value)} placeholder="例如: 978-0-1234-5678-9" className={`w-full h-24 px-8 bg-black/40 border rounded-[32px] text-2xl font-black outline-none transition-all tracking-[0.1em] ${inputIsbn ? (isCurrentValid ? 'border-[#D4FF5F] text-[#D4FF5F]' : 'border-red-500 text-red-500') : 'border-white/10 text-white focus:border-blue-600'}`} />
                      {inputIsbn && (
                        <div className={`absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center ${isCurrentValid ? 'bg-[#D4FF5F] text-black shadow-[0_0_20px_rgba(212,255,95,0.4)]' : 'bg-red-500 text-white'}`}><i className={`fa-solid ${isCurrentValid ? 'fa-check' : 'fa-xmark'}`}></i></div>
                      )}
                   </div>
                </div>
             </div>
          </section>
        </div>

        <footer className="absolute bottom-0 inset-x-0 p-8 sm:p-12 bg-gradient-to-t from-black via-black to-transparent shrink-0 z-30">
          <button disabled={!isCurrentValid} onClick={() => onISBNValidated(inputIsbn.replace(/[- ]/g, ""))} className={`w-full h-24 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center space-x-4 ${isCurrentValid ? 'bg-white text-black hover:brightness-110' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>
            <i className="fa-solid fa-barcode text-xs"></i>
            <span>確 認 並 使 用 此 識 別 碼</span>
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ISBNAssistanceModal;
