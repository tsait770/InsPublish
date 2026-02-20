
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SecuritySettings } from '../types';

interface SecuritySettingsPageProps {
  settings: SecuritySettings;
  onUpdate: (settings: SecuritySettings) => void;
  onClose: () => void;
}

const SecuritySettingsPage: React.FC<SecuritySettingsPageProps> = ({ settings, onUpdate, onClose }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const retentionOptions: (number | 'NEVER')[] = [30, 60, 90, 120, 180, 240, 360, 'NEVER'];

  return createPortal(
    <div className="fixed inset-0 z-[6500] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden font-sans">
      
      {/* 頂部導航列 - 玻璃擬態感 */}
      <header className="h-20 sm:h-24 px-6 sm:px-12 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-3xl shrink-0 z-50">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button 
            onClick={onClose} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 active:scale-90 active:bg-white/10 transition-all border border-white/5"
          >
            <i className="fa-solid fa-chevron-left text-base sm:text-lg"></i>
          </button>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tighter">安全與備份</h2>
            <p className="text-[7px] sm:text-[9px] text-[#8E8E93] font-black uppercase tracking-[0.25em] mt-0.5 sm:mt-1">SECURITY & PROTECTION</p>
          </div>
        </div>
        <div className="hidden xs:block">
           <span className="text-[9px] font-black bg-blue-600/10 text-blue-500 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-500/20">
             Local Encrypted
           </span>
        </div>
      </header>

      {/* 滾動內容區 - 解決重疊問題的核心 */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-12 pb-48">
        <div className="max-w-2xl mx-auto space-y-10 sm:space-y-16">
          
          {/* 系統保護機制說明卡片 */}
          <section className="bg-gradient-to-br from-[#1C1C1E] to-[#0A0A0C] rounded-[44px] p-8 sm:p-12 border border-white/5 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="flex items-center space-x-5 mb-2 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D4FF5F]/10 flex items-center justify-center text-[#D4FF5F] shadow-inner border border-[#D4FF5F]/20">
                <i className="fa-solid fa-shield-halved text-xl sm:text-2xl"></i>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight">系統保護機制</h4>
                <p className="text-[8px] sm:text-[9px] text-[#D4FF5F] font-black uppercase tracking-[0.2em]">PROTECTION PROTOCOL</p>
              </div>
            </div>
            <p className="text-[13px] sm:text-[14px] text-slate-400 leading-relaxed font-medium relative z-10">
              自動快照能確保您的文字在意外中獲得救贖。快照保留期限設定後，系統將根據您的選擇自動清理過期快照以節省空間，但<span className="text-[#D4FF5F] font-black">「里程碑」版本將永遠保留</span>。
            </p>
          </section>

          {/* 自動快照主開關 */}
          <section className="bg-[#0F0F11] rounded-[44px] p-8 sm:p-10 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5 sm:space-x-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[28px] bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-inner border border-blue-500/10">
                  <i className="fa-solid fa-rotate-left text-xl sm:text-2xl"></i>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">自動快照保護</h4>
                  <p className="text-[9px] sm:text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mt-1">AUTO SNAPSHOT MASTER</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdate({ ...settings, autoSnapshotEnabled: !settings.autoSnapshotEnabled })}
                className={`w-16 sm:w-20 h-8 sm:h-10 rounded-full flex items-center px-1.5 transition-all duration-500 ${settings.autoSnapshotEnabled ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
              >
                <div className={`w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full shadow-lg transition-transform duration-500 cubic-bezier(0.19,1,0.22,1) ${settings.autoSnapshotEnabled ? 'translate-x-8 sm:translate-x-10' : 'translate-x-0'}`} />
              </button>
            </div>
          </section>

          {settings.autoSnapshotEnabled && (
            <div className="space-y-12 sm:space-y-16 animate-in fade-in slide-in-from-top-4 duration-700">
              
              {/* 自動快照清除期限 */}
              <section className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center">
                    <i className="fa-solid fa-trash-can mr-3 text-red-500/40 text-xs"></i>
                    自動快照清除期限 CLEANUP PERIOD
                  </h3>
                </div>
                <div className="bg-[#0F0F11] rounded-[44px] p-8 sm:p-10 border border-white/5">
                   <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {retentionOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => onUpdate({ ...settings, autoSnapshotCleanupDays: option })}
                          className={`py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            settings.autoSnapshotCleanupDays === option 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40 scale-[1.05] z-10' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                          }`}
                        >
                          {option === 'NEVER' ? '永不' : `${option}D`}
                        </button>
                      ))}
                   </div>
                   <div className="mt-8 p-5 sm:p-8 bg-amber-500/5 rounded-[32px] border border-amber-500/10">
                      <p className="text-[11px] sm:text-[12px] text-amber-500/80 leading-relaxed font-bold">
                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                        僅自動快照受清理期限影響，里程碑版本將獲得終身永久保留保障，不受此限制。
                      </p>
                   </div>
                </div>
              </section>

              {/* 觸發與參數設定 */}
              <section className="space-y-6">
                <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center">
                  <i className="fa-solid fa-sliders mr-3 text-blue-500/40 text-xs"></i>
                  觸發設定 TRIGGERING
                </h3>
                <div className="bg-[#0F0F11] rounded-[44px] p-8 sm:p-10 space-y-10 sm:space-y-14 border border-white/5">
                  <div className="flex bg-black/40 rounded-[2rem] p-1.5 h-16 border border-white/5 relative">
                    <button 
                      onClick={() => onUpdate({ ...settings, autoSnapshotMode: 'interval' })}
                      className={`flex-1 rounded-[1.6rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 z-10 ${settings.autoSnapshotMode === 'interval' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      固定時間制
                    </button>
                    <button 
                      onClick={() => onUpdate({ ...settings, autoSnapshotMode: 'idle' })}
                      className={`flex-1 rounded-[1.6rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 z-10 ${settings.autoSnapshotMode === 'idle' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      動作停止制
                    </button>
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] bg-blue-600 rounded-[1.6rem] transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) shadow-xl ${settings.autoSnapshotMode === 'idle' ? 'translate-x-full' : 'translate-x-0'}`} />
                  </div>

                  <div className="space-y-10">
                    <div className="flex justify-between items-end px-1">
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          時間間隔
                        </p>
                        <p className="text-[7px] sm:text-[8px] text-gray-600 font-black uppercase tracking-widest mt-0.5">ADJUSTMENT RANGE</p>
                      </div>
                      <span className="text-2xl sm:text-4xl font-black text-blue-400 tracking-tighter">
                        {settings.autoSnapshotMode === 'interval' ? `${settings.autoSnapshotIntervalMinutes} MIN` : `${settings.autoSnapshotIdleSeconds} SEC`}
                      </span>
                    </div>
                    
                    <div className="relative px-1 group">
                      <input 
                        type="range" 
                        min={settings.autoSnapshotMode === 'interval' ? 1 : 10} 
                        max={settings.autoSnapshotMode === 'interval' ? 15 : 120} 
                        step={settings.autoSnapshotMode === 'interval' ? 1 : 5}
                        value={settings.autoSnapshotMode === 'interval' ? settings.autoSnapshotIntervalMinutes : settings.autoSnapshotIdleSeconds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (settings.autoSnapshotMode === 'interval') {
                            onUpdate({ ...settings, autoSnapshotIntervalMinutes: val });
                          } else {
                            onUpdate({ ...settings, autoSnapshotIdleSeconds: val });
                          }
                        }}
                        className="w-full h-3 bg-black rounded-full appearance-none cursor-pointer accent-blue-600 transition-all hover:scale-y-125 origin-center"
                        style={{ 
                          background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                            settings.autoSnapshotMode === 'interval' 
                            ? ((settings.autoSnapshotIntervalMinutes - 1) / 14) * 100 
                            : ((settings.autoSnapshotIdleSeconds - 10) / 110) * 100
                          }%, #1a1a1a ${
                            settings.autoSnapshotMode === 'interval' 
                            ? ((settings.autoSnapshotIntervalMinutes - 1) / 14) * 100 
                            : ((settings.autoSnapshotIdleSeconds - 10) / 110) * 100
                          }%, #1a1a1a 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 數據救贖保障說明 */}
          <section className="bg-gradient-to-tr from-[#121214] to-[#0A0A0C] p-8 sm:p-12 rounded-[44px] border border-blue-600/10 flex flex-col items-center space-y-10 shadow-2xl relative overflow-hidden">
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px]" />
             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-600/20 shadow-inner group">
               <i className="fa-solid fa-microchip text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-500"></i>
             </div>
             <div className="space-y-4 text-center max-w-md">
                <h4 className="text-[15px] sm:text-[18px] font-black text-white uppercase tracking-[0.3em]">SAFEWRITE 數據救贖保障</h4>
                <p className="text-[13px] sm:text-[14px] text-gray-500 leading-relaxed font-medium">
                  採用「本地先行」與「即時快照」技術。即使發生斷電或程式閃退，系統仍能精準救贖每一道創作思緒。
                </p>
             </div>
          </section>

          {/* 墊高底部，確保滾動到底時內容不被按鈕遮擋 */}
          <div className="h-20" />
        </div>
      </main>

      {/* 底部按鈕區 - 使用 Flex 佈局防止重疊 */}
      <footer className="shrink-0 p-8 sm:p-12 bg-gradient-to-t from-black via-black/95 to-transparent z-[60] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
         <div className="max-w-2xl mx-auto">
            <button 
              onClick={onClose}
              className="w-full h-20 sm:h-24 bg-white text-black font-black text-[13px] sm:text-[15px] uppercase rounded-full shadow-[0_30px_60px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center tracking-[0.5em]"
            >
               確 認 儲 存 設 定
            </button>
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #ffffff;
          border: 4px solid #2563eb;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
          transition: all 0.2s;
        }
        input[type='range']:active::-webkit-slider-thumb {
          transform: scale(1.2);
          box-shadow: 0 0 25px rgba(37, 99, 235, 0.6);
        }
      `}} />
    </div>,
    document.body
  );
};

export default SecuritySettingsPage;
