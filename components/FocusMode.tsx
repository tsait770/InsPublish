import React, { useState, useEffect } from 'react';

const FocusMode: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25:00
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[800] bg-[#0A0A0B] flex flex-col items-center p-8 animate-in zoom-in duration-500">
      <header className="w-full flex justify-between items-center mb-16">
        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full"><svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
        <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em]">Focus Mode</h2>
        <div className="w-10" />
      </header>

      {/* Timer Circle - Image 8 */}
      <div className="relative w-72 h-72 flex items-center justify-center mb-16">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="144" cy="144" r="135" className="stroke-white/5 fill-none" strokeWidth="6" />
          <circle cx="144" cy="144" r="135" className="stroke-[#7b61ff] fill-none transition-all duration-1000" strokeWidth="6" strokeDasharray="848" strokeDashoffset={848 * (1 - timeLeft / 1500)} strokeLinecap="round" />
        </svg>
        <div className="text-center">
          <span className="text-6xl font-bold text-white tracking-tighter">{formatTime(timeLeft)}</span>
          <p className="text-[10px] font-black text-[#7b61ff] uppercase tracking-[0.2em] mt-4">MINUTES REMAINING</p>
        </div>
      </div>

      <div className="flex space-x-6 mb-16">
        <div className="text-center"><p className="text-2xl font-bold text-white">00</p><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2">Hours</p></div>
        <div className="text-center"><p className="text-2xl font-bold text-white">25</p><p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">Minutes</p></div>
        <div className="text-center"><p className="text-2xl font-bold text-white">00</p><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2">Seconds</p></div>
      </div>

      {/* Ambient Sounds */}
      <div className="w-full max-w-sm space-y-10">
        <div>
          <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6">Ambient Sounds</h3>
          <div className="flex space-x-3">
             <button className="flex-1 py-3 px-4 rounded-xl bg-[#7b61ff] text-white flex items-center justify-center space-x-2 text-[11px] font-black uppercase tracking-widest"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16h16l-3.5-3.5-3 3-2-2L4 20v-4z"/></svg><span>Rain</span></button>
             <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-gray-400 border border-white/5 flex items-center justify-center space-x-2 text-[11px] font-black uppercase tracking-widest"><span>Forest</span></button>
             <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-gray-400 border border-white/5 flex items-center justify-center space-x-2 text-[11px] font-black uppercase tracking-widest"><span>White Noise</span></button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5">
             <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622"/></svg></div>
                <div><p className="text-sm font-bold text-white leading-none">Notification Shield</p><p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Silence all distractions</p></div>
             </div>
             <div className="w-12 h-6 bg-[#7b61ff] rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform" /></div>
          </div>
        </div>

        <button onClick={() => setIsActive(!isActive)} className="w-full py-6 rounded-[2.5rem] bg-[#7b61ff] text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center space-x-4 shadow-[0_20px_40px_rgba(123,97,255,0.3)]">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
           <span>{isActive ? 'Pause Focus Session' : 'Start Focus Session'}</span>
        </button>
      </div>
    </div>
  );
};

export default FocusMode;