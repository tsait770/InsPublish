
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface PrivacyModalProps {
  onClose: () => void;
}

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ id, title, icon, isOpen, onToggle, children }) => {
  return (
    <div className={`border-b border-white/5 transition-all duration-300 ${isOpen ? 'bg-white/[0.02]' : ''}`}>
      <button 
        onClick={() => onToggle(id)}
        className="w-full py-6 px-6 flex items-center justify-between group"
      >
        <div className="flex items-center space-x-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-blue-600/10 text-blue-500'}`}>
            <i className={`fa-solid ${icon} text-lg`}></i>
          </div>
          <span className={`text-[15px] font-black tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
            {title}
          </span>
        </div>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-700'}`}></i>
      </button>
      
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-24 pb-10 text-[14px] text-slate-400 leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  );
};

const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'PRIVACY' | 'TERMS'>('PRIVACY');
  const [openSection, setOpenSection] = useState<string | null>('data');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return createPortal(
    <div className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center animate-in fade-in duration-500 font-sans">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative w-full max-w-[720px] bg-[#0A0A0B] border-t sm:border border-white/10 rounded-t-[3.5rem] sm:rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] animate-in slide-in-from-bottom duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
        
        <header className="px-8 sm:px-12 pt-12 pb-8 shrink-0 z-20 bg-[#0A0A0B]">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black text-white tracking-tighter">隱私與法律中心</h2>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em]">PRIVACY & LEGAL PROTOCOL V1.1</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5 relative">
            <button 
              onClick={() => setActiveTab('PRIVACY')} 
              className={`flex-1 py-4 rounded-[1.6rem] text-[12px] font-black uppercase tracking-[0.15em] transition-all z-10 ${activeTab === 'PRIVACY' ? 'text-white' : 'text-slate-500'}`}
            >
              隱私權管理
            </button>
            <button 
              onClick={() => setActiveTab('TERMS')} 
              className={`flex-1 py-4 rounded-[1.6rem] text-[12px] font-black uppercase tracking-[0.15em] transition-all z-10 ${activeTab === 'TERMS' ? 'text-white' : 'text-slate-500'}`}
            >
              服務條款
            </button>
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] bg-blue-600 rounded-[1.6rem] transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) ${activeTab === 'TERMS' ? 'translate-x-full' : 'translate-x-0'}`} 
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-0 py-2 bg-[#0A0A0B] pb-40">
          
          {activeTab === 'PRIVACY' ? (
            <div className="space-y-4 px-6 sm:px-12 animate-in fade-in duration-500">
              
              <section className="bg-gradient-to-br from-[#12121A] to-[#0A0A0C] border border-blue-500/10 rounded-[44px] p-10 mb-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                 
                 <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center">
                    <span className="opacity-40 mr-3">承諾</span>
                    TRUST MANIFESTO
                 </h3>
                 
                 <div className="space-y-8">
                    {[
                      { icon: 'fa-user-shield', title: '創作主權歸屬', desc: '我們始終尊重您的創作主權，InsPublish 不會對您的任何內容主張所有權，您的文字完全屬於您。' },
                      { icon: 'fa-database', title: '本地保護優先', desc: '稿件預設儲存於您的設備本地。除非經您授權，否則我們不會主動將資料上傳至雲端。' },
                      { icon: 'fa-robot', title: 'AI 協作隱私', desc: '您的內容僅在您主動請求 AI 協助時傳送，且絕不會被用於公開模型的訓練過程。' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-6 group/item">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 shrink-0 border border-white/5 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-500">
                          <i className={`fa-solid ${item.icon} text-lg`}></i>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[15px] font-black text-white">{item.title}</h4>
                          <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </section>

              <div className="rounded-[44px] border border-white/5 overflow-hidden bg-white/[0.01]">
                <AccordionSection 
                  id="data" 
                  title="資料處理與透明化說明" 
                  icon="fa-database" 
                  isOpen={openSection === 'data'} 
                  onToggle={toggleSection}
                >
                  <p className="mb-6">為了提供穩定且流暢的寫作體驗，我們致力於僅收集維繫服務運作所需的極小化資訊：</p>
                  <ul className="space-y-5 list-disc pl-2 text-slate-400">
                    <li><strong className="text-white">帳戶資訊：</strong>您的電子郵件與會員等級，旨在確保跨裝置同步的正確性與訂閱權益。</li>
                    <li><strong className="text-white">創作內容：</strong>包含草稿與章節。若您啟用雲端備份，所有資料將透過 <span className="text-blue-400 font-black">AES-256</span> 軍事級加密技術進行保護。</li>
                    <li><strong className="text-white">使用體驗紀錄：</strong>包含功能的操作頻率，這能幫助我們理解並持續優化 <span className="text-white font-black">UI/UX</span> 流程。</li>
                  </ul>
                </AccordionSection>

                <AccordionSection 
                  id="ai" 
                  title="AI 協作安全與防護" 
                  icon="fa-bolt-lightning" 
                  isOpen={openSection === 'ai'} 
                  onToggle={toggleSection}
                >
                  <p className="mb-6">當您邀請 <span className="text-white font-black">Gemini AI</span> 擔任您的創作助手時：</p>
                  <ul className="space-y-5 list-disc pl-2">
                    <li>系統僅會傳送您<strong className="text-white">當前選取或正在編輯</strong>的片段進行分析。</li>
                    <li>我們採行 <span className="text-blue-400 font-black">Google Enterprise</span> 級別的安全協定，確保您的原創內容<strong className="text-white">不會</strong>成為公開模型訓練的素材。</li>
                    <li>InsPublish 秉持即時處理原則，伺服器不會永久留存您的 AI 互動紀錄，保護創作思緒不外洩。</li>
                  </ul>
                </AccordionSection>

                <AccordionSection 
                  id="rights" 
                  title="出版權益與版權承諾" 
                  icon="fa-book-open" 
                  isOpen={openSection === 'rights'} 
                  onToggle={toggleSection}
                >
                  <p className="mb-6">InsPublish 旨在成為您通往專業出版之路的忠實夥伴：</p>
                  <ul className="space-y-5 list-disc pl-2">
                    <li><strong className="text-white">產權歸屬：</strong>您在 InsPublish 產出的所有文字內容，其知識產權 <span className="text-white font-black">100%</span> 歸屬於您。</li>
                    <li><strong className="text-white">格式合規：</strong>我們產出的 <span className="text-white">PDF/EPUB</span> 格式嚴格遵循 <span className="text-white font-black">Amazon KDP</span> 標準，助您無縫接軌國際市場。</li>
                    <li><strong className="text-white">分發中立：</strong>在使用投遞功能時，我們僅扮演安全傳輸的角色，不干涉內容創作，亦不抽取額外佣金。</li>
                  </ul>
                </AccordionSection>

                <AccordionSection 
                  id="disclosure" 
                  title="技術合作夥伴與服務說明" 
                  icon="fa-link" 
                  isOpen={openSection === 'disclosure'} 
                  onToggle={toggleSection}
                >
                  <p className="mb-6">為了實現強大的雲端同步與協作，我們與以下受信任的技術供應商深度合作：</p>
                  <div className="space-y-4">
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                      <h5 className="text-[13px] font-black text-white mb-2">Google Drive 雲端連結</h5>
                      <p className="text-[12px] text-slate-500">僅在您主動開啟備份時，請求特定資料夾的寫入權限，確保資料的可溯源性。</p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                      <h5 className="text-[13px] font-black text-white mb-2">Firebase / Supabase 資料架構</h5>
                      <p className="text-[12px] text-slate-500">協助處理即時協作的數據封裝，數據全程採用 SSL 傳輸加密，守護您的通訊安全。</p>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection 
                  id="licenses" 
                  title="開源貢獻與 UI 授權致謝" 
                  icon="fa-sun" 
                  isOpen={openSection === 'licenses'} 
                  onToggle={toggleSection}
                >
                  <p className="mb-6">我們衷心感謝開源社群對 InsPublish 視覺美學的貢獻，並根據 <span className="text-white font-black">MIT</span> 條款羅列以下資訊：</p>
                  <div className="space-y-4">
                    {[
                      { id: 'A', name: 'Angry Shrimp 34 (專案管理/表單)', author: 'zanina-yassine (Yassine Zanina)' },
                      { id: 'B', name: 'Black Lizard 62 (支付介面元件)', author: 'Praashoo7 (Prashant)' },
                      { id: 'C', name: 'Neat Starfish 50 (天氣與動態卡片)', author: 'zanina-yassine (Yassine Zanina)' }
                    ].map((item) => (
                      <div key={item.id} className="p-6 bg-black/40 rounded-3xl border border-white/5">
                        <h5 className="text-[13px] font-black text-white mb-2">{item.id}. {item.name}</h5>
                        <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                          作者：{item.author}<br/>
                          來源：Uiverse.io | 授權協定：MIT License<br/>
                          Copyright (c) 2026 {item.author}
                        </p>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-600 italic px-2 mt-4">
                      InsPublish 始終尊重原作者的勞動成果，上述聲明已完整包含於本軟體副本中。
                    </p>
                  </div>
                </AccordionSection>

                <AccordionSection 
                  id="control" 
                  title="自主權利與資料控制中心" 
                  icon="fa-user-gear" 
                  isOpen={openSection === 'control'} 
                  onToggle={toggleSection}
                >
                  <p className="mb-8">每一位使用者都應擁有對自身資料的絕對主導權：</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="h-20 bg-white/5 border border-white/10 rounded-[28px] text-blue-500 font-black text-[13px] uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                      匯出全站 JSON 資料
                    </button>
                    <button className="h-20 bg-white/5 border border-white/10 rounded-[28px] text-red-500 font-black text-[13px] uppercase tracking-widest hover:bg-red-500/10 active:scale-95 transition-all">
                      申請永久刪除帳戶
                    </button>
                  </div>
                  <p className="mt-8 text-center text-[11px] text-slate-500 uppercase tracking-widest">
                    我們支持歐盟 <span className="text-white">GDPR</span> 與加州 <span className="text-white">CCPA</span> 所賦予您的「被遺忘權」。
                  </p>
                </AccordionSection>
              </div>

              <div className="py-12 border-t border-white/5 mt-8">
                <p className="text-[15px] text-slate-400 leading-[1.8] font-medium text-center italic px-4">
                  InsPublish 深知每一段文字背後的情感與心血。我們致力於以最審慎、透明且誠實的方式，守護您的個人資料與創作隱私。我們承諾將持續精進安全防護技術，竭盡所能為您的靈感提供一個寧靜、安全的避風港。
                </p>
              </div>
            </div>
          ) : (
            <div className="px-8 sm:px-12 py-6 space-y-14 animate-in fade-in duration-500">
               <div className="space-y-12">
                  <div className="space-y-5">
                     <h3 className="text-xl font-black text-white flex items-center">
                        <span className="text-blue-500 mr-4 font-mono">1.</span>
                        服務接受條款
                     </h3>
                     <div className="pl-9 space-y-5 text-[15px] text-slate-400 leading-relaxed font-medium">
                        <p>感謝您選擇 InsPublish 作為您的創作夥伴。當您存取或使用本服務時，即視為您已理解並同意遵守本服務條款。我們由衷希望 InsPublish 能成為您文字旅程中值得信賴的基石。</p>
                        <p>若您對於條款內容有任何疑慮，我們懇請您暫停使用服務，並與我們的客服團隊連蹟，我們將竭誠為您解答。</p>
                     </div>
                  </div>

                  <div className="space-y-5">
                     <h3 className="text-xl font-black text-white flex items-center">
                        <span className="text-blue-500 mr-4 font-mono">2.</span>
                        服務範疇與技術侷限
                     </h3>
                     <div className="pl-9 space-y-5 text-[15px] text-slate-400 leading-relaxed font-medium">
                        <p>InsPublish 致力於提供專業的寫作管理、AI 智能協作與出版排版工具。我們追求技術的卓越，並承諾為您提供穩定、流暢的操作環境。</p>
                        <p>然而，受限於目前的網路技術環境與軟硬體相容性，我們無法承諾服務在任何極端情況下皆能完全無誤或永不中斷。我們會定期公告服務調整，與您攜手邁向更完美的創作空間。</p>
                     </div>
                  </div>

                  <div className="space-y-5">
                     <h3 className="text-xl font-black text-white flex items-center">
                        <span className="text-blue-500 mr-4 font-mono">3.</span>
                        訂閱方案與誠信服務
                     </h3>
                     <div className="pl-9 space-y-5 text-[15px] text-slate-400 leading-relaxed font-medium">
                        <p>Pro 與 Premium 訂閱方案，提供更深度且持續穩定的寫作能量支援。您可依需求選擇按月或按年計費，並可隨時管理或取消續訂設定。</p>
                        <p>由於本服務屬於數位內容與即時啟用之線上服務，訂閱生效後恕不提供退款。若使用過程中發生影響服務正常運作之情況，我們將秉持誠信原則，審慎處理相關問題，並致力於維持服務品質與使用者信任。</p>
                     </div>
                  </div>

                  <div className="space-y-5">
                     <h3 className="text-xl font-black text-white flex items-center">
                        <span className="text-blue-500 mr-4 font-mono">4.</span>
                        共同維護良善規範
                     </h3>
                     <div className="pl-9 space-y-5 text-[15px] text-slate-400 leading-relaxed font-medium">
                        <p>為了維護一個純粹、具備建設性的寫作社群，我們懇請每一位使用者避免利用本服務產生或傳播違反法律、侵害他人權益或維背良善風俗的內容。</p>
                        <p>InsPublish 始終堅持內容中立，但對於任何危害平台秩序或違反法律的行為，我們保留視情況限制權限的權利，以保障廣大創作夥伴的純淨創作空間。</p>
                     </div>
                  </div>
               </div>

               <div className="pt-20 pb-12 border-t border-white/5">
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] text-center">
                     最後修訂日期：2026年1月20日
                  </p>
               </div>
            </div>
          )}
        </div>

        <footer className="absolute bottom-0 inset-x-0 p-8 sm:p-12 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0 z-30">
          <button 
            onClick={onClose} 
            className="w-full h-24 bg-white text-black font-black uppercase rounded-full tracking-[0.5em] shadow-[0_30px_80px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center text-[15px]"
          >
            我 已 閱 讀 並 理解以上承諾
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default PrivacyModal;
