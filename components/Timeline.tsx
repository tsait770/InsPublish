
import React, { useState } from 'react';
import { VersionSnapshot, MembershipLevel, SnapshotType, SecuritySettings } from '../types';

interface TimelineProps {
  history: VersionSnapshot[];
  membership: MembershipLevel;
  isNight: boolean;
  onRestore: (snapshot: VersionSnapshot) => void;
  onPreview: (snapshot: VersionSnapshot) => void;
  onCreateMilestone: () => void;
  onClearSnapshots: () => void;
  onClose: () => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (settings: SecuritySettings) => void;
}

const Timeline: React.FC<TimelineProps> = ({ 
  history, 
  onCreateMilestone, 
  onRestore, 
  onPreview, 
  onClearSnapshots,
  onClose,
  securitySettings
}) => {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleRestoreClick = (snapshot: VersionSnapshot) => {
    setRestoringId(snapshot.id);
    onRestore(snapshot);
    setTimeout(() => setRestoringId(null), 800);
  };

  const handleClearClick = () => {
    if (window.confirm('確定要清除所有自動快照嗎？這將只保留「里程碑」版本。')) {
      setIsClearing(true);
      setTimeout(() => {
        onClearSnapshots();
        setIsClearing(false);
      }, 800);
    }
  };

  const cleanupText = securitySettings.autoSnapshotCleanupDays === 'NEVER' 
    ? '自動生成的快照將永久保留。' 
    : `自動生成的快照將在 ${securitySettings.autoSnapshotCleanupDays} 天後進入循環清理程序。`;

  return (
    <div className="relative w-full h-full bg-[#0F0F10] shadow-2xl flex flex-col overflow-hidden text-slate-200">
      {/* Header Handle */}
      <div className="flex justify-center py-4 bg-[#0F0F10] shrink-0">
        <div className="w-10 h-1 bg-white/10 rounded-full" />
      </div>

      {/* Main Header */}
      <div className="px-8 pb-6 border-b border-white/5 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">時光機</h2>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] mt-0.5">TIME MACHINE MANAGEMENT</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 active:bg-white/10 transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      {/* Security Status Row */}
      <div className="px-8 py-5 border-b border-white/5 bg-black/10 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <i className="fa-solid fa-shield-halved text-xs"></i>
          </div>
          <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">
            {securitySettings.autoSnapshotEnabled ? '自動快照已啟動' : '自動快照已停用'}
          </span>
        </div>
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
          {securitySettings.autoSnapshotMode === 'interval' ? '時間制' : '動作停止制'}
        </span>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar relative">
        {/* Live Status Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">LIVE EDITION ACTIVE</span>
          </div>
          <button
            onClick={onCreateMilestone}
            className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg"
          >
            標記里程碑
          </button>
        </div>

        {/* Vertical Axis Line */}
        <div className="absolute left-[43px] top-28 bottom-10 w-px bg-white/5" />

        <div className="space-y-12 relative">
          {history.length === 0 ? (
            <div className="pl-12 pt-4">
              <p className="text-[11px] text-slate-600 leading-relaxed uppercase tracking-widest italic">
                系統正在監控變動...<br/>
                {securitySettings.autoSnapshotEnabled 
                  ? (securitySettings.autoSnapshotMode === 'interval' 
                    ? `每隔 ${securitySettings.autoSnapshotIntervalMinutes} 分鐘將自動備份。` 
                    : `停止輸入 ${securitySettings.autoSnapshotIdleSeconds} 秒後將自動備份。`)
                  : '自動快照功能目前關閉中。'
                }
              </p>
            </div>
          ) : (
            history.map((snapshot) => (
              <div key={snapshot.id} className={`flex group transition-all duration-300 ${restoringId === snapshot.id ? 'opacity-40 translate-x-2' : ''}`}>
                {/* Timeline Dot */}
                <div className="relative w-3 h-3 mt-1.5 shrink-0 z-10 mr-8 transition-transform group-hover:scale-125">
                   <div className={`w-full h-full rounded-full ring-[6px] ring-[#0F0F10] ${snapshot.type === SnapshotType.MILESTONE ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-slate-700'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                      {new Date(snapshot.timestamp).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {snapshot.type === SnapshotType.MILESTONE && (
                      <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-0.5 rounded tracking-[0.2em]">
                        MILESTONE
                      </span>
                    )}
                  </div>
                  
                  <p 
                    className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4 cursor-pointer hover:text-white transition-colors font-serif-editor" 
                    onClick={() => onPreview(snapshot)}
                  >
                    {snapshot.content.trim() || '空版本記錄'}
                  </p>

                  <div className="flex items-center space-x-6 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleRestoreClick(snapshot)} 
                      disabled={restoringId !== null}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 hover:text-blue-400 flex items-center space-x-2"
                    >
                      {restoringId === snapshot.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span>正在還原</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-rotate-left"></i>
                          <span>RESTORE</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => onPreview(snapshot)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-300">
                      PREVIEW
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <footer className="p-8 bg-black/40 border-t border-white/5 space-y-8 shrink-0">
        <div className="flex items-start space-x-4">
          <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
            <i className="fa-solid fa-circle-info text-[10px]"></i>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-medium">
            提示：里程碑版本將永久保留。{cleanupText}
          </p>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <button className="text-[11px] font-black text-blue-600 hover:text-blue-500 uppercase tracking-[0.4em] transition-colors">
            STORAGE MGMT
          </button>
          <button 
            onClick={handleClearClick}
            disabled={isClearing}
            className="text-[11px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-[0.4em] transition-all flex items-center space-x-3"
          >
            {isClearing ? (
              <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <i className="fa-regular fa-trash-can text-sm"></i>
            )}
            <span>CLEAR AUTO</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Timeline;
