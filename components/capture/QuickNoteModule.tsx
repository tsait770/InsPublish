
import React, { useState } from 'react';
import { OCRBlock, CaptureMode } from '../../types';

interface QuickNoteModuleProps {
  mode: CaptureMode;
  setMode: (mode: CaptureMode) => void;
  setOcrBlocks: (blocks: OCRBlock[]) => void;
  setShowDistribution: (show: boolean) => void;
  setDetectedLanguage: (lang: string | null) => void;
  setLangConfidence: (conf: number | null) => void;
}

const QuickNoteModule: React.FC<QuickNoteModuleProps> = ({ 
  mode, 
  setMode, 
  setOcrBlocks, 
  setShowDistribution, 
  setDetectedLanguage, 
  setLangConfidence 
}) => {
  const [note, setNote] = useState('');

  const handleFinish = () => {
    if (note.trim()) {
      setOcrBlocks([{
        id: `note-${Date.now()}`,
        text: note,
        type: 'body',
        confidence: 1,
        isSelected: true
      }]);
      setDetectedLanguage("手動輸入");
      setLangConfidence(1);
      setMode('IDLE');
      setShowDistribution(true);
      setNote('');
    }
  };

  if (mode !== 'QUICK_NOTE_INPUT') return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-8">
       <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setMode('IDLE')} />
       <div className="relative w-full max-w-lg bg-[#1C1C1E] rounded-t-[44px] sm:rounded-[44px] border border-white/5 overflow-hidden shadow-3xl animate-in slide-in-from-bottom duration-500 flex flex-col h-[90vh] sm:h-auto">
          <header className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
             <div>
               <h2 className="text-2xl font-black text-white">快速記錄</h2>
               <p className="text-[10px] font-black text-gray-500 uppercase mt-1">DRAFT YOUR IDEAS</p>
             </div>
             <button onClick={() => setMode('IDLE')} className="w-12 h-12 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors">
               <i className="fa-solid fa-xmark"></i>
             </button>
          </header>
          
          <main className="flex-1 p-8 overflow-y-auto">
             <textarea 
               autoFocus
               value={note}
               onChange={(e) => setNote(e.target.value)}
               placeholder="在此輸入您的靈感或筆記..."
               className="w-full h-80 bg-transparent border-none focus:ring-0 outline-none resize-none text-xl font-serif-editor text-gray-200 leading-relaxed placeholder-white/5"
             />
          </main>

          <footer className="p-8 bg-[#0F0F10] border-t border-white/5">
             <button 
               onClick={handleFinish}
               disabled={!note.trim()}
               className={`w-full py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${!note.trim() ? 'bg-gray-800 text-gray-500' : 'bg-[#FF6B2C] text-white shadow-[#FF6B2C]/20'}`}
             >
                完 成 並 分 發
             </button>
          </footer>
       </div>
    </div>
  );
};

export default QuickNoteModule;
