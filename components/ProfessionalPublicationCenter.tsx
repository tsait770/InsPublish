import React, { useState, useEffect, useMemo } from 'react';
import { Project, ISBNState, ChannelRule, SpineNodeId, PublishingSpineState, SpineNodeStatus, CoverAssetType, SupportedLanguage, CoverAsset } from '../types';
import { SPINE_NODES_CONFIG, INITIAL_SPINE_NODES } from '../constants';
import ExportConfig from './ExportConfig';
import ISBNAssistanceModal from './ISBNAssistanceModal';

enum PubStep { 
  SPINE_OVERVIEW, 
  TEMPLATE_GALLERY, 
  CONFIG, 
  DISTRIBUTION_GALLERY, 
  TRADITIONAL_SUBMISSION_PREP,
  FINALIZATION, 
  DELIVERY_SEQUENCE, 
  SUCCESS 
}

interface ProfessionalPublicationCenterProps {
  project: Project | null;
  onClose: () => void;
  onUpdateProject?: (p: Project) => void;
  currentLanguage: SupportedLanguage;
  userCountryCode: string;
}

const CHANNEL_RULES: Record<string, ChannelRule> = {
  'Amazon KDP (Kindle)': { requiresISBN: false, allowsPlatformISBN: false },
  'Amazon KDP (Paperback)': { requiresISBN: true, allowsPlatformISBN: true },
  'Google Books': { requiresISBN: false, allowsPlatformISBN: false },
  'Draft2Digital': { requiresISBN: false, allowsPlatformISBN: false, exclusiveRisk: false },
  'IngramSpark': { requiresISBN: true, allowsPlatformISBN: false },
  'Apple Books': { requiresISBN: false, allowsPlatformISBN: false },
  'Medium': { requiresISBN: false, allowsPlatformISBN: false, isNonPublishing: true },
  'Substack': { requiresISBN: false, allowsPlatformISBN: false, isNonPublishing: true },
  'Traditional submission': { requiresISBN: false, allowsPlatformISBN: false, isNonPublishing: true },
  'Google Drive': { requiresISBN: false, allowsPlatformISBN: false, isNonPublishing: true },
  'Apple iCloud': { requiresISBN: false, allowsPlatformISBN: false, isNonPublishing: true },
  'Local Device': { requiresISBN: false, allowsPlatformISBN: false, isNonPublishing: true },
  'Direct Publishing': { requiresISBN: false, allowsPlatformISBN: false }
};

const ProfessionalPublicationCenter: React.FC<ProfessionalPublicationCenterProps> = ({ project, onClose, onUpdateProject, currentLanguage, userCountryCode }) => {
  const [step, setStep] = useState<PubStep>(PubStep.SPINE_OVERVIEW);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('t2');
  const [targetPlatform, setTargetPlatform] = useState('');
  const [deliveryPhase, setDeliveryPhase] = useState(0);
  const [isISBNAssistantOpen, setIsISBNAssistantOpen] = useState(false);

  const [config, setConfig] = useState({
    author: project?.publishingPayload?.author || 'Author Identity',
    isbn: project?.publishingPayload?.isbn13 || '',
    pubYear: '2026',
    languageCode: project?.publishingPayload?.languageCode || 'zh-TW',
    selectedFont: (project?.settings?.typography as 'serif' | 'sans') || 'serif',
    exportRange: 'all' as 'all' | 'custom',
    isPageNumbering: true,
    isHeadersFooters: false,
    shortDescription: project?.publishingPayload?.shortDescription || '',
    longDescription: project?.publishingPayload?.longDescription || ''
  });

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

  const handleUpdateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    if (key === 'isbn') {
      if (onUpdateProject && project) {
        const isNowValid = isValidISBN13(value);
        const currentSpine = project.publishingSpine || { currentNode: SpineNodeId.WRITING, nodes: INITIAL_SPINE_NODES() };
        
        const updatedSpine: PublishingSpineState = {
          ...currentSpine,
          nodes: {
            ...currentSpine.nodes,
            [SpineNodeId.ISBN_ASSIGNED]: {
              id: SpineNodeId.ISBN_ASSIGNED,
              isCompleted: isNowValid,
              isPendingReview: false,
              timestamp: isNowValid ? Date.now() : currentSpine.nodes[SpineNodeId.ISBN_ASSIGNED]?.timestamp
            }
          }
        };

        onUpdateProject({
          ...project,
          publishingPayload: {
            ...(project.publishingPayload || {} as any),
            isbn13: value.replace(/[- ]/g, ""), 
          },
          publishingSpine: updatedSpine
        });
      }
    }
  };

  const channelRule = useMemo(() => CHANNEL_RULES[targetPlatform] || { requiresISBN: false, allowsPlatformISBN: false }, [targetPlatform]);
  
  const isbnState = useMemo(() => {
    if (!channelRule.requiresISBN) return ISBNState.NOT_REQUIRED;
    return isValidISBN13(config.isbn) ? ISBNState.PROVIDED : ISBNState.REQUIRED_UNSET;
  }, [channelRule, config.isbn]);

  const handleInitiateDelivery = () => {
    if (channelRule.requiresISBN && isbnState === ISBNState.REQUIRED_UNSET) {
      setIsISBNAssistantOpen(true);
      return;
    }
    setStep(PubStep.DELIVERY_SEQUENCE);
  };

  const deliverySteps = [
    { title: '內容標準化與 AST 解析', en: 'CONTENT NORMALIZATION & AST PARSING', icon: 'fa-microchip' },
    { title: '選取最佳封面資產', en: 'SELECTING OPTIMAL COVER ASSET', icon: 'fa-image' },
    { title: '生成 DOCX 編輯母檔', en: 'GENERATING EDITORIAL DOCX ARTIFACT', icon: 'fa-file-lines' },
    { title: '封裝 PDF 印刷級手稿', en: 'PACKAGING HIGH-FIDELITY PDF', icon: 'fa-file-pdf' },
    { title: '構建 EPUB 3 出版規格電子書', en: 'BUILDING EPUB 3 STANDARDS E-BOOK', icon: 'fa-book' },
    { title: '加密傳輸至出版商通道', en: 'ENCRYPTED DELIVERY TO PLATFORM API', icon: 'fa-paper-plane' }
  ];

  useEffect(() => {
    if (step === PubStep.DELIVERY_SEQUENCE) {
      const interval = setInterval(() => {
        setDeliveryPhase(prev => {
          if (prev < deliverySteps.length - 1) return prev + 1;
          clearInterval(interval);
          setTimeout(() => setStep(PubStep.SUCCESS), 1500);
          return prev;
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (step === PubStep.SPINE_OVERVIEW) {
    const nodes = project?.publishingSpine?.nodes || {};
    return (
      <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in fade-in duration-500 overflow-hidden text-white font-sans">
        <header className="h-24 px-8 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shrink-0 border-b border-white/5 bg-black/80 backdrop-blur-3xl">
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 active:scale-90 transition-all">
             <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          <div className="text-center">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">PUBLISHING SPINE</h2>
            <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1">STATUS: {project?.name}</p>
          </div>
          <div className="w-12" />
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar space-y-12 pb-64">
          <div className="text-center space-y-4 max-w-lg mx-auto">
             <h3 className="text-3xl font-black tracking-tighter">出版成熟度檢查</h3>
             <p className="text-sm text-gray-500 leading-relaxed font-medium">InsPublish 協助您追蹤從草稿到全球發行的每一個關鍵節點。</p>
          </div>
          <div className="space-y-4 max-w-2xl mx-auto">
             {Object.keys(SPINE_NODES_CONFIG).map((nodeId) => {
                const configNode = SPINE_NODES_CONFIG[nodeId as SpineNodeId];
                const nodeStatus = nodes[nodeId as SpineNodeId];
                const isCompleted = nodeStatus?.isCompleted;
                const isPendingReview = nodeStatus?.isPendingReview;
                const isCurrent = nodeId === (project?.publishingSpine?.currentNode || SpineNodeId.WRITING);
                return (
                  <div key={nodeId} className={`p-6 rounded-[32px] border transition-all flex items-center justify-between ${isCompleted ? 'bg-blue-600/10 border-blue-500/30' : isPendingReview ? 'bg-amber-600/10 border-amber-500/30 shadow-lg' : isCurrent ? 'bg-[#1C1C1E] border-white/20 shadow-xl' : 'bg-[#121214] border-white/5 opacity-50'}`}>
                     <div className="flex items-center space-x-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isCompleted ? 'bg-blue-600 text-white' : isPendingReview ? 'bg-amber-600 text-white animate-pulse' : isCurrent ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-gray-700'}`}>
                           <i className={`fa-solid ${isPendingReview ? 'fa-hourglass-half' : configNode.icon}`}></i>
                        </div>
                        <div>
                           <h4 className="text-[15px] font-bold text-white tracking-tight">{configNode.label}</h4>
                           <p className="text-[10px] text-gray-500 font-medium mt-0.5">{isPendingReview ? '手動標記：外部審核中' : configNode.description}</p>
                        </div>
                     </div>
                     {isCompleted ? <i className="fa-solid fa-check text-blue-500"></i> : isPendingReview ? <i className="fa-solid fa-clock text-amber-500 animate-pulse"></i> : isCurrent ? <span className="text-[9px] font-black text-blue-500 animate-pulse">ING</span> : <i className="fa-solid fa-lock text-gray-800"></i>}
                  </div>
                );
             })}
          </div>
        </main>
        <footer className="absolute bottom-0 inset-x-0 p-8 pb-12 bg-gradient-to-t from-black via-black to-transparent shrink-0">
           <button onClick={() => setStep(PubStep.TEMPLATE_GALLERY)} className="w-full h-24 bg-white text-black rounded-[44px] text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all">進入出版配置程序</button>
        </footer>
      </div>
    );
  }

  if (step === PubStep.TEMPLATE_GALLERY) {
    const templates = [
      { id: 't1', name: 'Modern Novel', subtitle: 'Professional serif layout', type: 'FREE', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop' },
      { id: 't2', name: 'Academic Paper', subtitle: 'Standard APA format', type: 'PREMIUM', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop' },
      { id: 't3', name: 'Screenplay', subtitle: 'Industry standard layout', type: 'PREMIUM', image: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?q=80&w=400&auto=format&fit=crop' },
      { id: 't4', name: 'Technical Manual', subtitle: 'Structured technical guide', type: 'FREE', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=400&auto=format&fit=crop' }
    ];

    return (
      <div className="fixed inset-0 z-[2000] bg-[#121417] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-white font-sans">
        <header className="h-20 px-6 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shrink-0">
          <button onClick={() => setStep(PubStep.SPINE_OVERVIEW)} className="w-10 h-10 flex items-center justify-start text-white">
            <i className="fa-solid fa-chevron-left text-xl"></i>
          </button>
          <h2 className="text-[17px] font-black tracking-tight">Export Gallery</h2>
          <button className="w-10 h-10 flex items-center justify-end text-white">
            <i className="fa-solid fa-ellipsis text-xl"></i>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar space-y-6">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full h-[60px] bg-[#1C1C1E] rounded-2xl pl-14 pr-6 text-sm font-medium text-white outline-none placeholder-gray-500" 
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-2">
            {['All', 'PDF', 'DOCX', 'EPUB'].map((filter, idx) => (
              <button 
                key={filter} 
                className={`px-8 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-[#1C1C1E] text-gray-400'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 pb-32">
            {templates.map((t) => (
              <div key={t.id} className="flex flex-col space-y-4 cursor-pointer" onClick={() => { setSelectedTemplateId(t.id); setStep(PubStep.CONFIG); }}>
                <div className={`aspect-[3/4] rounded-[32px] relative overflow-hidden bg-gray-900 border-2 transition-all ${selectedTemplateId === t.id ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  
                  <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.type === 'FREE' ? 'bg-[#3A3A3C] text-white' : 'bg-blue-600 text-white shadow-xl'}`}>
                    {t.type}
                  </div>

                  {selectedTemplateId === t.id && (
                    <div className="absolute bottom-4 right-4 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-check text-white text-[10px]"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-[17px] font-black tracking-tight">{t.name}</h4>
                  <p className="text-[12px] text-gray-500 font-medium mt-1">{t.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (step === PubStep.CONFIG) {
    return (
      <ExportConfig 
        project={project}
        onBack={() => setStep(PubStep.TEMPLATE_GALLERY)}
        onNext={() => setStep(PubStep.DISTRIBUTION_GALLERY)}
        config={{...config, language: config.languageCode}}
        onUpdate={(key, val) => handleUpdateConfig(key === 'language' ? 'languageCode' : key, val)}
      />
    );
  }

  if (step === PubStep.DISTRIBUTION_GALLERY) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar text-white font-sans">
        <header className="h-[86px] px-8 pt-[env(safe-area-inset-top,0px)] flex items-center justify-center shrink-0 border-b border-white/5 bg-black sticky top-0 z-[100]">
          <button onClick={() => setStep(PubStep.CONFIG)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full absolute left-8 active:scale-90 transition-all">
            <i className="fa-solid fa-chevron-left text-lg"></i>
          </button>
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">DELIVERY & SUBMISSION</h2>
        </header>

        <main className="flex-1 px-6 sm:px-12 py-10 space-y-12 max-w-4xl mx-auto w-full pb-48">
          {/* Hero Hero Section */}
          <div className="bg-[#121214] p-12 sm:p-20 rounded-[56px] border border-white/5 text-center relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.04] to-transparent" />
             <h3 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 text-white relative z-10 leading-none">From Draft to the World</h3>
             <p className="text-[18px] text-gray-500 leading-relaxed font-medium max-w-xl mx-auto relative z-10">Deliver your work through official global publishing channels. This is where your journey from manuscript to published work completes.</p>
          </div>

          {/* One-Click Direct Publishing Section */}
          <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
              <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 rounded-[28px] bg-blue-600 flex items-center justify-center text-white text-4xl shadow-[0_15px_30px_rgba(37,99,235,0.3)]">
                    <i className="fa-solid fa-paper-plane"></i>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black tracking-tight text-white">一鍵自動投遞</h4>
                    <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1.5">DIRECT PUBLISHING</p>
                  </div>
              </div>
              <div className="relative">
                  <select className="w-full h-24 bg-black/40 border border-white/5 rounded-3xl px-10 text-[18px] font-bold text-gray-500 appearance-none outline-none focus:border-blue-600 transition-all">
                      <option>選擇目標出版社...</option>
                      <option>Amazon KDP</option>
                      <option>IngramSpark</option>
                      <option>Apple Books</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-10 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"></i>
              </div>
              <button onClick={() => { setTargetPlatform('Direct Publishing'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-white text-black rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">啟 動 全 球 投 遞 程 序</button>
          </div>

          {/* Publisher Connect Section */}
          <div className="space-y-10 pt-10">
              <div className="flex flex-col space-y-2 px-2">
                 <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">一鍵自動投遞 DIRECT PUBLISHING</h5>
                 <p className="text-[15px] font-black text-[#D4FF5F]">直接對接全球主流發行商</p>
              </div>
              <div className="grid grid-cols-1 gap-10">
                  {/* Amazon Kindle */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-[#FADE4B] text-4xl shadow-inner"><i className="fa-brands fa-amazon"></i></div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Amazon KDP (Kindle)</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">E-BOOK DISTRIBUTION</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-[#2563EB] text-white text-[13px] font-black rounded-full uppercase tracking-widest shadow-lg">電子書</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Amazon KDP (Kindle)'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-white text-black rounded-full text-[16px] font-black uppercase tracking-[0.4em] shadow-xl active:scale-[0.98] transition-all">投 遞 至 K I N D L E</button>
                  </div>

                  {/* Amazon Paperback */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-[#FADE4B] text-4xl shadow-inner"><i className="fa-solid fa-book-bookmark"></i></div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Amazon KDP (Paperback)</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">PRINT ON DEMAND</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-[#FADE4B] text-black text-[13px] font-black rounded-full uppercase tracking-widest shadow-lg">實體出版</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Amazon KDP (Paperback)'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-[#FADE4B] text-black rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">投 遞 至 A M A Z O N 實 體 版</button>
                  </div>

                  {/* IngramSpark */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center p-2 border border-white/10 overflow-hidden shadow-xl">
                              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <circle cx="100" cy="100" r="90" fill="none" stroke="#54A0C0" stroke-width="8"/>
                                <text x="100" y="112" font-family="system-ui, sans-serif" font-weight="500" font-size="30" text-anchor="middle">
                                  <tspan fill="#54A0C0">Ingram</tspan><tspan fill="#FFB800" font-weight="700">Spark</tspan>
                                </text>
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">IngramSpark</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">GLOBAL RETAIL NETWORK</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-[#FF6B2C] text-white text-[13px] font-black rounded-full uppercase tracking-widest shadow-lg">ISBN 必備</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('IngramSpark'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-blue-600 text-white rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">投 遞 至 I N G R A M S P A R K</button>
                  </div>

                  {/* Apple Books */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-white text-4xl"><i className="fa-brands fa-apple"></i></div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Apple Books</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">APPLE PUBLISHING</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-white/10 text-white text-[13px] font-black rounded-full uppercase tracking-widest border border-white/10">數位出版版</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Apple Books'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-white text-black rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">發 佈 至 A P P L E B O O K S</button>
                  </div>

                  {/* Medium */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-white text-4xl"><i className="fa-brands fa-medium"></i></div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Medium 專欄</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">DIGITAL STORYTELLING</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-white/10 text-white text-[13px] font-black rounded-full uppercase tracking-widest border border-white/10">專欄分發</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Medium'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-white text-black rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">發 佈 至 M E D I U M</button>
                  </div>

                  {/* Substack */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-[#FF6B2C] border border-white/5 flex items-center justify-center p-5 shadow-xl">
                               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                 <path d="M22.5 4H1.5V6.75H22.5V4Z" fill="white"/>
                                 <path d="M22.5 9.5H1.5V12.25H22.5V9.5Z" fill="white"/>
                                 <path d="M1.5 15V21L12 15.75L22.5 21V15H1.5Z" fill="white"/>
                               </svg>
                            </div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Substack</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase mt-1.5">建立您的訂閱電子報與寫作社群。</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-white/10 text-white text-[13px] font-black rounded-full uppercase tracking-widest border border-white/10">專欄分發</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Substack'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-[#FF6B2C] text-white rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">發 佈 至 S U B S T A C K</button>
                  </div>

                  {/* Draft2Digital */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-10 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-[#1A1A3A] border border-white/5 flex items-center justify-center p-3 shadow-xl">
                               <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                 <text x="5" y="62" font-family="Arial Black, sans-serif" font-weight="900" font-size="32" fill="white">D</text>
                                 <path d="M40 45 C 40 30, 70 30, 70 45 C 70 60, 35 80, 35 80 L 85 80" fill="none" stroke="#FF4500" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                                 <path d="M85 80 L 75 70 M 85 80 L 75 90" fill="none" stroke="#FF4500" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                                 <text x="75" y="62" font-family="Arial Black, sans-serif" font-weight="900" font-size="32" fill="white">D</text>
                               </svg>
                            </div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Draft2Digital</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">MULTI-PLATFORM AGGREGATOR</p>
                            </div>
                         </div>
                         <div className="px-8 py-3.5 bg-white/10 text-white text-[13px] font-black rounded-full uppercase tracking-widest border border-white/10">數位出版版</div>
                      </div>
                      <p className="text-[15px] text-gray-500 leading-relaxed font-medium pl-2">Global distribution to Apple, Kobo, and libraries</p>
                      <button onClick={() => { setTargetPlatform('Draft2Digital'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-[#00D094] text-black rounded-full text-[16px] font-black uppercase tracking-[0.6em] shadow-xl active:scale-[0.98] transition-all">發 佈 至 D R A F T 2 D I G I T A L</button>
                  </div>

                  {/* Traditional Submission */}
                  <div 
                    onClick={() => { setTargetPlatform('Traditional submission'); setStep(PubStep.TRADITIONAL_SUBMISSION_PREP); }}
                    className="bg-[#121214] rounded-[56px] p-14 border-2 border-dashed border-white/10 text-left space-y-10 group cursor-pointer hover:border-white/20 transition-all relative"
                  >
                      <div className="flex items-center space-x-8">
                        <div className="w-20 h-24 rounded-[32px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-4xl shadow-inner">
                          <i className="fa-solid fa-file-lines"></i>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-4xl font-black tracking-tight text-white leading-tight">Traditional<br/>Submission<br/>Package</h4>
                          <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2">FOR AGENT & PUBLISHER REVIEW</p>
                        </div>
                      </div>
                      
                      <p className="text-[18px] text-gray-500 leading-relaxed font-medium max-w-md pl-2">No direct submission required. We prepare industry-standard submission materials including synopsis, bio, and sample chapters.</p>
                      
                      <div className="absolute bottom-14 right-14">
                        <i className="fa-solid fa-arrow-right text-gray-800 text-2xl group-hover:text-blue-500 transition-colors"></i>
                      </div>
                  </div>
              </div>
          </div>

          {/* Persistence Sections */}
          <div className="space-y-10 pt-20">
              <div className="flex flex-col space-y-2 px-2">
                 <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">雲端儲存與持久化 CLOUD & PERSISTENCE</h5>
                 <p className="text-[15px] font-black text-blue-500">作品安全備份與官方雲端同步</p>
              </div>
              <div className="grid grid-cols-1 gap-10">
                  {/* Google Drive */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-4xl shadow-inner p-4">
                              <svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            </div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Google Drive</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase mt-1.5">DRIVE.GOOGLE.COM</p>
                            </div>
                         </div>
                         <div className="px-6 py-3 bg-white/5 text-gray-500 text-[11px] font-black rounded-full border border-white/5 uppercase tracking-widest">官方認證</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Google Drive'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-blue-600 text-white rounded-full text-[14px] font-black uppercase tracking-[0.4em] shadow-xl active:scale-[0.98] transition-all">傳 送 至 G O O G L E D R I V E</button>
                  </div>
                  {/* Apple iCloud */}
                  <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-white text-4xl shadow-inner"><i className="fa-brands fa-apple"></i></div>
                            <div>
                              <h4 className="text-3xl font-black tracking-tight text-white">Apple iCloud</h4>
                              <p className="text-[11px] text-gray-500 font-black uppercase mt-1.5">ICLOUD.COM</p>
                            </div>
                         </div>
                         <div className="px-6 py-3 bg-white/5 text-gray-500 text-[11px] font-black rounded-full border border-white/5 uppercase tracking-widest">官方認證</div>
                      </div>
                      <button onClick={() => { setTargetPlatform('Apple iCloud'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-white/5 text-white rounded-full text-[14px] font-black uppercase tracking-[0.4em] border border-white/10 active:scale-[0.98] transition-all">傳 送 至 A P P L E I C L O U D</button>
                  </div>
              </div>
          </div>

          {/* Local Storage Section */}
          <div className="space-y-10 pt-20">
              <div className="flex flex-col space-y-2 px-2">
                 <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">儲存至本地端 LOCAL STORAGE</h5>
                 <p className="text-[15px] font-black text-gray-500">直接儲存至您的手機或電腦硬碟中</p>
              </div>
              <div className="bg-[#121214] rounded-[56px] p-10 sm:p-14 space-y-12 border border-white/5 shadow-2xl transition-all">
                  <div className="flex items-center space-x-8">
                      <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 flex items-center justify-center text-[#D4FF5F] text-4xl"><i className="fa-solid fa-download"></i></div>
                      <div>
                        <h4 className="text-3xl font-black tracking-tight text-white">下載至本地</h4>
                        <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">OFFLINE PERSISTENCE</p>
                      </div>
                  </div>
                  <button onClick={() => { setTargetPlatform('Local Device'); setStep(PubStep.FINALIZATION); }} className="w-full h-24 bg-[#D4FF5F] text-black rounded-full text-[16px] font-black uppercase tracking-[0.4em] shadow-xl active:scale-[0.98] transition-all">儲 存 檔 案 至 此 裝 置</button>
              </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === PubStep.TRADITIONAL_SUBMISSION_PREP) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-white font-sans">
        <header className="h-[96px] px-8 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shrink-0 border-b border-white/5 bg-black/80">
          <button onClick={() => setStep(PubStep.DISTRIBUTION_GALLERY)} className="w-12 h-12 flex items-center justify-start text-white opacity-60 active:scale-90 transition-all">
            <i className="fa-solid fa-chevron-left text-lg"></i>
          </button>
          <div className="text-center">
            <h2 className="text-[13px] font-black uppercase tracking-[0.4em]">PREPARATION</h2>
            <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.1em] mt-1.5">TARGET: TRADITIONAL SUBMISSION</p>
          </div>
          <div className="w-12" />
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar space-y-12 pb-48">
           {/* Blue Path Card */}
           <section className="bg-blue-600/10 border border-blue-500/20 rounded-[44px] p-10 space-y-8">
              <h3 className="text-[28px] font-black text-white tracking-tight">投稿審閱路徑</h3>
              <p className="text-[16px] text-gray-400 leading-relaxed font-medium">
                此路徑為投稿審閱用途。系統將根據您目前的文稿內容，自動準備符合業界標準的投稿資料包（Submission Package），包含大綱、作者簡介與樣章。
              </p>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
                 <i className="fa-solid fa-circle-info text-blue-500 text-sm"></i>
                 <p className="text-[13px] font-bold text-blue-500/80 tracking-tight">系統將不會進行任何形式的直接出版</p>
              </div>
           </section>

           <section className="space-y-6">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-[0.25em] px-2">DESCRIPTION / BLURB</label>
              <div className="bg-[#121214] rounded-[44px] p-10 shadow-inner h-[280px] border border-white/5">
                 <textarea 
                   placeholder="What is your work about?" 
                   value={config.longDescription} 
                   onChange={(e) => handleUpdateConfig('longDescription', e.target.value)} 
                   className="w-full h-full bg-transparent border-none outline-none focus:ring-0 text-[18px] font-bold text-gray-300 placeholder-gray-800 resize-none leading-relaxed" 
                 />
              </div>
           </section>

           <section className="bg-blue-900/10 border border-blue-500/10 rounded-[44px] p-10 flex items-start space-x-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <i className="fa-solid fa-info text-[12px] text-white"></i>
              </div>
              <p className="text-[14px] text-gray-500 font-bold leading-relaxed opacity-80">
                Your work will be delivered as a professional publication package. All content remains under your full ownership through the responsibility transfer protocol.
              </p>
           </section>
        </main>
        
        <footer className="fixed bottom-0 inset-x-0 p-8 pb-10 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
           <button 
             onClick={() => setStep(PubStep.DELIVERY_SEQUENCE)} 
             className="w-full h-[92px] rounded-full flex items-center justify-center space-x-6 shadow-[0_25px_60px_rgba(37,99,235,0.4)] bg-[#2563EB] text-white active:scale-[0.98] transition-all"
           >
                <i className="fa-solid fa-file-invoice text-xs"></i>
                <span className="text-[15px] font-black uppercase tracking-[0.35em]">PREPARE SUBMISSION PACKAGE</span>
           </button>
        </footer>
      </div>
    );
  }

  if (step === PubStep.FINALIZATION) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-white font-sans">
        <header className="h-[96px] px-8 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shrink-0 border-b border-white/5 bg-black/80">
          <button onClick={() => setStep(PubStep.DISTRIBUTION_GALLERY)} className="w-12 h-12 flex items-center justify-start text-white opacity-60 active:scale-90 transition-all"><i className="fa-solid fa-chevron-left text-lg"></i></button>
          <div className="text-center">
            <h2 className="text-[13px] font-black uppercase tracking-[0.4em]">MANUSCRIPT FINALIZATION</h2>
            <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.1em] mt-1.5">TARGET: {targetPlatform.toUpperCase()}</p>
          </div>
          <div className="w-12" />
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar space-y-12 pb-48">
           <section className="space-y-6">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-[0.25em] px-2">MANUSCRIPT DETAILS</label>
              <div className="space-y-4">
                 <div className="bg-[#121214] rounded-[32px] p-10 shadow-inner border border-white/5">
                    <h3 className="text-[28px] font-black text-white tracking-tight leading-tight">{project?.name}</h3>
                 </div>
                 <div className="bg-[#121214] rounded-[32px] p-10 shadow-inner border border-white/5">
                    <p className="text-[17px] font-bold text-white opacity-90">{config.author}</p>
                 </div>
                 {channelRule.requiresISBN && (
                   <div className="space-y-4">
                     <button onClick={() => setIsISBNAssistantOpen(true)} className={`w-full text-left bg-[#121214] rounded-[32px] p-10 shadow-inner border-2 transition-all ${!isValidISBN13(config.isbn) ? 'border-amber-500/60' : 'border-white/5'}`}>
                         <p className={`text-[17px] font-bold ${isValidISBN13(config.isbn) ? 'text-white opacity-90' : 'text-gray-500'}`}>{isValidISBN13(config.isbn) ? config.isbn : "ISBN-13 (Required for this channel)"}</p>
                     </button>
                     {!isValidISBN13(config.isbn) && (
                       <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest px-4">系統判斷：此通路要求提供有效 ISBN 識別碼</p>
                     )}
                   </div>
                 )}
              </div>
           </section>

           <section className="space-y-6">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-[0.25em] px-2">DESCRIPTION / BLURB</label>
              <div className="bg-[#121214] rounded-[44px] p-10 shadow-inner h-[280px] border border-white/5">
                 <textarea placeholder="What is your work about?" value={config.longDescription} onChange={(e) => handleUpdateConfig('longDescription', e.target.value)} className="w-full h-full bg-transparent border-none outline-none focus:ring-0 text-[18px] font-bold text-gray-300 placeholder-gray-800 resize-none leading-relaxed" />
              </div>
           </section>

           <section className="bg-blue-900/10 border border-blue-500/10 rounded-[44px] p-10 flex items-start space-x-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5"><i className="fa-solid fa-info text-[12px] text-white"></i></div>
              <p className="text-[14px] text-gray-500 font-bold leading-relaxed opacity-80">Your work will be delivered as a professional publication package. All content remains under your full ownership through the responsibility transfer protocol.</p>
           </section>
        </main>
        
        <footer className="fixed bottom-0 inset-x-0 p-8 pb-10 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
           <button onClick={handleInitiateDelivery} className="w-full h-[92px] rounded-full flex items-center justify-center space-x-6 shadow-[0_25px_60px_rgba(37,99,235,0.4)] bg-[#2563EB] text-white active:scale-[0.98] transition-all">
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span className="text-[15px] font-black uppercase tracking-[0.35em]">DELIVER TO {targetPlatform.toUpperCase()}</span>
           </button>
        </footer>

        {isISBNAssistantOpen && (
          <ISBNAssistanceModal 
            currentLanguage={currentLanguage} 
            userCountryCode={userCountryCode} 
            onClose={() => setIsISBNAssistantOpen(false)} 
            project={project} 
            onUpdateProject={onUpdateProject}
            onISBNValidated={(isbn) => { handleUpdateConfig('isbn', isbn); setIsISBNAssistantOpen(false); }} 
          />
        )}
      </div>
    );
  }

  if (step === PubStep.DELIVERY_SEQUENCE) {
    const currentStep = deliverySteps[deliveryPhase];
    const progressPercent = ((deliveryPhase + 1) / deliverySteps.length) * 100;
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center animate-in fade-in duration-700 text-center px-8 font-sans">
        <div className="relative w-80 h-80 flex items-center justify-center mb-20">
           <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="120" className="stroke-white/5 fill-none" strokeWidth="6" />
              <circle cx="150" cy="150" r="120" className="stroke-blue-600 fill-none transition-all duration-[2000ms] ease-in-out" strokeWidth="8" strokeDasharray={753.98} strokeDashoffset={753.98 * (1 - progressPercent / 100)} strokeLinecap="round" />
           </svg>
           <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center text-blue-500 text-5xl animate-pulse border border-blue-600/20 shadow-[0_0_50px_rgba(37,99,235,0.2)]"><i className={`fa-solid ${currentStep.icon}`}></i></div>
        </div>
        <div className="space-y-6 max-w-xl mb-24">
           <h2 className="text-4xl font-black tracking-tighter text-white">{currentStep.title}</h2>
           <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.5em] opacity-80">{currentStep.en}</p>
        </div>
      </div>
    );
  }

  if (step === PubStep.SUCCESS) {
    return (
      <div className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-700 text-center font-sans overflow-hidden">
         <div className="relative w-52 h-52 flex items-center justify-center mb-20 animate-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-[80px]" />
            <div className="w-44 h-44 rounded-full border-2 border-blue-600/20 bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-[0_0_60px_rgba(37,99,235,0.2)]"><i className="fa-solid fa-check text-7xl"></i></div>
         </div>
         <h1 className="text-5xl font-black tracking-tighter leading-tight text-white mb-6">Published successfully.</h1>
         <button onClick={onClose} className="mt-12 w-full max-w-md h-24 bg-white text-black rounded-[44px] text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-[0.95] transition-all">VIEW PUBLISHING STATUS</button>
      </div>
    );
  }
  return null;
};

export default ProfessionalPublicationCenter;
