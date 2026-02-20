
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { OutlineNode } from '../types';

interface AIPanelProps {
  content: string;
  isNight: boolean;
  onClose: () => void;
  onUpdateOutline: (nodes: OutlineNode[]) => void;
  onUpdateContent?: (content: string) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ content, isNight, onClose, onUpdateOutline, onUpdateContent }) => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const [activeTab, setActiveTab] = useState<'ASSISTANT' | 'AUDIT'>('ASSISTANT');
  const [currentReportType, setCurrentReportType] = useState<string | null>(null);

  const languages = [
    { label: 'English', value: 'English' },
    { label: '繁體中文', value: 'Traditional Chinese' },
    { label: '简体中文', value: 'Simplified Chinese' },
    { label: 'Español', value: 'Spanish' },
    { label: 'Português (Brasil)', value: 'Portuguese (Brazil)' },
    { label: 'Português', value: 'Portuguese' },
    { label: 'Deutsch', value: 'German' },
    { label: 'Français', value: 'French' },
    { label: 'Italiano', value: 'Italian' },
    { label: 'Nederlands', value: 'Dutch' },
    { label: 'Svenska', value: 'Swedish' },
    { label: 'Türkçe', value: 'Turkish' },
    { label: 'Русский', value: 'Russian' },
    { label: '日本語', value: 'Japanese' },
    { label: '한국어', value: 'Korean' },
    { label: 'ไทย', value: 'Thai' },
    { label: 'Tiếng Việt', value: 'Vietnamese' },
    { label: 'Bahasa Indonesia', value: 'Indonesian' },
    { label: 'Bahasa Melayu', value: 'Malay' },
    { label: 'हिन्दी', value: 'Hindi' },
    { label: 'العربية', value: 'Arabic' }
  ];

  const handleAIAction = async (action: any) => {
    if (!content.trim()) return;
    setIsLoading(true);
    setResponse('');
    
    // 設定當前報告類型名稱
    const reportNames: Record<string, string> = {
      tone: '語氣一致性報告',
      pacing: '敘事節奏分析',
      style: '書籍體例合規檢查'
    };
    setCurrentReportType(reportNames[action] || null);

    try {
      let result = '';
      if (action === 'analyze') result = await geminiService.analyzeManuscript(content);
      if (action === 'outline') {
        result = await geminiService.scanOutline(content);
        const mockNodes: OutlineNode[] = result.split('\n')
          .filter(l => l.trim() && !l.includes('---'))
          .slice(0, 8)
          .map((l, i) => ({
            id: `node-${Date.now()}-${i}`,
            label: l.replace(/^[\d\.\-\s\*]+/, '').trim(),
            level: l.startsWith(' ') || l.startsWith('-') || l.startsWith('*') ? 1 : 0
          }));
        onUpdateOutline(mockNodes);
      }
      if (action === 'translate') result = await geminiService.translateText(content, targetLang);
      if (['tone', 'pacing', 'style'].includes(action)) {
        result = await geminiService.auditManuscript(content, action as any);
      }
      setResponse(result || '處理完成。');
    } catch (e) {
      setResponse('AI 服務暫時不可用，請檢查網路連線或 API 配置。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyContent = () => {
    if (onUpdateContent && response) {
      onUpdateContent(response);
      setResponse('');
      onClose();
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(response);
    alert('審計報告已複製到剪貼簿');
  };

  return (
    <aside className={`fixed top-0 right-0 w-80 h-full z-[200] border-l flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl ${isNight ? 'bg-[#0F172A] border-white/5' : 'bg-white border-gray-100'}`}>
      <div className="p-6 border-b border-white/5 flex flex-col bg-[#0F0F10] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">AI 編輯中心</h2>
            <p className="text-[9px] text-[#8E8E93] font-black uppercase tracking-[0.2em] mt-1">PUBLISHING HUB ACTIVE</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('ASSISTANT')}
             className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'ASSISTANT' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
           >
              寫作助理
           </button>
           <button 
             onClick={() => setActiveTab('AUDIT')}
             className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'AUDIT' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500'}`}
           >
              出版審計
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {activeTab === 'ASSISTANT' ? (
          <div className="grid grid-cols-1 gap-3">
            <div className="p-5 rounded-2xl bg-purple-600/10 border border-purple-500/20 space-y-4">
              <div className="flex items-center space-x-3">
                  <i className="fa-solid fa-language text-purple-400 text-xl"></i>
                  <span className="text-sm font-bold text-white">智慧翻譯</span>
              </div>
              <div className="relative">
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-4 text-[11px] font-black text-white appearance-none outline-none focus:border-purple-500 transition-all"
                  >
                    {languages.map(l => <option key={l.value} value={l.value} className="bg-slate-900">{l.label}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none"></i>
              </div>
              <button onClick={() => handleAIAction('translate')} className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">執行翻譯</button>
            </div>

            <button onClick={() => handleAIAction('analyze')} className="p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-left flex items-center space-x-4 hover:bg-blue-600/20 group transition-all">
              <i className="fa-solid fa-magnifying-glass-chart text-blue-500 text-xl group-hover:scale-110"></i>
              <div className="flex flex-col"><span className="text-sm font-bold text-white">稿件深度點評</span><span className="text-[9px] text-blue-400 font-black uppercase mt-0.5">TONE & STRUCTURE</span></div>
            </button>
            
            <button onClick={() => handleAIAction('outline')} className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-left flex items-center space-x-4 hover:bg-indigo-600/20 group transition-all">
              <i className="fa-solid fa-diagram-project text-indigo-500 text-xl group-hover:scale-110"></i>
              <div className="flex flex-col"><span className="text-sm font-bold text-white">提取大綱</span><span className="text-[9px] text-indigo-400 font-black uppercase mt-0.5">OUTLINE</span></div>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
             <div className="p-6 bg-amber-600/10 border border-amber-500/30 rounded-3xl space-y-6">
                <div className="flex items-center space-x-3 text-amber-500">
                   <i className="fa-solid fa-file-shield text-xl"></i>
                   <h3 className="text-sm font-black uppercase tracking-widest">商業出版預審</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   <button onClick={() => handleAIAction('tone')} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/50 text-left transition-all group">
                      <p className="text-[11px] font-black text-white group-hover:text-amber-500">語氣一致性校對</p>
                      <p className="text-[9px] text-gray-500 mt-1">檢查情境切換是否流暢</p>
                   </button>
                   <button onClick={() => handleAIAction('pacing')} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/50 text-left transition-all group">
                      <p className="text-[11px] font-black text-white group-hover:text-amber-500">敘事節奏一致性</p>
                      <p className="text-[9px] text-gray-500 mt-1">分析劇情快慢分布</p>
                   </button>
                   <button onClick={() => handleAIAction('style')} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/50 text-left transition-all group">
                      <p className="text-[11px] font-black text-white group-hover:text-amber-500">書籍體例規範檢查</p>
                      <p className="text-[9px] text-gray-500 mt-1">確保符號與層級專業性</p>
                   </button>
                </div>
             </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center animate-pulse">
            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Gemini 專業審計中...</p>
          </div>
        ) : response && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 pb-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">
                   {currentReportType ? '審計報告 REPORT' : 'AI 結果 RESULT'}
                 </span>
                 {currentReportType && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
               </div>
               <button onClick={() => { setResponse(''); setCurrentReportType(null); }} className="text-[9px] font-black text-red-500 uppercase tracking-widest">清除</button>
            </div>
            
            {currentReportType && (
              <div className="px-4 py-2 bg-amber-600/20 border border-amber-500/30 rounded-xl">
                <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{currentReportType}</p>
              </div>
            )}

            <div className="p-6 rounded-3xl text-sm leading-relaxed border bg-white/5 border-white/5 text-slate-300 font-serif-editor whitespace-pre-wrap shadow-inner">
              {response}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <button onClick={handleCopyReport} className="py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">複製報告內容</button>
               <button onClick={handleApplyContent} className="py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">套用至文稿</button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 bg-[#0F0F10] border-t border-white/5">
        <div className="flex items-start space-x-3 opacity-40">
           <i className="fa-solid fa-circle-info text-[10px] mt-1"></i>
           <p className="text-[9px] font-black text-[#8E8E93] uppercase tracking-widest leading-normal">
             審計建議基於商業出版數據模型，旨在提升稿件市場競爭力。所有數據均受 InsPublish 安全協定保護。
           </p>
        </div>
      </footer>
    </aside>
  );
};

export default AIPanel;
