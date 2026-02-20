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

  // Core brand palette v1.1 for default cards
  const coreBrandColors = ['#FADE4B', '#FF6B2C', '#D4FF5F', '#B2A4FF'];

  const [formData, setFormData] = useState({
    name: '',
    type: WritingType.NOVEL,
    targetWordCount: 5000,
    color: PROJECT_COLORS[3], // Default to Lavender per screenshot
    icon: PROJECT_ICONS[0]
  });

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuId(null);
    };
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

  const mainParadigms = [
    WritingType.NOVEL,
    WritingType.DIARY,
    WritingType.BLOG,
    WritingType.CUSTOM
  ];

  const scrollParadigms = (Object.keys(TEMPLATES) as WritingType[]).filter(t => !mainParadigms.includes(t));

  return (
    <div className="px-4 sm:px-8 space-y-8 sm:space-y-12 pb-48 max-w-7xl mx-auto">
      {/* Weather Header Section */}
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

      {/* Main Repository Section */}
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
        
        {/* Balanced Vertical Arrangement Stack */}
        <div className="stack-container relative">
          {sortedProjects.map((proj, idx) => {
            // Priority: Use actual project color, else cycle through core palette
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
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                        }}
                        className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
                      >
                        <i className="fa-solid fa-ellipsis-vertical text-xl opacity-40"></i>
                      </button>

                      {activeMenuId === proj.id && (
                        <div 
                          className="absolute right-0 top-14 w-52 bg-[#1C1C1E] border border-white/10 rounded-[28px] shadow-3xl z-[200] p-1.5 animate-in fade-in zoom-in duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={(e) => handleTogglePin(e, proj)}
                            className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-white/5 text-left transition-colors"
                          >
                            <i className={`fa-solid ${proj.isPinned ? 'fa-thumbtack text-[#D4FF5F]' : 'fa-thumbtack text-gray-400'}`}></i>
                            <span className="text-[12px] font-black text-white uppercase tracking-widest">{proj.isPinned ? '取消置頂' : '置頂專案'}</span>
                          </button>
                          <button 
                            onClick={(e) => handleStartInlineEdit(e, proj)}
                            className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-white/5 text-left transition-colors"
                          >
                            <i className="fa-solid fa-pen-to-square text-blue-500 text-lg"></i>
                            <span className="text-[13px] font-bold text-white tracking-tight">編輯名稱</span>
                          </button>
                          <div className="h-px bg-white/5 my-1.5 mx-2"></div>
                          <button 
                            onClick={(e) => handleDelete(e, proj)}
                            className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-red-500/10 text-left transition-colors"
                          >
                            <i className="fa-solid fa-trash-can text-red-500"></i>
                            <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">刪除專案</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pb-6">
                    <div className="flex justify-between items-end mb-4">
                      <div className="text-[12px] font-black uppercase tracking-[0.15em] opacity-40 flex items-center">
                        {proj.metadata || 'JUST NOW'}
                      </div>
                      <div className="text-[13px] font-black tracking-tight opacity-50">
                        {proj.progress}%
                      </div>
                    </div>
                    <div className="progress-bar-container bg-black/10">
                      <div className="progress-fill bg-black/40" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern Creation Protocol UI - Optimized RWD for Mobile, Tablet, Web App */}
      {isCreating && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-in fade-in duration-500">
           {/* Deep dark blurry mask to fix "overlapping UI" complaint - Apple HIG style */}
           <div className="absolute inset-0 bg-black/95 backdrop-blur-[40px]" onClick={resetForm} />
           
           <div className="relative w-full max-w-full sm:max-w-3xl lg:max-w-6xl bg-[#0F0F10] rounded-t-[44px] sm:rounded-[44px] p-0 flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in duration-700 cubic-bezier(0.16, 1, 0.3, 1) overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] border border-white/5 h-[94vh] sm:h-auto sm:max-h-[90vh]">
              
              <header className="px-8 sm:px-12 py-8 sm:py-10 border-b border-white/5 shrink-0 flex justify-between items-start bg-[#0F0F10] z-20">
                 <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">啟動寫作倉庫</h2>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">NEW SMART REPOSITORY PROTOCOL</p>
                 </div>
                 <button onClick={resetForm} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90">
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar px-8 sm:px-12 pt-8 sm:pt-10 pb-64">
                 <div className="lg:flex lg:gap-20">
                    {/* Left Column: Basic Info */}
                    <div className="lg:w-2/5 space-y-12">
                       <div className="space-y-10">
                          <div className="space-y-4">
                             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">資料夾名稱 FOLDER NAME</label>
                             <input 
                               autoFocus
                               value={formData.name} 
                               onChange={e => setFormData({...formData, name: e.target.value})} 
                               placeholder="例如：量子幽靈的小說..." 
                               className="w-full bg-[#1C1C1E] h-16 sm:h-20 px-8 rounded-[2rem] sm:rounded-[2.5rem] text-lg sm:text-xl font-black text-white outline-none border border-white/5 focus:border-[#7b61ff] transition-all placeholder-white/5" 
                             />
                          </div>

                          <div className="space-y-4">
                             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">目標字數 TARGET WORDS</label>
                             <div className="grid grid-cols-4 gap-2">
                                {[3000, 5000, 10000, 50000].map(count => (
                                   <button 
                                      key={count} 
                                      onClick={() => setFormData({...formData, targetWordCount: count})}
                                      className={`h-10 sm:h-12 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black transition-all ${formData.targetWordCount === count ? 'bg-[#7b61ff] text-white shadow-lg' : 'bg-[#1C1C1E] text-gray-500 border border-white/5 hover:bg-white/5'}`}
                                   >
                                      {count >= 1000 ? `${count/1000}K` : count}
                                   </button>
                                ))}
                             </div>
                             <div className="w-full bg-[#1C1C1E] h-12 sm:h-14 px-8 rounded-xl sm:rounded-2xl border border-white/5 flex items-center mt-2">
                                <input 
                                   type="number" 
                                   value={formData.targetWordCount} 
                                   onChange={e => setFormData({...formData, targetWordCount: parseInt(e.target.value) || 0})}
                                   className="w-full bg-transparent text-lg font-black text-white outline-none"
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Paradigms, Specialized Archives & Visual Coding */}
                    <div className="lg:w-3/5 space-y-12 mt-12 lg:mt-0">
                       {/* Core Paradigms */}
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">寫作範式 CORE PARADIGMS</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                             {mainParadigms.map((type) => {
                                const t = TEMPLATES[type];
                                const active = formData.type === type;
                                return (
                                  <button 
                                    key={type} 
                                    onClick={() => setFormData({...formData, type})} 
                                    className={`flex flex-col items-start p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border transition-all min-h-[180px] sm:min-h-[220px] text-left relative group ${active ? 'bg-[#7b61ff] border-[#7b61ff] text-white shadow-[0_20px_50px_rgba(123,97,255,0.4)] scale-[1.02]' : 'bg-[#1C1C1E] border-white/5 text-gray-400 hover:border-white/10'}`}
                                  >
                                     <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-transform group-hover:scale-110 ${active ? 'bg-white/20' : 'bg-white/5'}`}>
                                        <i className={`fa-solid ${t.icon} text-xl sm:text-2xl`} style={{ color: active ? 'white' : '#7b61ff' }}></i>
                                     </div>
                                     <span className={`text-sm sm:text-[16px] font-black uppercase tracking-widest leading-none mb-2 sm:mb-3 ${active ? 'text-white' : 'text-slate-200'}`}>{t.label}</span>
                                     <p className={`text-[10px] sm:text-[11px] font-medium line-clamp-2 sm:line-clamp-3 leading-relaxed ${active ? 'text-white/80' : 'text-gray-500'}`}>{t.description}</p>
                                  </button>
                                );
                             })}
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="flex items-center justify-between px-1">
                             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest">其他專業存檔 SPECIALIZED ARCHIVES</label>
                             <button onClick={() => setIsTemplatesExpanded(!isTemplatesExpanded)} className="text-[10px] font-black text-[#7b61ff] uppercase tracking-[0.2em] flex items-center gap-2">
                                {isTemplatesExpanded ? '收起 COLLAPSE' : '瀏覽全部 VIEW ALL'}
                                <i className={`fa-solid fa-chevron-${isTemplatesExpanded ? 'up' : 'down'}`}></i>
                             </button>
                          </div>

                          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 transition-all duration-700 ${isTemplatesExpanded ? 'opacity-100 max-h-[1200px] visible mt-4' : 'opacity-0 max-h-0 invisible overflow-hidden'}`}>
                             {scrollParadigms.map(type => {
                                const t = TEMPLATES[type];
                                const active = formData.type === type;
                                return (
                                   <button 
                                      key={type} 
                                      onClick={() => setFormData({...formData, type})}
                                      className={`flex items-center justify-between p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all ${active ? 'bg-[#7b61ff] border-[#7b61ff] text-white shadow-lg' : 'bg-[#1C1C1E] border-white/5 text-gray-500 hover:border-white/10'}`}
                                   >
                                      <div className="flex items-center space-x-4 sm:space-x-5 text-left">
                                         <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-white/5'}`}>
                                            <i className={`fa-solid ${t.icon} text-base sm:text-lg`} style={{ color: active ? 'white' : '#7b61ff' }}></i>
                                         </div>
                                         <div>
                                            <h4 className={`text-xs sm:text-[13px] font-black uppercase tracking-widest leading-none ${active ? 'text-white' : 'text-slate-200'}`}>{t.label}</h4>
                                            <p className="text-[8px] sm:text-[9px] font-bold opacity-40 mt-1">{t.enLabel}</p>
                                         </div>
                                      </div>
                                   </button>
                                );
                             })}
                          </div>
                       </div>

                       {/* Visual Coding Section - Outer white ring removed as per instruction */}
                       <div className="space-y-6 pt-6 border-t border-white/5">
                          <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">視覺編碼 VISUAL CODING</label>
                          <div className="grid grid-cols-5 sm:grid-cols-11 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 justify-items-center sm:justify-items-start">
                             {PROJECT_COLORS.map(c => (
                                <button 
                                  key={c} 
                                  onClick={() => setFormData({...formData, color: c})} 
                                  className={`w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full transition-all duration-300 flex items-center justify-center relative active:scale-90 ${
                                    formData.color === c 
                                      ? 'scale-110 z-10 shadow-[0_0_30px_rgba(255,255,255,0.4)] border-[3px] border-white/90' 
                                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                                  }`} 
                                  style={{ backgroundColor: c }}
                                >
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Layout Bottom Padding */}
                 <div className="h-32" />
              </div>

              {/* Fixed Bottom Action Area */}
              <div className="absolute bottom-0 inset-x-0 p-8 sm:p-12 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10] to-transparent shrink-0 z-30">
                 <button 
                    onClick={handleCreate} 
                    disabled={!formData.name.trim()} 
                    className={`w-full h-16 sm:h-24 rounded-[2rem] sm:rounded-[3rem] text-white font-black text-[12px] sm:text-[15px] uppercase tracking-[0.4em] sm:tracking-[0.5em] shadow-2xl transition-all active:scale-[0.97] hover:scale-[1.01] ${!formData.name.trim() ? 'bg-gray-800 opacity-40 cursor-not-allowed' : 'bg-blue-600 shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:brightness-110'}`}
                 >
                    啟 動 寫 作 存 檔 P R O T O C O L
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Library;