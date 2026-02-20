
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';

interface StatusBarProps {
  stats: UserStats;
  isSyncing: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ stats, isSyncing }) => {
  const [syncPhase, setSyncPhase] = useState<'IDLE' | 'CHECKING' | 'SYNCING'>('IDLE');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (isSyncing) {
      setSyncPhase('CHECKING');
      const timer = setTimeout(() => setSyncPhase('SYNCING'), 400);
      return () => clearTimeout(timer);
    } else {
      setSyncPhase('IDLE');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSyncing]);

  return (
    <footer className="h-8 bg-[#0F0F10] border-t border-white/5 flex items-center justify-between px-6 z-50 backdrop-blur-md">
      {/* Left side: Stats & Connectivity */}
      <div className="flex items-center space-x-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
        <div className="flex items-center space-x-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
          <span className="text-slate-300">{stats.wordCount.toLocaleString()} WORDS</span>
        </div>
        
        {!isOnline && (
          <div className="flex items-center space-x-2.5 text-orange-500 animate-pulse">
            <i className="fa-solid fa-shield-halved"></i>
            <span>離線保護模式啟動</span>
          </div>
        )}
      </div>

      {/* Right side: Sync Engine Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest">
           {syncPhase === 'CHECKING' && (
             <div className="flex items-center space-x-2 text-orange-400">
               <i className="fa-solid fa-ellipsis animate-pulse"></i>
               <span>增量同步校驗中...</span>
             </div>
           )}
           {syncPhase === 'SYNCING' && (
             <div className="flex items-center space-x-2 text-blue-500">
               <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <span>雲端雙重備份中</span>
             </div>
           )}
           {syncPhase === 'IDLE' && isOnline && (
             <div className="flex items-center space-x-2 text-green-500/60">
               <i className="fa-solid fa-cloud-check text-[10px]"></i>
               <span className="text-[8px] opacity-80">數據同步已完成</span>
             </div>
           )}
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
