
import React, { useState, useRef, useEffect } from 'react';
import { Project, Chapter, StructureType, SpineNodeId, SpineNodeStatus, CoverAssetType, CoverAsset } from '../types';
import { TEMPLATES, STRUCTURE_DEFINITIONS, SPINE_NODES_CONFIG, INITIAL_SPINE_NODES } from '../constants';
import { geminiService } from '../services/geminiService';
import CoverManagementModal from './CoverManagementModal';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onOpenModule: (moduleId: string) => void;
  onUpdateProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onEnterEditor: (chapterId: string) => void;
  onOpenExport?: () => void; 
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onOpenModule, onUpdateProject, onDeleteProject, onEnterEditor, onOpenExport }) => {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(project.name);

  // Chapter editing states
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterEditValue, setChapterEditValue] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const chapterInputRef = useRef<HTMLInputElement>(null);

  const structDef = STRUCTURE_DEFINITIONS[project.structureType] || STRUCTURE_DEFINITIONS[StructureType.FREE];

  const totalWords = project.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  const writingDays = Math.max(1, Math.ceil((Date.now() - project.createdAt) / (1000 * 60 * 60 * 24)));

  const estPages = Math.ceil(totalWords / 250);
  const estSpineWidth = (estPages * 0.0022).toFixed(2);

  useEffect(() => {
    setEditNameValue(project.name);
  }, [project.name]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAddingChapter && addInputRef.current) {
      addInputRef.current.focus();
      addInputRef.current.select();
    }
  }, [isAddingChapter]);

  const handleSaveAssets = (assets: Record<CoverAssetType, CoverAsset>) => {
    onUpdateProject({
      ...project,
      updatedAt: Date.now(),
      publishingPayload: {
        ...(project.publishingPayload || {
          title: project.name,
          subtitle: '',
          author: 'Author Identity',
          languageCode: 'zh-TW',
          regionCode: 'TW',
          shortDescription: '',
          longDescription: '',
          bisacCategories: [],
          keywords: [],
          contentFormats: ['epub', 'pdf', 'docx']
        }),
        coverAssets: assets,
        coverImage: assets[CoverAssetType.EBOOK_DIGITAL]?.url || assets[Object.keys(assets)[0] as CoverAssetType]?.url || project.publishingPayload?.coverImage
      }
    });
    setIsCoverModalOpen(false);
  };

  const handleOpenAdd = () => {
    if (structDef.autoNumbering) {
      const nextPos = project.chapters.length + 1;
      setNewTitle(structDef.defaultNamingRule(nextPos));
    } else {
      setNewTitle('');
    }
    setIsAddingChapter(true);
  };

  const handleAdd = () => {
    const nextPos = project.chapters.length + 1;
    let finalTitle = newTitle.trim();
    
    if (!finalTitle) {
      finalTitle = structDef.autoNumbering 
        ? structDef.defaultNamingRule(nextPos) 
        : `新內容 ${nextPos}`;
    }

    const newUnit: Chapter = { 
      id: 'u-' + Date.now(), 
      title: finalTitle, 
      content: '', 
      order: nextPos, 
      history: [], 
      wordCount: 0, 
      lastEdited: Date.now(), 
      createdAt: Date.now() 
    };

    onUpdateProject({ 
      ...project, 
      chapters: [...project.chapters, newUnit], 
      updatedAt: Date.now() 
    });
    
    setNewTitle('');
    setIsAddingChapter(false);
  };

  const handleStartEditChapter = (e: React.MouseEvent, unit: Chapter) => {
    e.stopPropagation();
    setEditingChapterId(unit.id);
    setChapterEditValue(unit.title);
    setTimeout(() => chapterInputRef.current?.focus(), 50);
  };

  const handleSaveChapterTitle = (unitId: string) => {
    if (!chapterEditValue.trim()) {
      setEditingChapterId(null);
      return;
    }
    const updatedChapters = project.chapters.map(c => 
      c.id === unitId ? { ...c, title: chapterEditValue.trim() } : c
    );
    onUpdateProject({ ...project, chapters: updatedChapters, updatedAt: Date.now() });
    setEditingChapterId(null);
  };

  const handleDeleteChapter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除此章節嗎？內容將無法復原。')) {
      const remaining = project.chapters.filter(c => c.id !== id);
      const reordered = remaining.map((c, i) => ({ ...c, order: i + 1 }));
      onUpdateProject({ ...project, chapters: reordered, updatedAt: Date.now() });
    }
  };

  const handleTogglePin = () => {
    onUpdateProject({ ...project, isPinned: !project.isPinned, updatedAt: Date.now() });
    setIsMenuOpen(false);
  };

  const handleNameSave = () => {
    const trimmed = editNameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onUpdateProject({ ...project, name: trimmed, updatedAt: Date.now() });
    } else {
      setEditNameValue(project.name);
    }
    setIsEditingName(false);
  };

  const onDragStart = (idx: number) => setDraggedIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newChapters = [...project.chapters];
    const item = newChapters.splice(draggedIdx, 1)[0];
    newChapters.splice(idx, 0, item);
    onUpdateProject({ ...project, chapters: newChapters.map((c, i) => ({ ...c, order: i + 1 })), updatedAt: Date.now() });
    setDraggedIdx(idx);
  };

  const displayProgress = project.id === 'p1' ? 11 : project.progress;
  const wordGoal = project.targetWordCount || 50000;
  const miniProgress = project.id === 'p1' ? 2 : project.progress;

  const hasAssets = project.publishingPayload?.coverAssets && Object.keys(project.publishingPayload.coverAssets).length > 0;
  const currentPreviewUrl = project.publishingPayload?.coverImage;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-y-auto no-scrollbar pb-40">
      
      {/* Header Profile Section */}
      <header className="px-8 pt-10 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <button onClick={onBack} className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center text-gray-500 active:scale-90 transition-all">
            <i className="fa-solid fa-chevron-left text-lg"></i>
          </button>
          
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl relative" style={{ backgroundColor: project.color || '#FADE4B', color: '#121214' }}>
              <i className={`fa-solid ${project.icon}`}></i>
              {project.isPinned && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#D4FF5F] rounded-full border-[3px] border-black flex items-center justify-center text-[10px] text-black">
                  <i className="fa-solid fa-thumbtack"></i>
                </div>
              )}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center text-gray-500 active:scale-90">
              <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-14 w-52 bg-[#1C1C1E] border border-white/10 rounded-[28px] shadow-3xl z-[100] p-2 animate-in fade-in zoom-in duration-300">
                <button onClick={handleTogglePin} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/5 text-left text-white">
                  <i className={`fa-solid ${project.isPinned ? 'fa-thumbtack text-[#D4FF5F]' : 'fa-thumbtack text-gray-400'}`}></i>
                  <span className="text-[11px] font-black uppercase tracking-widest">{project.isPinned ? '取消置頂' : '置頂專案'}</span>
                </button>
                <button onClick={() => { setIsEditingName(true); setIsMenuOpen(false); }} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/5 text-left text-white">
                  <i className="fa-solid fa-pen-to-square text-blue-500 text-lg"></i>
                  <span className="text-[13px] font-bold tracking-tight">編輯名稱</span>
                </button>
                <button onClick={onOpenExport} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/5 text-left text-white">
                  <i className="fa-solid fa-file-export text-blue-400"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest">出版投遞</span>
                </button>
                <div className="h-px bg-white/5 my-1.5 mx-2" />
                <button onClick={() => onDeleteProject(project.id)} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-red-500/10 text-left text-red-500">
                  <i className="fa-solid fa-trash-can"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest">刪除專案</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 group">
            {isEditingName ? (
              <input 
                ref={inputRef} 
                autoFocus 
                value={editNameValue} 
                onChange={(e) => setEditNameValue(e.target.value)} 
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="bg-transparent border-b-2 border-blue-600 outline-none text-3xl font-black text-center text-white w-full max-w-sm" 
              />
            ) : (
              <h1 
                onClick={() => setIsEditingName(true)}
                className="text-4xl font-black tracking-tighter text-white cursor-text"
              >
                {project.name}
              </h1>
            )}
            {!isEditingName && (
              <button onClick={() => setIsEditingName(true)} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fa-solid fa-pen-to-square text-xl"></i>
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#8E8E93] font-black uppercase tracking-[0.4em] mt-2.5">
            {TEMPLATES[project.writingType]?.label}
          </p>
        </div>
      </header>

      <main className="px-8 space-y-12">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#1C1C1E] p-8 rounded-[44px] border border-white/5 space-y-3">
            <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">總字數統計</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-white">{totalWords.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-gray-700">/ {wordGoal.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-[#1C1C1E] p-8 rounded-[44px] border border-white/5 space-y-3">
            <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">創作天數</p>
            <p className="text-3xl font-black text-[#D4FF5F] tracking-tight">{writingDays} DAYS</p>
          </div>
          
          <div className="bg-[#1C1C1E] p-8 rounded-[44px] border border-white/5 space-y-4">
            <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">當前進度</p>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-black text-[#B2A4FF]">{miniProgress}%</span>
              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#B2A4FF]/40 rounded-full" 
                  style={{ width: `${miniProgress}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-[#1C1C1E] p-8 rounded-[44px] border border-white/5 space-y-3">
            <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">架構模組數</p>
            <p className="text-3xl font-black text-white tracking-tight">{project.chapters.length} NODES</p>
          </div>
        </div>

        <section className="w-full bg-[#1C1C1E] rounded-[44px] p-10 shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white tracking-tight">出版線性主軸</h3>
              <p className="text-[10px] text-[#8E8E93] font-black uppercase tracking-[0.2em]">PUBLISHING SPINE PROGRESS</p>
            </div>
            <button 
              onClick={onOpenExport}
              className="px-8 py-3.5 bg-[#2563EB] rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
            >
              推進流程
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1 text-[10px] font-black uppercase tracking-widest">
              <span className="text-[#8E8E93]">當前進度</span>
              <span className="text-white text-sm">{displayProgress}%</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.6)]" 
                style={{ width: `${displayProgress}%` }} 
              />
            </div>
          </div>
        </section>

        {/* Book Cover Section - Refactored for Multi-Spec Asset Management */}
        <section className="space-y-8">
          <div className="px-2 flex justify-between items-end">
             <div className="space-y-1.5">
                <h3 className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">作品視覺封面 BOOK COVER</h3>
                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">MULTI-SPEC ASSET SYSTEM</p>
             </div>
             <div className="flex space-x-8">
                <div className="text-right">
                  <p className="text-[9px] text-[#4E4E52] font-black uppercase tracking-widest">ASSETS</p>
                  <p className="text-[15px] font-black text-white tracking-tighter">{Object.keys(project.publishingPayload?.coverAssets || {}).length}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-[#4E4E52] font-black uppercase tracking-widest">EST. PAGES</p>
                  <p className="text-[15px] font-black text-white tracking-tighter">{estPages} P</p>
                </div>
             </div>
          </div>
          
          <div className="relative aspect-[3/4] w-full max-w-[360px] mx-auto bg-[#1C1C1E] rounded-[56px] border border-white/10 overflow-hidden shadow-3xl group transition-all">
             {currentPreviewUrl ? (
                <>
                  <img src={currentPreviewUrl} alt="Book Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-10 space-y-4">
                     <button onClick={() => setIsCoverModalOpen(true)} className="w-full py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] text-white active:scale-95">管理封面資產</button>
                     <button className="w-full py-5 bg-[#D4FF5F] text-black rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95">下載當前預覽</button>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute top-8 left-8 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF5F] animate-pulse" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Preview</span>
                  </div>
                </>
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                   <div className="w-24 h-24 rounded-[32px] bg-blue-600/10 flex items-center justify-center text-blue-500 text-4xl mb-10 border border-blue-600/20 shadow-inner">
                      <i className="fa-solid fa-image"></i>
                   </div>
                   <div className="space-y-3 mb-12">
                      <h4 className="text-lg font-black text-white uppercase tracking-widest">尚未生成封面</h4>
                      <p className="text-[12px] text-[#8E8E93] font-medium leading-relaxed">
                        根據專案目標生成符合 Amazon KDP 或實體書規範的出版級封面。
                      </p>
                   </div>
                   <button 
                     onClick={() => setIsCoverModalOpen(true)} 
                     className="w-full py-6 bg-[#2563EB] rounded-[28px] text-[12px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
                   >
                     啟動封面管理中心
                   </button>
                </div>
             )}
          </div>
        </section>

        {/* Chapters Section - Optimized per Screenshots */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center justify-between px-2">
             <div className="space-y-1.5">
               <h2 className="text-[32px] font-black text-white tracking-tighter leading-none">章節管理</h2>
               <p className="text-[11px] text-[#4E4E52] font-black uppercase tracking-widest">拖拽排序 · 點擊編輯</p>
             </div>
             <button 
               onClick={handleOpenAdd} 
               className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-2xl shadow-xl active:scale-95 transition-all hover:scale-105"
             >
               <i className="fa-solid fa-plus"></i>
             </button>
          </div>
          
          <div className="space-y-4">
             {project.chapters.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[44px] opacity-20">
                   <i className="fa-solid fa-feather-pointed text-5xl mb-6"></i>
                   <p className="text-[10px] font-black uppercase tracking-widest">目前尚無章節內容</p>
                </div>
             ) : (
                project.chapters.map((unit, idx) => (
                  <div 
                    key={unit.id} 
                    draggable 
                    onDragStart={() => onDragStart(idx)} 
                    onDragOver={(e) => onDragOver(e, idx)} 
                    className="group bg-[#1C1C1E] h-[100px] sm:h-[110px] px-8 rounded-[24px] sm:rounded-[28px] border border-white/5 flex items-center justify-between hover:bg-[#252528] transition-all cursor-pointer"
                    onClick={() => onEnterEditor(unit.id)}
                  >
                     <div className="flex items-center space-x-6 sm:space-x-8 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div className="w-6 h-6 flex items-center justify-center text-gray-800 group-hover:text-gray-600 transition-colors shrink-0">
                           <i className="fa-solid fa-grip-vertical text-lg"></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           {editingChapterId === unit.id ? (
                             <input 
                               ref={chapterInputRef}
                               value={chapterEditValue}
                               onClick={(e) => e.stopPropagation()}
                               onChange={(e) => setChapterEditValue(e.target.value)}
                               onBlur={() => handleSaveChapterTitle(unit.id)}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') handleSaveChapterTitle(unit.id);
                                 if (e.key === 'Escape') setEditingChapterId(null);
                               }}
                               className="w-full bg-black/40 border-b border-blue-500 outline-none text-[20px] sm:text-[24px] font-black text-white px-2 py-1 rounded"
                             />
                           ) : (
                             <h4 className="text-[20px] sm:text-[24px] font-black text-white transition-colors truncate">
                                {unit.title}
                             </h4>
                           )}
                           <p className="text-[11px] text-gray-600 font-bold mt-0.5">{unit.wordCount} 字</p>
                        </div>
                     </div>

                     {/* Optimized Action Icons */}
                     <div className="flex items-center space-x-4 sm:space-x-6 shrink-0 pl-4">
                        <button 
                          onClick={(e) => handleStartEditChapter(e, unit)}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                           <i className="fa-solid fa-pen text-sm"></i>
                        </button>
                        <button 
                          onClick={(e) => handleDeleteChapter(e, unit.id)}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-all active:scale-90"
                        >
                           <i className="fa-regular fa-trash-can text-sm"></i>
                        </button>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-blue-600 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">
                           <i className="fa-solid fa-play text-lg sm:text-xl translate-x-0.5"></i>
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        </section>
      </main>

      {/* Modern Creation Modal */}
      {isAddingChapter && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-8 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsAddingChapter(false)} />
           <div className="relative w-full max-w-lg bg-[#1C1C1E] rounded-t-[44px] sm:rounded-[44px] border border-white/5 overflow-hidden shadow-3xl animate-in slide-in-from-bottom duration-500 flex flex-col">
              <header className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                 <div>
                   <h2 className="text-2xl font-black text-white">新增內容節點</h2>
                   <p className="text-[10px] font-black text-blue-500 uppercase mt-1">BASED ON TEMPLATE RULES</p>
                 </div>
                 <button onClick={() => setIsAddingChapter(false)} className="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-colors">
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </header>
              
              <main className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-widest px-1">節點標題 NODE TITLE</label>
                    <input 
                      ref={addInputRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      placeholder={structDef.autoNumbering ? structDef.defaultNamingRule(project.chapters.length + 1) : "請輸入標題..."}
                      className="w-full bg-black/40 border border-white/10 h-20 px-8 rounded-3xl text-2xl font-black text-white outline-none focus:border-blue-600 transition-all placeholder-white/5"
                    />
                 </div>
              </main>

              <footer className="p-8 bg-[#0F0F10] border-t border-white/5">
                 <button 
                   onClick={handleAdd}
                   className="w-full py-7 rounded-[32px] bg-blue-600 text-white font-black text-sm uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all"
                 >
                    確認並新增
                 </button>
              </footer>
           </div>
        </div>
      )}

      {isCoverModalOpen && (
        <CoverManagementModal 
          project={project} 
          onClose={() => setIsCoverModalOpen(false)} 
          onSave={handleSaveAssets} 
        />
      )}
    </div>
  );
};

export default ProjectDetail;
