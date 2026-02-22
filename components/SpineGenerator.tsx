import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';

interface SpineGeneratorProps {
  project: Project;
  onSpineGenerated?: (spineData: SpineData) => void;
}

interface SpineData {
  width: number;
  height: number;
  thickness: number;
  imageUrl: string;
  pageCount: number;
}

const SpineGenerator: React.FC<SpineGeneratorProps> = ({ project, onSpineGenerated }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spineData, setSpineData] = useState<SpineData | null>(null);

  // 任務 4.1: 根據專案總字數自動計算頁數與書脊厚度
  const calculateSpineMetrics = () => {
    const totalWords = project.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
    
    // 標準出版：每頁約 250 字（中文）
    const wordsPerPage = 250;
    const pageCount = Math.ceil(totalWords / wordsPerPage);
    
    // 標準紙張厚度計算
    // 80g 銅版紙：約 0.1mm/頁
    // 計算公式：厚度(mm) = 頁數 × 紙張厚度
    const paperThickness = 0.1; // mm per page
    const spineThickness = pageCount * paperThickness;
    
    // 標準封面尺寸 (3:4 比例，以 EBOOK_DIGITAL 為基準)
    const coverHeight = 2133; // pixels (A4 高度)
    const coverWidth = 1600; // pixels (A4 寬度)
    
    return {
      pageCount,
      thickness: spineThickness,
      coverHeight,
      coverWidth
    };
  };

  // 任務 4.1: Canvas 垂直排版技術 - 將書名注入書脊區域
  const generateSpineImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const metrics = calculateSpineMetrics();
    
    // 設定 Canvas 尺寸
    // 書脊寬度 = 計算出的厚度（轉換為像素）
    // 書脊高度 = 封面高度
    const dpi = 300; // 印刷標準 DPI
    const spineWidthPx = Math.ceil((metrics.thickness / 25.4) * dpi); // mm 轉 pixel
    const spineHeightPx = metrics.coverHeight;

    canvas.width = spineWidthPx;
    canvas.height = spineHeightPx;

    // 繪製背景 (漸層)
    const gradient = ctx.createLinearGradient(0, 0, spineWidthPx, spineHeightPx);
    gradient.addColorStop(0, '#1C1C1E');
    gradient.addColorStop(1, '#2A2A2E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spineWidthPx, spineHeightPx);

    // 繪製邊框
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, spineWidthPx, spineHeightPx);

    // 垂直排版 - 書名
    ctx.save();
    ctx.translate(spineWidthPx / 2, spineHeightPx / 2);
    ctx.rotate(-Math.PI / 2); // 旋轉 90 度

    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 繪製書名（垂直排列）
    ctx.fillText(project.name, 0, -50);

    // 繪製作者名（垂直排列）
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(project.publishingPayload?.author || 'Author', 0, 50);

    ctx.restore();

    // 繪製頁數與厚度資訊
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(`${metrics.pageCount} pages`, spineWidthPx / 2, spineHeightPx - 20);

    // 轉換為 Base64
    const imageUrl = canvas.toDataURL('image/png');

    const newSpineData: SpineData = {
      width: spineWidthPx,
      height: spineHeightPx,
      thickness: metrics.thickness,
      imageUrl,
      pageCount: metrics.pageCount
    };

    setSpineData(newSpineData);
    onSpineGenerated?.(newSpineData);
  };

  // 監聽專案變化，自動重新生成書脊
  useEffect(() => {
    generateSpineImage();
  }, [project.name, project.chapters, project.publishingPayload?.author]);

  const metrics = calculateSpineMetrics();

  return (
    <div className="space-y-8">
      {/* 書脊預覽 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[12px] font-black text-gray-600 uppercase tracking-widest">
            實體書脊預覽
          </h3>
          <span className="text-[9px] bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-600/20 font-black">
            {metrics.thickness.toFixed(2)}mm
          </span>
        </div>

        <div className="relative bg-black rounded-[32px] border border-white/10 p-8 flex items-center justify-center min-h-[300px] overflow-auto">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[400px] border border-white/20 rounded-lg"
          />
        </div>
      </div>

      {/* 書脊規格資訊 */}
      {spineData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
              頁數
            </p>
            <p className="text-2xl font-black text-white">{spineData.pageCount}</p>
            <p className="text-[9px] text-gray-500 mt-1">pages</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
              書脊厚度
            </p>
            <p className="text-2xl font-black text-white">{spineData.thickness.toFixed(2)}</p>
            <p className="text-[9px] text-gray-500 mt-1">mm</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
              書脊寬度 (像素)
            </p>
            <p className="text-2xl font-black text-white">{spineData.width}</p>
            <p className="text-[9px] text-gray-500 mt-1">px @ 300 DPI</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
              書脊高度 (像素)
            </p>
            <p className="text-2xl font-black text-white">{spineData.height}</p>
            <p className="text-[9px] text-gray-500 mt-1">px @ 300 DPI</p>
          </div>
        </div>
      )}

      {/* 下載書脊 */}
      {spineData && (
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = spineData.imageUrl;
            link.download = `${project.name}_spine.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="w-full py-4 px-6 bg-blue-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all hover:brightness-110"
        >
          下載書脊圖片
        </button>
      )}

      {/* 說明文字 */}
      <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20">
        <p className="text-[10px] text-blue-400 font-medium leading-relaxed uppercase tracking-widest">
          📐 書脊厚度根據總字數自動計算。標準計算：每 250 字為一頁，每頁紙張厚度 0.1mm。
          書脊將與封面/封底資產完美拼接，形成完整的印刷版面。
        </p>
      </div>
    </div>
  );
};

export default SpineGenerator;
