import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Project, CoverAssetType, CoverAsset } from '../types';
import { geminiService, COVER_SPECS } from '../services/geminiService';

interface CoverManagementModalProps {
  project: Project;
  onClose: () => void;
  onSave: (assets: Record<CoverAssetType, CoverAsset>) => void;
}

const CoverManagementModal: React.FC<CoverManagementModalProps> = ({ project, onClose, onSave }) => {
  const [selectedType, setSelectedType] = useState<CoverAssetType>(CoverAssetType.EBOOK_DIGITAL);
  const [currentAssets, setCurrentAssets] = useState<Record<CoverAssetType, CoverAsset>>(
    project.publishingPayload?.coverAssets || {} as Record<CoverAssetType, CoverAsset>
  );
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'AI' | 'UPLOAD'>('AI');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showBleedMask, setShowBleedMask] = useState(false);
  
  // Cropping States
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  const handleAIInvoke = async (retryWithSuggestions?: string) => {
    setIsProcessing(true);
    try {
      const basePrompt = customPrompt.trim() || `Professional artistic book cover for '${project.name}', dramatic lighting, award-winning illustration style.`;
      const prompt = retryWithSuggestions ? `${basePrompt}. Fix suggestions: ${retryWithSuggestions}` : basePrompt;
      
      const newAsset = await geminiService.generateImagenCover(prompt, selectedType);
      
      // Save current to history if it exists
      const existing = currentAssets[selectedType];
      if (existing) {
        const history = [existing.url, ...(existing.history || [])].slice(0, 5);
        newAsset.history = history;
      }
      
      const updated = { ...currentAssets, [selectedType]: newAsset };
      setCurrentAssets(updated);
    } catch (e) {
      alert("AI 生成失敗：" + e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreVersion = (url: string) => {
    const existing = currentAssets[selectedType];
    if (!existing) return;

    const newHistory = [existing.url, ...(existing.history || [])].filter(u => u !== url).slice(0, 5);
    const restoredAsset: CoverAsset = {
      ...existing,
      url: url,
      history: newHistory,
      timestamp: Date.now()
    };

    setCurrentAssets({ ...currentAssets, [selectedType]: restoredAsset });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCroppingImage(base64);
      setCropOffset({ x: 0, y: 0 });
      setCropScale(1);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!croppingImage || !cropImageRef.current || !cropContainerRef.current) return;

    const canvas = document.createElement('canvas');
    const spec = COVER_SPECS[selectedType];
    canvas.width = spec.width;
    canvas.height = spec.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = cropImageRef.current;
    const container = cropContainerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate source coordinates based on current view
    const displayWidth = img.width * cropScale;
    const displayHeight = img.height * cropScale;
    
    // The container represents the final output aspect ratio
    // We need to map the visible area of the image in the container to the canvas
    const scaleX = img.naturalWidth / displayWidth;
    const scaleY = img.naturalHeight / displayHeight;

    const sourceX = (-cropOffset.x) * scaleX;
    const sourceY = (-cropOffset.y) * scaleY;
    const sourceWidth = rect.width * scaleX;
    const sourceHeight = rect.height * scaleY;

    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    setCroppingImage(null);
    processUploadedImage(croppedBase64);
  };

  const processUploadedImage = async (base64: string) => {
    setIsProcessing(true);
    try {
      const { isCompliant, report } = await geminiService.checkCoverCompliance(base64, selectedType);
      const spec = COVER_SPECS[selectedType];
      
      const existing = currentAssets[selectedType];
      const history = existing ? [existing.url, ...(existing.history || [])].slice(0, 5) : [];

      const newAsset: CoverAsset = {
        url: base64,
        type: selectedType,
        width: spec.width,
        height: spec.height,
        source: 'UPLOAD',
        timestamp: Date.now(),
        isCompliant,
        complianceReport: report,
        history
      };

      setCurrentAssets({ ...currentAssets, [selectedType]: newAsset });
    } catch (err) {
      alert("圖片分析失敗");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const currentAsset = currentAssets[selectedType];
  const barcodeAsset = currentAssets[CoverAssetType.ISBN_BARCODE];

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center animate-in fade-in duration-500 font-sans">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative w-full max-w-[840px] bg-[#0A0A0B] border-t sm:border border-white/10 rounded-t-[3.5rem] sm:rounded-[3.5rem] shadow-3xl overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] animate-in slide-in-from-bottom duration-700">
        
        <header className="px-8 sm:px-12 pt-12 pb-8 shrink-0 z-20 bg-[#0A0A0B] border-b border-white/5">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black text-white tracking-tighter">封面資產管理</h2>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em]">COVER ASSET PROTOCOL V1.2</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
            {(Object.keys(COVER_SPECS) as CoverAssetType[]).map(type => (
              <button 
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {type.replace('_', ' ')}
                {currentAssets[type] && <i className="fa-solid fa-circle-check ml-2 text-[#D4FF5F]"></i>}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Preview Section */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Main Preview & Compliance</h3>
                    <button 
                      onClick={() => setShowBleedMask(!showBleedMask)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                        showBleedMask ? 'bg-[#D4FF5F] border-[#D4FF5F] text-black' : 'bg-white/5 border-white/10 text-gray-500'
                      }`}
                    >
                      Bleed Mask: {showBleedMask ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <span className="text-[9px] text-blue-500 font-bold uppercase">{COVER_SPECS[selectedType].ratio} Ratio</span>
                </div>
                
                <div className="relative aspect-[3/4] bg-black rounded-[44px] border border-white/5 overflow-hidden flex items-center justify-center group shadow-inner">
                  {currentAsset ? (
                    <>
                      <img src={currentAsset.url} className="w-full h-full object-cover animate-in zoom-in duration-700" alt="Preview" />
                      {showBleedMask && (
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-red-500/30 border-dashed animate-pulse">
                          <div className="absolute inset-0 border border-red-500/50" />
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">3mm Bleed Zone</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center space-y-4 opacity-20">
                       <i className="fa-solid fa-image text-6xl"></i>
                       <p className="text-[10px] font-black uppercase tracking-widest">No Asset Stored</p>
                    </div>
                  )}
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 animate-in fade-in">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">Processing Sequence...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Barcode Layout Simulator Section */}
              {barcodeAsset && (
                 <div className="bg-[#0F1115] p-8 rounded-[44px] border border-blue-600/20 space-y-6 animate-in slide-in-from-bottom-2 duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-center px-1">
                       <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">封底條碼排版模擬</p>
                       </div>
                       <span className="text-[9px] bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-600/20 font-black">BACK COVER SIMULATOR</span>
                    </div>
                    
                    {/* Back Cover Visual Simulation */}
                    <div className="relative aspect-[3/4] w-full bg-[#1A1A1B] rounded-[24px] border border-white/10 overflow-hidden shadow-inner flex items-end justify-end p-6">
                       {/* Barcode placed in standard bottom-right position */}
                       <div className="bg-white p-3 rounded-lg shadow-2xl flex flex-col items-center max-w-[120px] animate-in zoom-in duration-1000 delay-300">
                          <img src={barcodeAsset.url} alt="ISBN Barcode" className="h-10 object-contain" />
                          <p className="text-[8px] font-black text-black tracking-[0.1em] mt-1 font-mono">ISBN {project.publishingPayload?.isbn13}</p>
                       </div>
                       
                       {/* Representative back cover elements */}
                       <div className="absolute top-10 inset-x-8 space-y-2 opacity-10">
                          <div className="h-2 w-3/4 bg-white rounded-full"></div>
                          <div className="h-2 w-full bg-white rounded-full"></div>
                          <div className="h-2 w-5/6 bg-white rounded-full"></div>
                          <div className="h-2 w-1/2 bg-white rounded-full"></div>
                       </div>
                       
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-[10px] font-black text-white/5 uppercase tracking-[1em] -rotate-45">BACK COVER</p>
                       </div>
                    </div>

                    <div className="px-1 flex items-start space-x-3">
                       <i className="fa-solid fa-circle-info text-[10px] text-gray-600 mt-0.5"></i>
                       <p className="text-[10px] text-gray-600 font-medium leading-relaxed uppercase tracking-widest">
                         此為封底印刷模擬，條碼將自動嵌入在最終分發稿件的背部。
                       </p>
                    </div>
                 </div>
              )}

              {currentAsset && (
                <div className={`p-6 rounded-3xl border animate-in slide-in-from-top-4 duration-500 ${currentAsset.isCompliant ? 'bg-[#D4FF5F]/5 border-[#D4FF5F]/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                   <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-2 h-2 rounded-full ${currentAsset.isCompliant ? 'bg-[#D4FF5F] animate-pulse' : 'bg-amber-500'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${currentAsset.isCompliant ? 'text-[#D4FF5F]' : 'text-amber-500'}`}>
                        {currentAsset.isCompliant ? 'Compliance Passed' : 'Optimization Required'}
                      </span>
                   </div>
                   <p className="text-[13px] text-gray-400 leading-relaxed font-medium">
                      {currentAsset.complianceReport}
                   </p>
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="space-y-10">
               <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
                  <button onClick={() => setActiveTab('AI')} className={`flex-1 py-4 rounded-[1.6rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'AI' ? 'bg-white text-black' : 'text-gray-500'}`}>AI GENERATE</button>
                  <button onClick={() => setActiveTab('UPLOAD')} className={`flex-1 py-4 rounded-[1.6rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'UPLOAD' ? 'bg-white text-black' : 'text-gray-500'}`}>MANUAL UPLOAD</button>
               </div>

               {activeTab === 'AI' ? (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Style Intent (Optional)</label>
                       <textarea 
                         value={customPrompt}
                         onChange={e => setCustomPrompt(e.target.value)}
                         placeholder="Enter keywords for mood, style, or specific motifs..."
                         className="w-full h-40 bg-[#121214] border border-white/10 rounded-[32px] p-6 text-[15px] font-medium text-white outline-none focus:border-blue-600 transition-all resize-none leading-relaxed"
                       />
                    </div>
                    <button 
                      onClick={handleAIInvoke}
                      disabled={isProcessing}
                      className="w-full h-20 bg-blue-600 text-white rounded-full font-black text-[13px] uppercase tracking-[0.4em] shadow-xl active:scale-[0.98] transition-all hover:brightness-110"
                    >
                      Invoke Imagen 4.0
                    </button>
                 </div>
               ) : (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-white/10 rounded-[44px] flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-white/5 transition-all group"
                    >
                       <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
                          <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                       </div>
                       <div className="text-center">
                          <p className="text-[14px] font-bold text-gray-300">Drop your file here</p>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Supports JPG, PNG (Max 20MB)</p>
                       </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </div>
               )}
            </div>
          </div>
        </div>

        <footer className="p-8 sm:p-12 bg-[#0F0F10] border-t border-white/5 shrink-0">
          <button 
            onClick={() => onSave(currentAssets)}
            className="w-full h-24 bg-white text-black font-black uppercase rounded-full tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center text-[15px]"
          >
            Commit Assets to Project
          </button>
        </footer>
      </div>

      {/* Full-screen Cropping Interface */}
      {croppingImage && (
        <div className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="absolute top-12 left-12 space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">精確裁切模式</h2>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em]">ALIGNMENT PROTOCOL ACTIVE</p>
          </div>

          <div className="flex flex-col items-center space-y-8 w-full max-w-4xl">
            <div 
              ref={cropContainerRef}
              className="relative bg-white/5 border border-white/10 overflow-hidden cursor-move shadow-2xl"
              style={{ 
                width: 'min(70vh * 0.75, 90vw)', 
                aspectRatio: COVER_SPECS[selectedType].ratio.replace(':', '/') 
              }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            >
              <img 
                ref={cropImageRef}
                src={croppingImage} 
                alt="To Crop" 
                className="absolute pointer-events-none max-w-none origin-top-left"
                style={{
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})`,
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const container = cropContainerRef.current;
                  if (container) {
                    const scale = Math.max(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight);
                    setCropScale(scale);
                  }
                }}
              />
              
              {/* Bleed Guide in Cropper */}
              <div className="absolute inset-0 pointer-events-none border-[12px] border-white/20 border-dashed">
                <div className="absolute inset-0 border border-white/10" />
              </div>
            </div>

            <div className="w-full max-w-md space-y-6">
              <div className="flex items-center space-x-6">
                <i className="fa-solid fa-magnifying-glass-plus text-gray-500"></i>
                <input 
                  type="range" 
                  min="0.1" 
                  max="3" 
                  step="0.01" 
                  value={cropScale} 
                  onChange={(e) => setCropScale(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => setCroppingImage(null)}
                  className="flex-1 h-16 bg-white/5 text-white rounded-full font-black text-[11px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmCrop}
                  className="flex-2 h-16 bg-blue-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
                >
                  Confirm & Process Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default CoverManagementModal;