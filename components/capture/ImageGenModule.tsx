
import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { ImageSize, CaptureMode } from '../../types';

interface ImageGenModuleProps {
  mode: CaptureMode;
  setMode: (mode: CaptureMode) => void;
  onFinish: (imageUrl: string) => void;
}

const ImageGenModule: React.FC<ImageGenModuleProps> = ({ mode, setMode, onFinish }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSelectedKey, setHasSelectedKey] = useState(false);

  // Check key status on mount
  React.useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasSelectedKey(has);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasSelectedKey(true); // Proceed assuming success to mitigate race condition
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Force key check if not using process.env.API_KEY directly through proxy
    if (!hasSelectedKey && !(window as any).aistudio?.hasSelectedApiKey()) {
        await handleOpenKeySelector();
        return;
    }

    setIsGenerating(true);
    try {
      const url = await geminiService.generateImage(prompt, size);
      onFinish(url);
      setPrompt('');
      setMode('IDLE');
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found.")) {
        setHasSelectedKey(false);
        alert("API Key 無效或已過期，請重新選擇。");
        await handleOpenKeySelector();
      } else {
        alert("影像生成失敗: " + e.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (mode !== 'IDLE' && mode !== ('IMAGE_GEN' as any)) return null;
  if (mode !== ('IMAGE_GEN' as any)) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setMode('IDLE')} />
      <div className="relative w-full max-w-xl bg-[#1C1C1E] rounded-t-[44px] sm:rounded-[44px] border border-white/5 overflow-hidden shadow-3xl flex flex-col h-[90vh] sm:h-auto animate-in slide-in-from-bottom duration-500">
        <header className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">AI 影像生成</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase mt-1">GEMINI 3 PRO IMAGE ENGINE</p>
          </div>
          <button onClick={() => setMode('IDLE')} className="w-12 h-12 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <main className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-2">影像描述 PROMPT</label>
            <textarea 
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：一位在雨中寫作的作家，賽博龐克風格，高品質攝影..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-3xl p-6 text-lg font-medium text-white outline-none focus:border-blue-600 transition-all placeholder-white/5 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-2">影像品質 RESOLUTION</label>
            <div className="grid grid-cols-3 gap-3">
              {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                <button 
                  key={s} 
                  onClick={() => setSize(s)}
                  className={`h-14 rounded-2xl text-[12px] font-black transition-all border ${size === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                >
                  {s} {s === '4K' ? 'Ultra' : s === '2K' ? 'High' : 'Std'}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center mt-2">更高解析度將消耗更多 API 額度與生成時間</p>
          </div>

          {!hasSelectedKey && (
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-4">
              <div className="flex items-start space-x-4">
                <i className="fa-solid fa-key text-amber-500 mt-1"></i>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">需要授權付費 API Key</p>
                  <p className="text-xs text-gray-400 leading-relaxed">影像生成與高品質視訊功能僅支援來自付費 GCP 專案的 API Key。請確保您的帳戶已連結帳單。</p>
                </div>
              </div>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">查看帳單說明文檔</a>
            </div>
          )}
        </main>

        <footer className="p-8 bg-[#0F0F10] border-t border-white/5 space-y-6">
          {!hasSelectedKey ? (
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-7 rounded-[32px] bg-blue-600 text-white font-black text-sm uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all"
            >
              選擇 Google Cloud API KEY
            </button>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-7 rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] ${!prompt.trim() || isGenerating ? 'bg-gray-800 text-gray-500' : 'bg-white text-black'}`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-4">
                   <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                   <span>正在渲染高品質影像...</span>
                </div>
              ) : '執 行 影 像 生 成'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ImageGenModule;
