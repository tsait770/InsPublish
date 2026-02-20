
import React, { useState } from 'react';
import { Project, OCRBlock } from '../../types';
import { geminiService } from '../../services/geminiService';

interface DistributionHubProps {
  showDistribution: boolean;
  setShowDistribution: (show: boolean) => void;
  ocrBlocks: OCRBlock[];
  setOcrBlocks: React.Dispatch<React.SetStateAction<OCRBlock[]>>;
  projects: Project[];
  onSaveToProject: (projectId: string, content: string, chapterId?: string) => void;
  onSaveToNotebook: (content: string) => void;
  detectedLanguage: string | null;
  langConfidence: number | null;
}

const DistributionHub: React.FC<DistributionHubProps> = ({ 
  showDistribution, 
  setShowDistribution, 
  ocrBlocks, 
  setOcrBlocks, 
  projects, 
  onSaveToProject, 
  onSaveToNotebook,
  detectedLanguage,
  langConfidence
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const toggleBlockSelection = (id: string) => {
    setOcrBlocks(prev => prev.map(b => b.id === id ? { ...b, isSelected: !b.isSelected } : b));
  };

  const handleBlockAction = async (id: string, action: 'copy' | 'summarize' | 'rewrite') => {
    const block = ocrBlocks.find(b => b.id === id);
    if (!block) return;

    if (action === 'copy') {
      await navigator.clipboard.writeText(block.text);
      return;
    }

    setOcrBlocks(prev => prev.map(b => b.id === id ? { ...b, isProcessing: true } : b));
    try {
      let resultText = '';
      if (action === 'summarize') {
        resultText = await geminiService.summarizeText(block.text);
      } else if (action === 'rewrite') {
        resultText = await geminiService.rewriteText(block.text);
      }
      setOcrBlocks(prev => prev.map(b => b.id === id ? { ...b, text: resultText, isProcessing: false } : b));
    } catch (e) {
      alert('AI 處理失敗');
      setOcrBlocks(prev => prev.map(b => b.id === id ? { ...b, isProcessing: false } : b));
    }
  };

  const handleFinalSave = () => {
    const selectedContent = ocrBlocks
      .filter(b => b.isSelected)
      .map(b => b.text)
      .join('\n\n');

    if (!selectedContent.trim()) {
      alert('請至少選擇一個區塊進行分發');
      return;
    }

    if (selectedProjectId) {
      onSaveToProject(selectedProjectId, selectedContent, selectedChapterId || undefined);
    } else {
      onSaveToNotebook(selectedContent);
    }
    setShowDistribution(false);
    setOcrBlocks([]);
  };

  const getSegmentStyle = (type: string) => {
    switch (type) {
      case 'title': return 'text-2xl sm:text-3xl font-black text-white tracking-tighter mb-4';
      case 'heading': return 'text-xl font-bold text-blue-400 tracking-tight mb-2';
      case 'quote': return 'italic border-l-4 border-purple-500/50 pl-6 text-purple-200/80 leading-relaxed';
      case 'metadata': return 'text-xs font-mono text-gray-500 uppercase tracking-widest';
      default: return 'text-lg font-serif-editor leading-relaxed text-gray-300';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'title': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'heading': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'quote': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'metadata': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-white/5 text-gray-400 border-white/5';
    }
  };

  if (!showDistribution) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-8">
       <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setShowDistribution(false)} />
       <div className="relative w-full max-w-4xl bg-[#1C1C1E] rounded-[56px] border border-white/5 overflow-hidden shadow-3xl flex flex-col animate-in slide-in-from-bottom duration-500 max-h-[92vh]">
          <header className="p-8 sm:p-10 border-b border-white/5 flex justify-between items-center shrink-0">
             <div className="space-y-1">
               <h2 className="text-2xl font-black text-white tracking-tight">靈感分發中心</h2>
               <div className="flex items-center space-x-3">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LOGICAL EXTRACTION HUB</p>
                  {detectedLanguage && (
                    <div className="flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-full">
                       <i className="fa-solid fa-language text-[10px] text-blue-400"></i>
                       <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{detectedLanguage}</span>
                       {langConfidence && <span className="text-[8px] text-blue-500/60 font-bold">{(langConfidence * 100).toFixed(0)}%</span>}
                    </div>
                  )}
               </div>
             </div>
             <button onClick={() => setShowDistribution(false)} className="w-12 h-12 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark"></i>
             </button>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10 flex flex-col lg:flex-row gap-10">
             <div className="flex-1 space-y-8">
                <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">識別到的結構區塊</h5>
                <div className="space-y-4">
                   {ocrBlocks.map((block) => (
                     <div 
                       key={block.id} 
                       className={`relative group bg-black/30 rounded-[32px] border transition-all overflow-hidden ${block.isSelected ? 'border-blue-500/40 bg-blue-600/5' : 'border-white/5 opacity-60'}`}
                     >
                       <div className="p-6 sm:p-8 flex items-start space-x-5">
                          <button 
                            onClick={() => toggleBlockSelection(block.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all mt-1 shrink-0 ${block.isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10'}`}
                          >
                             {block.isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                   <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getBadgeColor(block.type)}`}>
                                      {block.type}
                                   </span>
                                   <div className="flex items-center space-x-1.5">
                                      <div className={`w-8 h-1.5 rounded-full overflow-hidden ${block.confidence < 0.7 ? 'bg-red-500/20' : 'bg-white/5'}`}>
                                         <div className={`h-full transition-all ${block.confidence < 0.7 ? 'bg-red-500' : 'bg-green-500/60'}`} style={{ width: `${block.confidence * 100}%` }} />
                                      </div>
                                      <span className={`text-[9px] font-bold ${block.confidence < 0.7 ? 'text-red-500' : 'text-gray-600'}`}>{(block.confidence * 100).toFixed(0)}%</span>
                                   </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 shrink-0">
                                   <button 
                                     onClick={() => handleBlockAction(block.id, 'copy')} 
                                     className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all active:scale-95"
                                   >
                                      <i className="fa-solid fa-copy text-[10px]"></i>
                                      <span className="text-[10px] font-bold">複製</span>
                                   </button>
                                   <button 
                                     onClick={() => handleBlockAction(block.id, 'summarize')} 
                                     className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600/20 transition-all active:scale-95"
                                   >
                                      <i className="fa-solid fa-compress text-[10px]"></i>
                                      <span className="text-[10px] font-bold">AI 摘要</span>
                                   </button>
                                   <button 
                                     onClick={() => handleBlockAction(block.id, 'rewrite')} 
                                     className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600/10 text-purple-400 rounded-xl hover:bg-purple-600/20 transition-all active:scale-95"
                                   >
                                      <i className="fa-solid fa-wand-sparkles text-[10px]"></i>
                                      <span className="text-[10px] font-bold">AI 改寫</span>
                                   </button>
                                </div>
                             </div>
                             
                             <div className="relative">
                               {block.isProcessing && (
                                 <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                 </div>
                               )}
                               <div className={`${getSegmentStyle(block.type)} whitespace-pre-wrap transition-all ${block.isSelected ? 'opacity-100' : 'opacity-40'} ${block.isProcessing ? 'blur-[1px]' : ''}`}>
                                  {block.text}
                               </div>
                             </div>
                          </div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="lg:w-80 space-y-10 shrink-0">
                <div className="space-y-6">
                   <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">存儲目標庫</h5>
                   <div className="space-y-3">
                      <button 
                        onClick={() => setSelectedProjectId(null)}
                        className={`w-full p-6 rounded-[32px] border flex items-center justify-between transition-all ${selectedProjectId === null ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white/5 border-white/5 text-gray-400'}`}
                      >
                         <div className="flex items-center space-x-4">
                            <i className="fa-solid fa-box-archive text-xl"></i>
                            <span className="text-sm font-black uppercase tracking-widest">靈感筆記本</span>
                         </div>
                         {selectedProjectId === null && <i className="fa-solid fa-circle-check"></i>}
                      </button>
                      
                      {projects.map(p => (
                        <div key={p.id} className="space-y-3">
                          <button 
                            onClick={() => setSelectedProjectId(p.id)}
                            className={`w-full p-6 rounded-[32px] border flex items-center justify-between transition-all ${selectedProjectId === p.id ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}
                          >
                             <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: p.color }}><i className={`fa-solid ${p.icon} text-black text-xs`}></i></div>
                                <span className="text-sm font-black truncate max-w-[120px]">{p.name}</span>
                             </div>
                             {selectedProjectId === p.id && <i className="fa-solid fa-chevron-down text-xs opacity-40"></i>}
                          </button>
                          
                          {selectedProjectId === p.id && (
                            <div className="pl-6 py-2 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                               {p.chapters.map(c => (
                                 <button key={c.id} onClick={() => setSelectedChapterId(c.id)} className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all border ${selectedChapterId === c.id ? 'bg-[#7b61ff] border-[#7b61ff] text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500'}`}>{c.title}</button>
                               ))}
                               <button onClick={() => setSelectedChapterId(null)} className={`px-4 py-2 rounded-xl text-[9px] font-black border transition-all ${selectedChapterId === null ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>+ 新章節</button>
                            </div>
                          )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </main>

          <footer className="p-8 sm:p-10 bg-[#0F0F10] border-t border-white/5">
             <button onClick={handleFinalSave} className="w-full py-7 bg-[#D4FF5F] text-black font-black text-sm uppercase tracking-[0.4em] rounded-[32px] shadow-2xl active:scale-[0.97] transition-all">完 成 並 分 發 內 容</button>
          </footer>
       </div>
    </div>
  );
};

export default DistributionHub;
