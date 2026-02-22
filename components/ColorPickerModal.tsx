import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ColorPickerModalProps {
  initialColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

type TabType = 'GRID' | 'SPECTRUM' | 'SLIDERS';

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ initialColor, onSelectColor, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('GRID');
  const [currentColor, setCurrentColor] = useState(initialColor);
  
  // Parse initial color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  };

  const [rgb, setRgb] = useState(hexToRgb(initialColor));
  const [hexInput, setHexInput] = useState(initialColor.replace('#', ''));

  useEffect(() => {
    const newRgb = hexToRgb(currentColor);
    setRgb(newRgb);
    setHexInput(currentColor.replace('#', ''));
  }, [currentColor]);

  const handleRgbChange = (color: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [color]: value };
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setCurrentColor(newHex);
    onSelectColor(newHex);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      const newHex = `#${val}`;
      setCurrentColor(newHex);
      onSelectColor(newHex);
    }
  };

  // Grid colors (simplified version of the reference image)
  const gridColors = [
    ['#FFFFFF', '#EBEBEB', '#D6D6D6', '#C2C2C2', '#ADADAD', '#999999', '#858585', '#707070', '#5C5C5C', '#474747', '#333333', '#000000'],
    ['#00334D', '#002966', '#1A0066', '#33004D', '#4D001A', '#661A00', '#663300', '#664D00', '#4D6600', '#1A6600', '#004D1A', '#00331A'],
    ['#004D80', '#0033B3', '#3300B3', '#660080', '#80002A', '#B32A00', '#B35900', '#B38000', '#80B300', '#2AB300', '#00802A', '#004D2A'],
    ['#0066CC', '#0047FF', '#4700FF', '#9900CC', '#CC0047', '#FF4700', '#FF8000', '#FFB300', '#CCFF00', '#47FF00', '#00CC47', '#006647'],
    ['#0080FF', '#3366FF', '#6633FF', '#CC33FF', '#FF3366', '#FF6633', '#FF9933', '#FFCC33', '#FFFF33', '#66FF33', '#33FF66', '#33FF99'],
    ['#3399FF', '#6680FF', '#8066FF', '#D966FF', '#FF6680', '#FF8066', '#FFB366', '#FFD966', '#FFFF66', '#80FF66', '#66FF80', '#66FFB3'],
    ['#66B3FF', '#99B3FF', '#B399FF', '#E699FF', '#FF99B3', '#FFB399', '#FFCC99', '#FFE699', '#FFFF99', '#B3FF99', '#99FFB3', '#99FFCC'],
    ['#99CCFF', '#CCD9FF', '#D9CCFF', '#F2CCFF', '#FFCCD9', '#FFD9CC', '#FFE6CC', '#FFF2CC', '#FFFFCC', '#CCFFD9', '#CCFFE6', '#CCFFFF'],
    ['#CCE6FF', '#E6ECFF', '#ECE6FF', '#F9E6FF', '#FFE6EC', '#FFECE6', '#FFF2E6', '#FFF9E6', '#FFFFE6', '#E6FFF2', '#E6FFF9', '#E6FFFF'],
    ['#E6F2FF', '#F2F2FF', '#F2F2FF', '#FCF2FF', '#FFF2F2', '#FFF2F2', '#FFF9F2', '#FFFCF2', '#FFFFF2', '#F2FFF9', '#F2FFFC', '#F2FFFF'],
  ];

  const spectrumRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [spectrumPos, setSpectrumPos] = useState({ x: 0.5, y: 0.5 });

  const updateSpectrumColor = (clientX: number, clientY: number) => {
    if (!spectrumRef.current) return;
    const rect = spectrumRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    setSpectrumPos({ x, y });

    // Simple hue/saturation mapping for spectrum
    const h = x * 360;
    const s = 100;
    const l = 100 - (y * 100);
    
    // Convert HSL to HEX
    const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
    const x_val = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l / 100 - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) { r = c; g = x_val; b = 0; }
    else if (60 <= h && h < 120) { r = x_val; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x_val; }
    else if (180 <= h && h < 240) { r = 0; g = x_val; b = c; }
    else if (240 <= h && h < 300) { r = x_val; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x_val; }
    
    const newHex = rgbToHex(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    );
    
    setCurrentColor(newHex);
    onSelectColor(newHex);
  };

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[360px] bg-[#F2F2F7] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <button className="w-8 h-8 flex items-center justify-center text-black">
            <i className="fa-solid fa-eye-dropper text-xl"></i>
          </button>
          <h3 className="text-[17px] font-bold text-black tracking-widest">顏色</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-black bg-black/5 rounded-full hover:bg-black/10 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 mb-6">
          <div className="flex bg-[#E3E3E8] p-1 rounded-full">
            <button 
              onClick={() => setActiveTab('GRID')}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'GRID' ? 'bg-white text-black shadow-sm' : 'text-black/60'}`}
            >
              格線
            </button>
            <button 
              onClick={() => setActiveTab('SPECTRUM')}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'SPECTRUM' ? 'bg-white text-black shadow-sm' : 'text-black/60'}`}
            >
              光譜
            </button>
            <button 
              onClick={() => setActiveTab('SLIDERS')}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'SLIDERS' ? 'bg-white text-black shadow-sm' : 'text-black/60'}`}
            >
              滑桿
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 h-[280px]">
          {activeTab === 'GRID' && (
            <div className="w-full h-full rounded-xl overflow-hidden flex flex-col">
              {gridColors.map((row, i) => (
                <div key={i} className="flex flex-1">
                  {row.map((color, j) => (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => {
                        setCurrentColor(color);
                        onSelectColor(color);
                      }}
                      className="flex-1 h-full border-[0.5px] border-black/5 hover:scale-110 hover:z-10 transition-transform relative"
                      style={{ backgroundColor: color }}
                    >
                      {currentColor.toUpperCase() === color.toUpperCase() && (
                        <div className="absolute inset-0 border-2 border-white mix-blend-difference pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'SPECTRUM' && (
            <div 
              ref={spectrumRef}
              onPointerDown={(e) => {
                setIsDragging(true);
                updateSpectrumColor(e.clientX, e.clientY);
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (isDragging) {
                  updateSpectrumColor(e.clientX, e.clientY);
                }
              }}
              onPointerUp={(e) => {
                setIsDragging(false);
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              }}
              className="w-full h-full rounded-xl cursor-crosshair relative touch-none"
              style={{
                background: `
                  linear-gradient(to bottom, white 0%, transparent 50%, black 100%),
                  linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)
                `
              }}
            >
              <div 
                className="absolute w-6 h-6 rounded-full border-2 border-white shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  backgroundColor: currentColor,
                  top: `${spectrumPos.y * 100}%`,
                  left: `${spectrumPos.x * 100}%`
                }}
              />
            </div>
          )}

          {activeTab === 'SLIDERS' && (
            <div className="w-full h-full flex flex-col justify-between pt-2">
              {/* Red Slider */}
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-black/70 w-8">紅色</span>
                <div className="flex-1 h-8 rounded-full relative overflow-hidden" style={{ background: `linear-gradient(to right, black, red)` }}>
                  <input 
                    type="range" min="0" max="255" value={rgb.r} 
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white bg-black pointer-events-none shadow-sm" style={{ left: `calc(${(rgb.r / 255) * 100}% - 12px)` }} />
                </div>
                <div className="w-16 h-8 bg-white rounded-lg flex items-center justify-center text-[15px] font-bold text-black shadow-sm">
                  {rgb.r}
                </div>
              </div>

              {/* Green Slider */}
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-black/70 w-8">綠色</span>
                <div className="flex-1 h-8 rounded-full relative overflow-hidden" style={{ background: `linear-gradient(to right, black, #00FF00)` }}>
                  <input 
                    type="range" min="0" max="255" value={rgb.g} 
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white bg-black pointer-events-none shadow-sm" style={{ left: `calc(${(rgb.g / 255) * 100}% - 12px)` }} />
                </div>
                <div className="w-16 h-8 bg-white rounded-lg flex items-center justify-center text-[15px] font-bold text-black shadow-sm">
                  {rgb.g}
                </div>
              </div>

              {/* Blue Slider */}
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-black/70 w-8">藍色</span>
                <div className="flex-1 h-8 rounded-full relative overflow-hidden" style={{ background: `linear-gradient(to right, black, blue)` }}>
                  <input 
                    type="range" min="0" max="255" value={rgb.b} 
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white bg-black pointer-events-none shadow-sm" style={{ left: `calc(${(rgb.b / 255) * 100}% - 12px)` }} />
                </div>
                <div className="w-16 h-8 bg-white rounded-lg flex items-center justify-center text-[15px] font-bold text-black shadow-sm">
                  {rgb.b}
                </div>
              </div>

              {/* HEX Input */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-[15px] font-bold text-blue-600">sRGB十六進位顏色 #</span>
                <div className="w-24 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm px-2">
                  <input 
                    type="text" 
                    value={hexInput} 
                    onChange={handleHexChange}
                    className="w-full text-center text-[15px] font-bold text-black outline-none uppercase"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-black/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl shadow-inner border border-black/10" style={{ backgroundColor: currentColor }} />
          <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black hover:bg-black/10 transition-colors">
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ColorPickerModal;
