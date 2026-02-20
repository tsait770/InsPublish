
import React from 'react';
import { Project, MembershipLevel } from '../types';

interface SidebarProps {
  project: Project | null;
  activeId: string | null;
  isNight: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ project, activeId, isNight, onSelect, onAdd }) => {
  return (
    <aside className={`w-64 border-r flex flex-col transition-colors ${isNight ? 'bg-[#1E293B] border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
      <div className="p-6 border-b border-gray-100/10">
        <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${isNight ? 'text-slate-500' : 'text-gray-400'}`}>稿件庫</h2>
        <div className="flex flex-col space-y-1.5">
          {project?.chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => onSelect(chapter.id)}
              className={`text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                activeId === chapter.id 
                  ? (isNight ? 'bg-blue-600/20 text-blue-400 font-bold' : 'bg-white shadow-sm text-blue-600 font-bold')
                  : (isNight ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <span className="text-[10px] opacity-40 font-mono">{chapter.order.toString().padStart(2, '0')}</span>
                <span className="truncate">{chapter.title}</span>
              </div>
            </button>
          ))}
          <button onClick={onAdd} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all font-bold group">
            <span className="group-hover:rotate-90 transition-transform"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg></span>
            <span>新增章節</span>
          </button>
        </div>
      </div>

      {/* 視覺化大綱區塊 */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-[10px] font-bold uppercase tracking-widest ${isNight ? 'text-slate-500' : 'text-gray-400'}`}>結構圖譜</h2>
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 512 512"><path d="M448 80V432C448 449.7 433.7 464 416 464H96C78.3 464 64 449.7 64 432V80C64 62.3 78.3 48 96 48H416C433.7 48 448 62.3 448 80zM368 144H144V176H368V144zM368 240H144V272H368V240zM256 336H144V368H256V336z"/></svg>
        </div>
        
        {project?.visualOutline && project.visualOutline.length > 0 ? (
          <div className="space-y-3">
            {project.visualOutline.map(node => (
              <div 
                key={node.id} 
                style={{ paddingLeft: `${node.level * 12}px` }}
                className={`text-[11px] border-l-2 py-1 pl-3 transition-colors ${isNight ? 'border-slate-700 text-slate-400 hover:border-blue-500' : 'border-gray-100 text-gray-500 hover:border-blue-500'}`}
              >
                {node.label}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl opacity-20">
            <p className="text-[10px]">使用 AI 提取大綱</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className={`p-4 rounded-2xl border transition-all hover:shadow-lg ${isNight ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Firebase 實時同步</p>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">接入中：雲端數據校驗與增量同步已啟動。</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
