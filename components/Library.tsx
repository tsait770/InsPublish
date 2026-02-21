import React, { useState, useEffect } from 'react';
import { Project, WritingType, StructureUnit, StructureType } from '../types';
import { PROJECT_COLORS, PROJECT_ICONS, TEMPLATES, TEMPLATE_STRUCTURE_MAP, STRUCTURE_DEFINITIONS } from '../constants';

interface LibraryProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onCreateProject: (data: Project) => void;
  onUpdateProjects: (projects: Project[]) => void;
}

const Library: React.FC<LibraryProps> = ({ projects, onSelectProject, onCreateProject, onUpdateProjects }) => {
  const [weather] = useState({ temp: '15', city: '新北市', date: 'January 20' });
  const [isCreating, setIsCreating] = useState(false);
  const [isTemplatesExpanded, setIsTemplatesExpanded] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // 核心品牌色系（預設循環使用）
  const coreBrandColors = ['#FADE4B', '#FF6B2C', '#D4FF5F', '#B2A4FF'];

  const [formData, setFormData] = useState({
    name: '',
    type: WritingType.NOVEL,
    targetWordCount: 5000,
    color: PROJECT_COLORS[3], 
    icon: PROJECT_ICONS[0]
  });

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const resetForm = () => {
    setFormData({ name: '', type: WritingType.NOVEL, targetWordCount: 5000, color: PROJECT_COLORS[3], icon: PROJECT_ICONS[0] });
    setIsCreating(false);
    setIsTemplatesExpanded(false);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) return;

    const structType = TEMPLATE_STRUCTURE_MAP[formData.type] || StructureType.FREE;
    const def = STRUCTURE_DEFINITIONS[structType];
    
    const initialUnits: StructureUnit[] = [];
    if (structType !== StructureType.FREE) {
        initialUnits.push({
            id: `u-${Date.now()}-0`,
            title: def.autoNumbering ? def.defaultNamingRule(1) : (structType === StructureType.BLOCK ? '未命名區塊' : '第一部分'),
            content: '',
            order: 1,
            wordCount: 0,
            lastEdited: Date.now(),
            createdAt: Date.now()
        });
    }

    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: formData.name,
      writingType: formData.type,
      structureType: structType,
      targetWordCount: formData.targetWordCount,
      metadata: '剛剛建立',
      progress: 0,
      color: formData.color,
      icon: formData.icon,
      chapters: initialUnits,
      modules: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      settings: { typography: 'serif', fontSize: 'normal' },
      isPinned: false
    };

    onCreateProject(newProject);
    resetForm();
    onSelectProject(newProject);
  };

  const handleTogglePin = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const updatedProjects = projects.map(p => 
      p.id === project.id ? { ...p, isPinned: !p.isPinned } : p
    );
    onUpdateProjects(updatedProjects);
    setActiveMenuId(null);
  };

  const handleStartInlineEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setTempName(project.name);
    setActiveMenuId(null);
  };

  const handleSaveInlineEdit = (projId: string) => {
    const trimmed = tempName.trim();
    if (trimmed) {
      const updatedProjects = projects.map(p => 
        p.id === projId ? { ...p, name: trimmed, updatedAt: Date.now() } : p
      );
      onUpdateProjects(updatedProjects);
    }
    setEditingProjectId(null);
  };

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (window.confirm(`確定要刪除專案「${project.name}」嗎？此動作無法復原。`)) {
      const updatedProjects = projects.filter(p => p.id !== project.id);
      onUpdateProjects(updatedProjects);
    }
    setActiveMenuId(null);
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isPinned === b.isPinned) return b.updatedAt - a.updatedAt;
    return a.isPinned ? -1 : 1;
  });

  const mainParadigms = [WritingType.NOVEL, WritingType.DIARY, WritingType.BLOG, WritingType.CUSTOM];
  const scrollParadigms = (Object.keys(TEMPLATES) as WritingType[]).filter(t => !mainParadigms.includes(t));

  return (
    <div className="px-4 sm:px-8 space-y-8 sm:space-y-12 pb-48 max-w-7xl mx-auto">
      {/* 天氣看板區塊 */}
      <section>
        <div className="weather-card animate-in fade-in zoom-in duration-700">
          <div className="weather-container">
            <div className="cloud front"><span className="left-front"></span><span className="right-front"></span></div>
            <span className="sun sunshine"></span><span className="sun"></span>
            <div className="cloud back"><span className="left-back"></span><span className="right-back"></span></div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-base text-[rgba(87,77,51,0.6)] uppercase tracking-tight">{weather.city}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-sm text-[rgba(87,77,51,0.4)]">{weather.date}</span>
            </div>
          </div>
          <span className="temp">{weather.temp}°</span>
          <div className="temp-scale"><span>攝氏 Celsius</span></div>
        </div>
      </section>

      {/* 書架主體區塊 */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col">
             <h2 className="text-[12px] font-black text-[#8e8e93] uppercase tracking-[0.3em]">智慧寫作書架 REPOSITORY</h2>
             <p className="text-[10px] text-[#4E4E52] font-black uppercase tracking-widest mt-1">共有 {projects.length} 個專案已歸檔</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-14 h-14 rounded-full bg-[#2563eb] flex items-center justify-center shadow-[0_15px_30px_rgba(37,99,235,0.4)] active:scale-90 hover:scale-105 transition-all"
          >
            <i className="fa-solid fa-plus text-white text-xl"></i>
          </button>
        </div>
        
        {/* 堆疊式卡片容器 */}
        <div className="stack-container relative">
          {sortedProjects.map((proj, idx) => {
            const displayColor = proj.color || coreBrandColors[idx % coreBrandColors.length];
            return (
              <div 
                key={proj.id} 
                className="stack-card animate-in fade-in slide-in-from-bottom-12 duration-700"
                style={{ 
                  zIndex: sortedProjects.length - idx,
                  backgroundColor: displayColor,
                  color: '#121212',
                  animationDelay: `${idx * 150}ms`
                }}
                onClick={() => onSelectProject(proj)}
              >
                <div className="flex flex-col h-full relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="max-w-[85%]">
                      <div className="flex flex-col space-y-1">
                        {editingProjectId === proj.id ? (
                          <input
                            autoFocus
                            value={tempName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={() => handleSaveInlineEdit(proj.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineEdit(proj.id);
                              if (e.key === 'Escape') setEditingProjectId(null);
                            }}
                            className="bg-black/10 border-b-2 border-current outline-none text-[28px] sm:text-[34px] font-black tracking-tighter leading-none w-full px-2 py-1 rounded-sm mb-4"
                          />
                        ) : (
                          <h3 
                            onClick={(e) => handleStartInlineEdit(e, proj)}
                            className="text-[32px] sm:text-[38px] font-black tracking-tighter leading-[1.1] line-clamp-2 cursor-text"
                          >
                            {proj.name}
                          </h3>
                        )}
                        
                        <div className="flex items-center space-x-2.5 opacity-40">
                           {proj.isPinned && <i className="fa-solid fa-thumbtack text-[11px]"></i>}
                           <span className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center">
                             {proj.tags && proj.tags.length > 0 ? proj.tags.join(' • ') : TEMPLATES[proj.writingType]?.label}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 卡片選單 */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                        }}
                        className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                      >
                        <i className="fa-solid fa-ellipsis-vertical text-xl opacity-40"></i>
                      </button>

                      {activeMenuId === proj.id && (
                        <div className="absolute right-0 top-14 w-52 bg-[#1C1C1E] border border-white/10 rounded-[28px] shadow-3xl z-[200] p-1.5 animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => handleTogglePin(e, proj)} className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-white/5 text-left transition-colors">
                            <i className={`fa-solid ${proj.isPinned ? 'fa-thumbtack text-[#D4FF5F]' : 'fa-thumbtack text-gray-400'}`}></i>
                            <span className="text-[12px] font-black text-white uppercase tracking-widest">{proj.isPinned ? '取消置頂' : '置頂專案'}</span>
                          </button>
                          <button onClick={(e) => handleStartInlineEdit(e, proj)} className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-white/5 text-left transition-colors">
                            <i className="fa-solid fa-pen-to-square text-blue-500 text-lg"></i>
                            <span className="text-[13px] font-bold text-white tracking-tight">編輯名稱</span>
                          </button>
                          <div className="h-px bg-white/5 my-1.5 mx-2"></div>
                          <button onClick={(e) => handleDelete(e, proj)} className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-red-500/10 text-left transition-colors">
                            <i className="fa-solid fa-trash-can text-red-500"></i>
                            <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">刪除專案</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pb-6">
                    {/* 資訊標籤欄：包含時間戳與百分比數值 */}
                    <div className="flex justify-between items-end mb-4">
                      {/* 左側：最後編輯時間 (Metadata) */}
                      <div className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center">
                        <i className="fa-regular fa-clock mr-2.5"></i>
                        {proj.metadata || 'JUST NOW'}
                      </div>
                      
                      {/* 右側：進度百分比數字 */}
                      <div className="text-[12px] font-black tracking-tight opacity-50">
                        {proj.progress}%
                      </div>
                    </div>

                    {/* 進度條本體 */}
                    <div className="progress-bar-container bg-black/5">
                      {/* 動態填充層：寬度由 proj.progress 決定 */}
                      <div 
                        className="progress-fill bg-black/25" 
                        style={{ width: `${proj.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 建立專案 Modal (Creation Protocol) */}
      {isCreating && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-[40px]" onClick={resetForm} />
           <div className="relative w-full max-w-full sm:max-w-2xl lg:max-w-3xl bg-[#0F0F10] rounded-t-[44px] sm:rounded-[44px] p-0 flex flex-col animate-in slide-in-from-bottom duration-700 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] border border-white/5 h-[94vh] sm:h-auto sm:max-h-[90vh]">
              <header className="px-8 sm:px-12 py-8 sm:py-10 border-b border-white/5 shrink-0 flex justify-between items-start bg-[#0F0F10] z-20">
                 <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">啟動寫作倉庫</h2>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">NEW SMART REPOSITORY PROTOCOL</p>
                 </div>
                 <button onClick={resetForm} className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90">
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar px-8 sm:px-12 pt-8 sm:pt-10 pb-64 space-y-12">
                 {/* 基本資訊 */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">資料夾名稱 FOLDER NAME</label>
                       <input autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：量子幽靈的小說..." className="w-full bg-[#1C1C1E] h-16 sm:h-20 px-8 rounded-[2rem] text-lg font-black text-white outline-none border border-white/5 focus:border-[#7b61ff] transition-all" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">目標字數 TARGET WORDS</label>
                       <div className="grid grid-cols-4 gap-2">
                          {[3000, 5000, 10000, 50000].map(count => (
                             <button key={count} onClick={() => setFormData({...formData, targetWordCount: count})} className={`h-10 rounded-xl text-[10px] font-black transition-all ${formData.targetWordCount === count ? 'bg-[#7b61ff] text-white' : 'bg-[#1C1C1E] text-gray-500 border border-white/5'}`}>{count >= 1000 ? `${count/1000}K` : count}</button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 寫作範式 */}
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">寫作範式 CORE PARADIGMS</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {mainParadigms.map((type) => {
                          const t = TEMPLATES[type];
                          const active = formData.type === type;
                          return (
                            <button key={type} onClick={() => setFormData({...formData, type})} className={`flex flex-col items-start p-6 rounded-[2.5rem] border transition-all min-h-[180px] text-left relative group ${active ? 'bg-[#7b61ff] border-[#7b61ff] text-white shadow-lg scale-[1.02]' : 'bg-[#1C1C1E] border-white/5 text-gray-400'}`}>
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${active ? 'bg-white/20' : 'bg-white/5'}`}><i className={`fa-solid ${t.icon} text-xl`} style={{ color: active ? 'white' : '#7b61ff' }}></i></div>
                               <span className={`text-sm font-black uppercase tracking-widest mb-2 ${active ? 'text-white' : 'text-slate-200'}`}>{t.label}</span>
                               <p className={`text-[10px] font-medium line-clamp-2 ${active ? 'text-white/80' : 'text-gray-500'}`}>{t.description}</p>
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 {/* 視覺編碼 (顏色選擇) */}
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">視覺編碼 VISUAL CODING</label>
                    <div className="grid grid-cols-5 sm:grid-cols-11 gap-x-3 gap-y-6 justify-items-center">
                       {PROJECT_COLORS.map(c => (
                          <button 
                            key={c} 
                            onClick={() => setFormData({...formData, color: c})} 
                            className={`w-10 h-10 rounded-full transition-all relative ${
                              formData.color === c 
                                ? 'ring-[3px] ring-white ring-offset-[2px] ring-offset-black scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                                : 'opacity-60 hover:opacity-100'
                            }`} 
                            style={{ backgroundColor: c }} 
                          />
                       ))}
                    </div>
                 </div>
              </div>

              {/* 底部按鈕 */}
              <div className="absolute bottom-0 inset-x-0 p-8 sm:p-12 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10] to-transparent z-30">
                 <button onClick={handleCreate} disabled={!formData.name.trim()} className={`w-full h-16 sm:h-24 rounded-[2rem] sm:rounded-[3rem] text-white font-black text-[12px] sm:text-[15px] uppercase tracking-[0.4em] shadow-2xl transition-all ${!formData.name.trim() ? 'bg-gray-800 opacity-40' : 'bg-blue-600 shadow-[0_25px_60px_rgba(37,99,235,0.4)]'}`}>啟 動 寫 作 存 檔 PROTOCOL</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Library;
