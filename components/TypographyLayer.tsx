import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';

interface TypographyLayerProps {
  project: Project;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onLayoutChange?: (layout: 'TOP' | 'MIDDLE' | 'BOTTOM') => void;
  onFontChange?: (font: 'SERIF' | 'SANS') => void;
}

type TextLayout = 'TOP' | 'MIDDLE' | 'BOTTOM';
type FontFamily = 'SERIF' | 'SANS';

const TypographyLayer: React.FC<TypographyLayerProps> = ({ 
  project, 
  canvasRef, 
  onLayoutChange, 
  onFontChange 
}) => {
  const [layout, setLayout] = useState<TextLayout>('MIDDLE');
  const [fontFamily, setFontFamily] = useState<FontFamily>('SERIF');
  const [showBleedMask, setShowBleedMask] = useState(true);

  // 任務 2.1: 動態文字渲染
  const renderTextOnCanvas = (
    canvas: HTMLCanvasElement,
    title: string,
    author: string,
    layoutType: TextLayout,
    fontType: FontFamily
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 設定字體
    const fontFamily = fontType === 'SERIF' 
      ? 'Georgia, serif' 
      : 'Arial, sans-serif';
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 計算文字位置
    let titleY: number;
    const padding = 80;
    const titleFontSize = 48;
    const authorFontSize = 24;

    switch (layoutType) {
      case 'TOP':
        titleY = padding + titleFontSize;
        break;
      case 'BOTTOM':
        titleY = canvasHeight - padding - authorFontSize - 40;
        break;
      case 'MIDDLE':
      default:
        titleY = canvasHeight / 2;
    }

    // 繪製標題
    ctx.font = `bold ${titleFontSize}px ${fontFamily}`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(title, canvasWidth / 2, titleY);

    // 繪製作者名
    ctx.font = `${authorFontSize}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(author, canvasWidth / 2, titleY + authorFontSize + 30);

    // 繪製出血位標記 (3mm 紅色虛線)
    if (showBleedMask) {
      const dpi = 300; // 假設 300 DPI
      const bleedMM = 3;
      const bleedPx = (bleedMM / 25.4) * dpi; // 轉換為像素

      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      // 繪製出血邊界
      ctx.strokeRect(bleedPx, bleedPx, canvasWidth - 2 * bleedPx, canvasHeight - 2 * bleedPx);
      
      ctx.setLineDash([]);
    }
  };

  // 監聽 canvas 變化
  useEffect(() => {
    if (canvasRef.current) {
      renderTextOnCanvas(
        canvasRef.current,
        project.name,
        project.publishingPayload?.author || 'Author Identity',
        layout,
        fontFamily
      );
    }
  }, [layout, fontFamily, showBleedMask, project.name, project.publishingPayload?.author]);

  const handleLayoutChange = (newLayout: TextLayout) => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  const handleFontChange = (newFont: FontFamily) => {
    setFontFamily(newFont);
    onFontChange?.(newFont);
  };

  return (
    <div className="space-y-6">
      {/* 佈局切換介面 */}
      <div className="space-y-3">
        <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest">
          文字佈局 (Text Layout)
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['TOP', 'MIDDLE', 'BOTTOM'] as TextLayout[]).map((layoutOption) => (
            <button
              key={layoutOption}
              onClick={() => handleLayoutChange(layoutOption)}
              className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                layout === layoutOption
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {layoutOption === 'TOP' && '頂部'}
              {layoutOption === 'MIDDLE' && '置中'}
              {layoutOption === 'BOTTOM' && '底部'}
            </button>
          ))}
        </div>
      </div>

      {/* 字體選擇介面 */}
      <div className="space-y-3">
        <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest">
          字體風格 (Font Family)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['SERIF', 'SANS'] as FontFamily[]).map((fontOption) => (
            <button
              key={fontOption}
              onClick={() => handleFontChange(fontOption)}
              className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                fontFamily === fontOption
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
              }`}
              style={{
                fontFamily: fontOption === 'SERIF' ? 'Georgia, serif' : 'Arial, sans-serif'
              }}
            >
              {fontOption === 'SERIF' && '襯線'}
              {fontOption === 'SANS' && '無襯線'}
            </button>
          ))}
        </div>
      </div>

      {/* 出血位顯示開關 */}
      <div className="space-y-3">
        <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest">
          視覺出血位 (Bleed Mask)
        </label>
        <button
          onClick={() => setShowBleedMask(!showBleedMask)}
          className={`w-full py-3 px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
            showBleedMask
              ? 'bg-red-600/20 border-red-600/40 text-red-400'
              : 'bg-white/5 border-white/5 text-gray-500'
          }`}
        >
          {showBleedMask ? '✓ 出血位已顯示' : '出血位已隱藏'}
        </button>
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">
          紅色虛線表示 3mm 出血區域，確保印刷時不會裁切到重要內容
        </p>
      </div>
    </div>
  );
};

export default TypographyLayer;
