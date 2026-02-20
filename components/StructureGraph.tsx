import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

const StructureGraph: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nodes, setNodes] = useState<any[]>([
    { id: 'c1', label: 'Protagonist', type: 'CHARACTER' },
    { id: 'n1', label: 'Inciting Incident', type: 'NARRATIVE' },
    { id: 'r1', label: 'Quantum Physics', type: 'RESEARCH' }
  ]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 假設從當前專案內容提取
      const result = await geminiService.analyzeProjectStructure("當前文稿內容...");
      setNodes(result.nodes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'CHARACTER': return 'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]';
      case 'NARRATIVE': return 'bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]';
      case 'RESEARCH': return 'bg-lime-500 shadow-[0_0_30px_rgba(132,204,22,0.4)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[900] bg-[#0A0A0B] flex flex-col animate-in slide-in-from-right duration-500">
      <header className="h-20 px-8 flex justify-between items-center border-b border-white/5 bg-[#0F0F10]">
        <div>
           <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">STRUCTURE GRAPH</p>
           <h2 className="text-xl font-black text-white tracking-tighter mt-1">The Solar Paradox <span className="text-[9px] bg-blue-600/20 text-blue-500 px-2 py-0.5 rounded ml-2">SCI-FI</span></h2>
        </div>
        <div className="flex items-center space-x-4">
           <button className="p-3 bg-white/5 text-gray-400 rounded-full hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
           <button onClick={onClose} className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] px-5 py-2 hover:bg-white/5 rounded-xl transition-all">Done</button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#ffffff08_1.5px,transparent_1.5px)] [background-size:40px_40px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="relative w-[600px] h-[450px]">
              {/* Central Core Theme Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-[#7b61ff] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(123,97,255,0.5)] z-10 group cursor-pointer">
                 <span className="text-4xl font-black text-white">SP</span>
                 <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"><p className="text-[12px] font-black text-white uppercase tracking-[0.4em] bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">CORE THEME</p></div>
              </div>

              {/* Dynamic Nodes from AI or State */}
              {nodes.map((node, i) => {
                const angle = (i * 2 * Math.PI) / nodes.length;
                const r = 180;
                const left = 300 + r * Math.cos(angle) - 48;
                const top = 225 + r * Math.sin(angle) - 48;
                
                return (
                  <div key={node.id} className={`absolute w-24 h-24 rounded-full flex items-center justify-center border-4 border-[#0A0A0B] z-20 hover:scale-110 transition-all cursor-pointer ${getNodeColor(node.type)}`} style={{ left, top }}>
                     <span className="text-[10px] font-black text-white text-center leading-tight px-2">{node.label}</span>
                  </div>
                );
              })}
           </div>
        </div>
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
             <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Gemini Pro Analyzing Narrative Structure...</p>
          </div>
        )}
      </div>

      <footer className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-[#1A1A1B]/90 backdrop-blur-2xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl space-x-2">
         <button className="flex flex-col items-center px-8 py-3 hover:bg-white/5 rounded-3xl transition-colors group">
            <svg className="w-6 h-6 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2 group-hover:text-white">Add Node</span>
         </button>
         <button onClick={runAIAnalysis} className="flex flex-col items-center px-8 py-3 hover:bg-white/5 rounded-3xl transition-colors group">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">AI Analyze</span>
         </button>
         <button className="flex flex-col items-center px-8 py-3 hover:bg-white/5 rounded-3xl transition-colors group">
            <svg className="w-6 h-6 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 12h16m-8-8v16"/></svg>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2 group-hover:text-white">Auto-Layout</span>
         </button>
      </footer>
    </div>
  );
};

export default StructureGraph;