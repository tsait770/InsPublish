
import React, { useState, useEffect } from 'react';
import { Project, OCRBlock, CaptureMode, MembershipLevel } from '../types';
import VoiceModule from './capture/VoiceModule';
import QuickNoteModule from './capture/QuickNoteModule';
import ScanModule from './capture/ScanModule';
import ImageGenModule from './capture/ImageGenModule';
import DistributionHub from './capture/DistributionHub';

interface CaptureCenterProps {
  projects: Project[];
  onSaveToProject: (projectId: string, content: string, chapterId?: string) => void;
  onSaveToNotebook: (content: string) => void;
  membership: MembershipLevel;
  onUpgrade: () => void;
  onToggleFullscreenUI: (isHidden: boolean) => void;
}

const CaptureCenter: React.FC<CaptureCenterProps> = ({ projects, onSaveToProject, onSaveToNotebook, membership, onUpgrade, onToggleFullscreenUI }) => {
  const [mode, setMode] = useState<CaptureMode | 'IMAGE_GEN'>('IDLE');
  const [ocrBlocks, setOcrBlocks] = useState<OCRBlock[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [langConfidence, setLangConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);

  // 當模式改變時決定是否隱藏頂部與底部導航
  useEffect(() => {
    const isFullscreenMode = mode === 'CAMERA_ACTIVE' || mode === 'SCAN_SELECT' || mode === 'IMAGE_GEN';
    onToggleFullscreenUI(isFullscreenMode);
  }, [mode, onToggleFullscreenUI]);

  const recentCaptures = [
    { id: '1', title: 'Research Paper Snippet', subtitle: '"The methodology for the quantum entan...', time: '2H AGO', icon: 'fa-file-lines', color: 'bg-[#123E66]/20 text-blue-500' },
    { id: '2', title: 'Meeting Recording', subtitle: '02:44 Audio Log', time: 'YESTERDAY', icon: 'fa-microphone', color: 'bg-purple-900/20 text-purple-500' },
    { id: '3', title: 'Whiteboard Session', subtitle: '3 images attached • Project: Neon Shado...', time: '3 DAYS AGO', icon: 'fa-image', color: 'bg-orange-900/20 text-orange-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-black text-white px-8 pb-40 overflow-y-auto no-scrollbar">
      
      {mode === 'IDLE' && (
        <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Main Scan Card - Precise match for screenshot 2 */}
          <button 
            onClick={() => setMode('SCAN_SELECT')}
            className="w-full h-[240px] bg-[#D4FF5F] rounded-[44px] p-10 flex flex-col justify-between items-start text-black shadow-[0_30px_60px_rgba(212,255,95,0.15)] active:scale-[0.98] transition-all relative overflow-hidden"
          >
            <div className="flex justify-between w-full items-start">
               <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center">
                  <i className="fa-solid fa-camera text-2xl"></i>
               </div>
               <span className="text-5xl font-black tracking-tighter opacity-100 uppercase mt-[-4px]">SCAN</span>
            </div>
            <div className="text-left z-10">
              <h4 className="text-4xl font-black leading-[1.1] tracking-tighter">Scan<br/>Document</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-3">PRO OCR ENGINE</p>
            </div>
          </button>

          {/* Split row - Precise match for screenshot 2 */}
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => setMode('VOICE_RECORDING')}
              className="bg-[#B2A4FF] rounded-[44px] aspect-square p-8 flex flex-col justify-between items-start text-[#121212] shadow-[0_30px_60px_rgba(178,164,255,0.15)] active:scale-[0.98] transition-all relative"
            >
              <div className="flex justify-end w-full">
                <i className="fa-solid fa-microphone-lines text-2xl opacity-20"></i>
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-black leading-tight tracking-tighter">Voice<br/>Note</h4>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-2">TRANSCRIBE</p>
              </div>
            </button>
            <button 
              onClick={() => setMode('QUICK_NOTE_INPUT')}
              className="bg-[#FF6B2C] rounded-[44px] aspect-square p-8 flex flex-col justify-between items-start text-white shadow-[0_30px_60px_rgba(255,107,44,0.15)] active:scale-[0.98] transition-all relative"
            >
              <div className="flex justify-end w-full">
                <i className="fa-solid fa-pen-to-square text-2xl opacity-30"></i>
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-black leading-tight tracking-tighter">Quick<br/>Note</h4>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-2">DRAFT NOW</p>
              </div>
            </button>
          </div>

          <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.25em]">RECENT CAPTURES</h3>
                <button className="bg-white/5 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-500">VIEW ALL</button>
             </div>
             <div className="space-y-4">
                {recentCaptures.map(item => (
                   <div key={item.id} className="bg-[#121214] p-6 rounded-[32px] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center space-x-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${item.color}`}>
                            <i className={`fa-solid ${item.icon}`}></i>
                         </div>
                         <div>
                            <h5 className="text-[15px] font-bold text-white tracking-tight">{item.title}</h5>
                            <p className="text-[11px] text-gray-500 font-medium truncate max-w-[180px] mt-0.5">{item.subtitle}</p>
                         </div>
                      </div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{item.time}</p>
                   </div>
                ))}
             </div>
          </section>
        </div>
      )}

      <ScanModule 
        mode={mode as any} 
        setMode={setMode as any} 
        setIsProcessing={setIsProcessing}
        setOcrBlocks={setOcrBlocks}
        setDetectedLanguage={setDetectedLanguage}
        setLangConfidence={setLangConfidence}
        setShowDistribution={setShowDistribution}
        membership={membership}
        onUpgrade={onUpgrade}
      />

      <VoiceModule mode={mode as any} setMode={setMode as any} setIsProcessing={setIsProcessing} setOcrBlocks={setOcrBlocks} setDetectedLanguage={setDetectedLanguage} setLangConfidence={setLangConfidence} setShowDistribution={setShowDistribution} />
      <QuickNoteModule mode={mode as any} setMode={setMode as any} setOcrBlocks={setOcrBlocks} setShowDistribution={setShowDistribution} setDetectedLanguage={setDetectedLanguage} setLangConfidence={setLangConfidence} />
      
      <ImageGenModule 
        mode={mode as any} 
        setMode={setMode as any} 
        onFinish={(url) => {
           setOcrBlocks([{ id: `img-${Date.now()}`, text: `[AI GENERATED IMAGE: ${url}]`, type: 'metadata', confidence: 1, isSelected: true }]);
           setDetectedLanguage("影像生成");
           setLangConfidence(1);
           setShowDistribution(true);
        }} 
      />

      <DistributionHub 
        showDistribution={showDistribution}
        setShowDistribution={setShowDistribution}
        ocrBlocks={ocrBlocks}
        setOcrBlocks={setOcrBlocks}
        projects={projects}
        onSaveToProject={onSaveToProject}
        onSaveToNotebook={onSaveToNotebook}
        detectedLanguage={detectedLanguage}
        langConfidence={langConfidence}
      />

      {/* AI 處理動畫 */}
      {isProcessing && (
        <div className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 backdrop-blur-3xl">
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-blue-600/[0.03] rounded-full blur-[180px] animate-pulse"></div>
           </div>
           <div className="relative mb-28">
              <div className="w-32 h-32 flex items-center justify-center relative">
                 <i className="fa-solid fa-shield-halved text-7xl text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] opacity-80 animate-[soft-float_3s_ease-in-out_infinite]"></i>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#D4FF5F] rounded-full shadow-[0_0_15px_#D4FF5F] opacity-40"></div>
                 </div>
              </div>
           </div>
           <div className="text-center space-y-10 z-10">
              <div className="space-y-4">
                 <h2 className="text-[32px] font-black text-white tracking-tighter leading-none animate-in slide-in-from-bottom-4">
                    正在執行深度語義佈局分析
                 </h2>
                 <p className="text-[12px] text-gray-500 font-bold tracking-[0.4em] uppercase">
                    PROPRIETARY NARRATIVE PROTOCOL
                 </p>
              </div>
              <div className="w-64 h-[1px] bg-white/10 mx-auto relative overflow-hidden rounded-full">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4FF5F] to-transparent animate-[scan-line_2.5s_infinite] w-32 -translate-x-full"></div>
              </div>
              <div className="flex flex-col items-center space-y-5 pt-2">
                 <p className="text-[10px] text-[#D4FF5F] font-black uppercase tracking-[0.6em] opacity-80">
                    GEMINI PRO V3 ENGINE ACTIVE
                 </p>
                 <div className="flex space-x-2">
                    {[0, 1, 2].map(i => (
                       <div key={i} className="w-1 h-1 rounded-full bg-blue-500/40 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                    ))}
                 </div>
              </div>
           </div>

           <style dangerouslySetInnerHTML={{ __html: `
              @keyframes scan-line { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
              @keyframes soft-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
           `}} />
        </div>
      )}
    </div>
  );
};

export default CaptureCenter;
