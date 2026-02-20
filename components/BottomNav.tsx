
import React from 'react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isVisible: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, isVisible }) => {
  const tabs = [
    { id: AppTab.LIBRARY, label: '書架', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    )},
    { id: AppTab.WRITE, label: '寫作', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    )},
    { id: AppTab.PROFILE, label: '個人', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
  ];

  return (
    <nav className={`fixed bottom-0 w-full z-[110] h-28 bg-black/95 backdrop-blur-3xl border-t border-white/5 flex justify-around items-center px-6 transition-transform duration-500 pb-8 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center justify-center space-y-1.5 w-20 transition-all ${activeTab === tab.id ? 'text-[#7b61ff] scale-110' : 'text-[#8e8e93]'}`}
        >
          <div className={`transition-all duration-300 ${activeTab === tab.id ? 'drop-shadow-[0_0_12px_rgba(123,97,255,0.5)]' : ''}`}>{tab.icon}</div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
          {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-[#7b61ff] mt-0.5 shadow-[0_0_8px_#7b61ff]"></div>}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
