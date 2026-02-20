
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MembershipLevel, UIMode, AppState, Project, AppMode, AppTab, ThemeMode, VersionSnapshot, SnapshotType, Chapter, WritingType, StructureType, AIPreferences, SecuritySettings, BackupSettings, CreditCard, SpineNodeId } from './types';
import { TEMPLATES, PROJECT_COLORS, PROJECT_ICONS, TEMPLATE_STRUCTURE_MAP, INITIAL_SPINE_NODES } from './constants';
import Library from './components/Library';
import CaptureCenter from './components/CaptureCenter';
import Profile from './components/Profile';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import BottomNav from './components/BottomNav';
import ProfessionalPublicationCenter from './components/ProfessionalPublicationCenter';
import ProjectDetail from './components/ProjectDetail';
import CollaborationPanel from './components/CollaborationPanel';
import SubscriptionPlans from './components/SubscriptionPlans';
import CheckoutModal from './components/CheckoutModal';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    projects: [
      {
        id: 'p1',
        name: 'The Solar Paradox',
        writingType: WritingType.NOVEL,
        structureType: StructureType.CHAPTER,
        targetWordCount: 50000,
        metadata: 'EDITED 10M AGO',
        progress: 82,
        color: '#FADE4B',
        icon: 'fa-feather-pointed',
        chapters: [{ 
          id: 'c1', 
          title: '第 1 章', 
          content: '故事開始於太陽不再升起的那一天...', 
          order: 1, 
          history: [], 
          wordCount: 1250, 
          lastEdited: Date.now(),
          createdAt: Date.now() - 3600000
        }],
        modules: [],
        settings: { typography: 'serif', fontSize: 'normal' },
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 600000,
        tags: ['SCI-FI', 'NOVEL'],
        isPinned: true,
        publishingSpine: {
          currentNode: SpineNodeId.WRITING,
          nodes: INITIAL_SPINE_NODES()
        }
      },
      {
        id: 'p2',
        name: 'Vibrant Horizons',
        writingType: WritingType.BLOG,
        structureType: StructureType.SECTION,
        targetWordCount: 10000,
        metadata: 'EDITED 2H AGO',
        progress: 45,
        color: '#FF6B2C',
        icon: 'fa-pen-nib',
        chapters: [],
        modules: [],
        settings: { typography: 'sans', fontSize: 'normal' },
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 7200000,
        tags: ['TECH', 'BLOG'],
        isPinned: false,
        publishingSpine: {
          currentNode: SpineNodeId.WRITING,
          nodes: INITIAL_SPINE_NODES()
        }
      },
      {
        id: 'p3',
        name: 'Quantum Ghost',
        writingType: WritingType.NOVEL,
        structureType: StructureType.CHAPTER,
        targetWordCount: 80000,
        metadata: 'REVIEW PENDING',
        progress: 95,
        color: '#D4FF5F',
        icon: 'fa-book-open',
        chapters: [],
        modules: [],
        settings: { typography: 'serif', fontSize: 'normal' },
        createdAt: Date.now() - 259200000,
        updatedAt: Date.now() - 86400000,
        tags: ['THRILLER'],
        isPinned: false,
        publishingSpine: {
          currentNode: SpineNodeId.WRITING,
          nodes: INITIAL_SPINE_NODES()
        }
      },
      {
        id: 'p4',
        name: 'Daily Journal',
        writingType: WritingType.DIARY,
        structureType: StructureType.FREE,
        targetWordCount: 500,
        metadata: 'CREATED YESTERDAY',
        progress: 10,
        color: '#B2A4FF',
        icon: 'fa-note-sticky',
        chapters: [],
        modules: [],
        settings: { typography: 'sans', fontSize: 'normal' },
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
        tags: ['PERSONAL'],
        isPinned: false,
        publishingSpine: {
          currentNode: SpineNodeId.WRITING,
          nodes: INITIAL_SPINE_NODES()
        }
      }
    ],
    currentProject: null,
    currentChapterId: null,
    uiMode: UIMode.MANAGEMENT,
    appMode: AppMode.REPOSITORY,
    activeTab: AppTab.LIBRARY,
    theme: ThemeMode.NIGHT,
    membership: MembershipLevel.FREE,
    language: 'zh-TW',
    userCountryCode: 'TW',
    savedCards: [
      { id: 'card-1', number: '9759 2484 5269 6576', expiry: '12/24', name: 'BRUCE WAYNE', type: 'MASTERCARD', cvv: '***' }
    ],
    aiPreferences: {
      provider: 'DEFAULT',
      selectedModel: 'gemini-3-pro-preview',
      customModel: 'gemini-3-pro-preview',
      tone: 'CREATIVE',
      enableThinking: true,
      thinkingBudget: 32768,
      budgetLimit: 10,
      currentUsage: 2.45,
      onLimitAction: 'NOTIFY'
    },
    securitySettings: {
      autoSnapshotEnabled: true,
      autoSnapshotMode: 'interval',
      autoSnapshotIntervalMinutes: 2,
      autoSnapshotIdleSeconds: 30,
      autoSnapshotCleanupDays: 30 
    },
    backupSettings: {
      googleDriveConnected: true,
      backupFolder: '/InsPublish/Backups',
      isEncrypted: true,
      lastBackupTime: Date.now() - 120000,
      status: 'IDLE'
    },
    stats: { 
      wordCount: 95430, 
      projectCount: 4, 
      exportCount: 2, 
      lastActive: Date.now(), 
      hasTrialed: false,
      dailyGoal: 1000,
      writingStreak: 12,
      todayWords: 450
    },
    editorSettings: {
      typewriterMode: false,
      previewMode: false
    }
  });

  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'TIMELINE' | 'GRAPH' | 'EXPORT' | 'COLLABORATION' | 'SUBSCRIPTION' | 'CHECKOUT'>('NONE');
  const [selectedPlan, setSelectedPlan] = useState<{ id: MembershipLevel, name: string, price: string } | null>(null);
  const [isUIHidden, setIsUIHidden] = useState(false);
  
  const [swipeProgress, setSwipeProgress] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Function 3: Data Persistence (On Mount)
  useEffect(() => {
    const loadSettings = async () => {
      const country = await dbService.getAppSetting('userCountryCode');
      const lang = await dbService.getAppSetting('language');
      const avatar = await dbService.getAppSetting('userAvatar');
      const avatarType = await dbService.getAppSetting('avatarType');
      if (country || lang || avatar || avatarType) {
        setState(prev => ({
          ...prev,
          userCountryCode: country || prev.userCountryCode,
          language: lang || prev.language,
          userAvatar: avatar || prev.userAvatar,
          avatarType: (avatarType as 'UPLOAD' | 'GRAVATAR') || prev.avatarType
        }));
      }
    };
    loadSettings();

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync settings back to DB when they change
  useEffect(() => {
    dbService.saveAppSetting('userCountryCode', state.userCountryCode);
    dbService.saveAppSetting('language', state.language);
    if (state.userAvatar) dbService.saveAppSetting('userAvatar', state.userAvatar);
    if (state.avatarType) dbService.saveAppSetting('avatarType', state.avatarType);
  }, [state.userCountryCode, state.language, state.userAvatar, state.avatarType]);
  
  const currentChapter = state.currentProject?.chapters.find(c => c.id === state.currentChapterId);
  const isTimelineVisible = swipeProgress > 0 || activeOverlay === 'TIMELINE';

  const timelineWidthPx = screenWidth >= 1024 
    ? screenWidth / 3 
    : screenWidth >= 768 
      ? screenWidth / 2 
      : screenWidth * 0.85;

  const lastSnapshotContentRef = useRef<string>('');
  const idleTimerRef = useRef<number | null>(null);

  const handleUpdateProject = (updated: Project) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === updated.id ? updated : p),
      currentProject: prev.currentProject?.id === updated.id ? updated : prev.currentProject
    }));
  };

  const handleSaveToProject = (projectId: string, content: string, chapterId?: string) => {
    setState(prev => {
      const projects = [...prev.projects];
      const pIdx = projects.findIndex(p => p.id === projectId);
      if (pIdx === -1) return prev;

      const project = { ...projects[pIdx] };
      let targetChapterId = chapterId;

      if (chapterId) {
        project.chapters = project.chapters.map(c => 
          c.id === chapterId ? { ...c, content: c.content + "\n\n" + content, wordCount: (c.content + content).length, lastEdited: Date.now() } : c
        );
      } else {
        if (project.chapters.length > 0) {
          const first = project.chapters[0];
          targetChapterId = first.id;
          project.chapters[0] = { ...first, content: first.content + "\n\n" + content, wordCount: (first.content + content).length, lastEdited: Date.now() };
        } else {
          const newChap: Chapter = {
            id: 'c-' + Date.now(),
            title: '未命名章節',
            content: content,
            order: 1,
            wordCount: content.length,
            lastEdited: Date.now(),
            createdAt: Date.now()
          };
          project.chapters.push(newChap);
          targetChapterId = newChap.id;
        }
      }

      project.updatedAt = Date.now();
      projects[pIdx] = project;

      return {
        ...prev,
        projects,
        currentProject: project,
        currentChapterId: targetChapterId,
        activeTab: AppTab.WRITE,
        appMode: AppMode.REPOSITORY
      };
    });
  };

  const handleCreateNoteFromCapture = (content: string) => {
    const newId = 'p-' + Date.now();
    const newNote: Project = {
      id: newId,
      name: '靈感筆記 ' + new Date().toLocaleDateString(),
      writingType: WritingType.DIARY,
      structureType: StructureType.FREE,
      targetWordCount: 1000,
      metadata: '剛剛建立',
      progress: 0,
      color: '#B2A4FF',
      icon: 'fa-note-sticky',
      chapters: [{
        id: 'c-' + Date.now(),
        title: '隨手記',
        content: content,
        order: 1,
        wordCount: content.length,
        lastEdited: Date.now(),
        createdAt: Date.now()
      }],
      modules: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['CAPTURED'],
      settings: { typography: 'serif', fontSize: 'normal' },
      publishingSpine: {
        currentNode: SpineNodeId.WRITING,
        nodes: INITIAL_SPINE_NODES()
      }
    };

    setState(prev => ({
      ...prev,
      projects: [newNote, ...prev.projects],
      currentProject: newNote,
      currentChapterId: newNote.chapters[0].id,
      activeTab: AppTab.WRITE,
      appMode: AppMode.REPOSITORY
    }));
  };

  const createSnapshot = useCallback((type: SnapshotType) => {
    setState(prev => {
      if (!prev.currentProject || !prev.currentChapterId) return prev;
      const chapter = prev.currentProject.chapters.find(c => c.id === prev.currentChapterId);
      if (!chapter) return prev;
      if (type === SnapshotType.AUTO && chapter.content === lastSnapshotContentRef.current) return prev;
      const newSnapshot: VersionSnapshot = {
        id: `v-${Date.now()}`,
        timestamp: Date.now(),
        content: chapter.content,
        title: chapter.title,
        type: type
      };
      lastSnapshotContentRef.current = chapter.content;
      const updatedChapters = prev.currentProject.chapters.map(c => 
        c.id === prev.currentChapterId ? { ...c, history: [newSnapshot, ...(c.history || [])] } : c
      );
      const updatedProject = { ...prev.currentProject, chapters: updatedChapters };
      return {
        ...prev,
        projects: prev.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
        currentProject: updatedProject
      };
    });
  }, []);

  const handleUpdateContent = (newContent: string) => {
    setState(prev => {
      if (!prev.currentProject || !prev.currentChapterId) return prev;
      const chapters = prev.currentProject.chapters.map(c => 
        c.id === prev.currentChapterId ? { ...c, content: newContent, wordCount: newContent.length, lastEdited: Date.now() } : c
      );
      const updatedProject = { ...prev.currentProject, chapters, updatedAt: Date.now() };
      return {
        ...prev,
        projects: prev.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
        currentProject: updatedProject
      };
    });
    if (state.securitySettings.autoSnapshotEnabled && state.securitySettings.autoSnapshotMode === 'idle') {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => createSnapshot(SnapshotType.AUTO), state.securitySettings.autoSnapshotIdleSeconds * 1000);
    }
  };

  const closeTimeline = () => {
    setActiveOverlay('NONE');
    setSwipeProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const width = window.innerWidth;
    if (state.activeTab === AppTab.WRITE && currentChapter && x > width * 0.85 && activeOverlay === 'NONE') {
      touchStartX.current = x;
      setIsDragging(true);
    }
    else if (activeOverlay === 'TIMELINE') {
       if (x > (width - timelineWidthPx)) {
          touchStartX.current = x;
          setIsDragging(true);
       }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    let progress = 0;
    if (activeOverlay === 'NONE') {
      const diff = touchStartX.current - currentX;
      progress = Math.max(0, Math.min(1, diff / timelineWidthPx));
    } else if (activeOverlay === 'TIMELINE') {
      const diff = currentX - touchStartX.current;
      progress = 1 - Math.max(0, Math.min(1, diff / timelineWidthPx));
    }
    setSwipeProgress(progress);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (swipeProgress > 0.2) {
      setActiveOverlay('TIMELINE');
      setSwipeProgress(1);
    } else {
      closeTimeline();
    }
    touchStartX.current = null;
  };

  const handleSubscriptionSuccess = () => {
    if (selectedPlan) {
      setState(prev => ({ ...prev, membership: selectedPlan.id }));
      setActiveOverlay('NONE');
      setSelectedPlan(null);
      alert(`恭喜！您已成功訂閱 ${selectedPlan.name}`);
    }
  };

  const isBottomNavVisible = !isUIHidden && (activeOverlay === 'NONE' && swipeProgress === 0) && (state.activeTab !== AppTab.WRITE || !currentChapter);
  const editorScale = 1 - swipeProgress * 0.04; 
  const editorBlur = swipeProgress * 4; 
  const editorOpacity = 1 - swipeProgress * 0.4;
  const timelineTranslate = (1 - swipeProgress) * 100;

  return (
    <div 
      className="h-screen flex flex-col relative overflow-hidden bg-black text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {state.activeTab !== AppTab.WRITE && !isUIHidden && (
        <header className="fixed top-0 w-full z-[100] h-24 pt-[env(safe-area-inset-top,0px)] flex items-end justify-between px-8 pb-4 bg-black/60 backdrop-blur-3xl border-b border-white/5">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white">InsPublish</h1>
            <p className="text-[10px] text-[#8e8e93] font-black uppercase tracking-[0.2em] mt-0.5">專業級敘事引擎</p>
          </div>
          <button 
            onClick={() => setState(p => ({...p, appMode: p.appMode === AppMode.REPOSITORY ? AppMode.CAPTURE : AppMode.REPOSITORY}))} 
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all overflow-visible group"
          >
             <div className="relative w-7 h-7 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <i className={`fa-solid fa-file absolute -top-[1.5px] -left-[1.5px] transition-all duration-500 ${state.appMode === AppMode.REPOSITORY ? 'text-white text-[13.5px] opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]' : 'text-white/20 text-[11px]'}`}></i>
                <div className={`absolute -bottom-[2px] -right-[2px] rounded-full border-[2.2px] flex items-center justify-center transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) ${state.appMode === AppMode.CAPTURE ? 'w-[16px] h-[16px] border-[#D4FF5F] bg-[#D4FF5F]/10 scale-110 shadow-[0_0_15px_rgba(212,255,95,0.4)]' : 'w-[13px] h-[13px] border-white/30'}`}>
                   <div className={`rounded-full transition-all duration-500 ${state.appMode === AppMode.CAPTURE ? 'w-[5px] h-[5px] bg-[#D4FF5F] shadow-[0_0_8px_#D4FF5F] animate-pulse' : 'w-[4px] h-[4px] bg-white/30'}`}></div>
                </div>
             </div>
          </button>
        </header>
      )}

      <main 
        style={{
          transform: `scale(${editorScale})`,
          filter: `blur(${editorBlur}px)`,
          opacity: editorOpacity,
          transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={() => {
          if (activeOverlay === 'TIMELINE') closeTimeline();
        }}
        className={`flex-1 overflow-y-auto no-scrollbar ${(state.activeTab === AppTab.WRITE && currentChapter) || isUIHidden ? 'p-0' : (state.activeTab === AppTab.WRITE ? 'p-0' : 'pt-24 pb-32')}`}
      >
        {state.activeTab === AppTab.LIBRARY ? (
          state.appMode === AppMode.REPOSITORY ? (
            <Library 
              projects={state.projects} 
              onSelectProject={(p) => setState(prev => ({...prev, currentProject: p, activeTab: AppTab.PROJECT_DETAIL}))}
              onCreateProject={(proj) => setState(prev => ({...prev, projects: [proj, ...prev.projects]}))}
              onUpdateProjects={(p) => setState(prev => ({...prev, projects: p}))}
            />
          ) : (
            <CaptureCenter 
              projects={state.projects} 
              onSaveToProject={handleSaveToProject} 
              onSaveToNotebook={handleCreateNoteFromCapture}
              membership={state.membership}
              onUpgrade={() => setActiveOverlay('SUBSCRIPTION')}
              onToggleFullscreenUI={setIsUIHidden}
            />
          )
        ) : (state.activeTab === AppTab.PROJECT_DETAIL && state.currentProject) ? (
          <ProjectDetail 
            project={state.currentProject} 
            onBack={() => setState(prev => ({ ...prev, activeTab: AppTab.LIBRARY }))}
            onOpenModule={() => {}}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={(id) => setState(prev => ({...prev, projects: prev.projects.filter(p => p.id !== id), activeTab: AppTab.LIBRARY}))}
            onEnterEditor={(id) => setState(prev => ({...prev, currentChapterId: id, activeTab: AppTab.WRITE}))}
            onOpenExport={() => setActiveOverlay('EXPORT')}
          />
        ) : state.activeTab === AppTab.WRITE ? (
          currentChapter ? (
            <Editor 
              chapter={currentChapter}
              onUpdateContent={handleUpdateContent}
              uiMode={state.uiMode}
              onModeToggle={(mode) => setState(prev => ({ ...prev, uiMode: mode }))}
              onOpenTimeline={() => { setActiveOverlay('TIMELINE'); setSwipeProgress(1); }}
              onOpenCollaboration={() => setActiveOverlay('COLLABORATION')}
              onBack={() => setState(prev => ({ ...prev, activeTab: AppTab.PROJECT_DETAIL }))}
              onUpdateOutline={() => {}}
              membership={state.membership}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-center animate-in fade-in duration-700">
               <div className="w-[140px] h-[140px] bg-[#0A0A0A] border border-white/5 rounded-[40px] flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
                  <i className="fa-solid fa-feather text-[#3B82F6] text-[64px] relative z-10 group-hover:scale-110 transition-transform duration-500"></i>
               </div>
               <h2 className="text-[28px] font-black text-white mb-4 tracking-tighter">尚未選擇作品</h2>
               <p className="text-[15px] text-[#8E8E93] font-medium max-w-[300px] leading-relaxed mb-10">
                 請先從書架選擇一個現有作品，或在書架中建立新專案以開始寫作。
               </p>
               <button 
                 onClick={() => setState(prev => ({ ...prev, activeTab: AppTab.LIBRARY }))} 
                 className="w-[220px] h-[60px] bg-[#3B82F6] rounded-[24px] text-white font-bold text-[16px] tracking-[0.2em] shadow-[0_10px_30px_rgba(59,130,246,0.2)] active:scale-95 hover:bg-[#2563EB] transition-all flex items-center justify-center"
               >
                 返回書架
               </button>
            </div>
          )
        ) : state.activeTab === AppTab.PROFILE ? (
          <Profile 
            state={state} 
            onUpgrade={() => setActiveOverlay('SUBSCRIPTION')} 
            onLanguageChange={(l) => setState(prev => ({...prev, language: l}))} 
            onUpdateAIPreferences={(prefs) => setState(prev => ({...prev, aiPreferences: prefs}))}
            onUpdateSecuritySettings={(s) => setState(prev => ({...prev, securitySettings: s}))}
            onUpdateBackupSettings={(b) => setState(prev => ({...prev, backupSettings: b}))}
            onUpdateSavedCards={(c) => setState(prev => ({...prev, savedCards: c}))}
            onUpdateCountryCode={(code) => setState(prev => ({...prev, userCountryCode: code}))}
            onUpdateAvatar={(avatar, type) => setState(prev => ({...prev, userAvatar: avatar, avatarType: type}))}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 font-black uppercase tracking-[0.5em] text-[10px]">
            System Error: View Redirecting...
            {/* 強制返回主頁面 */}
            {useEffect(() => { setState(s => ({...s, activeTab: AppTab.LIBRARY})); }, [])}
          </div>
        )}
      </main>

      {/* Dynamic Liquid Backdrop Mask */}
      <div 
        className="fixed inset-0 bg-black pointer-events-none z-[190]"
        style={{ 
          opacity: Math.max(0, Math.min(0.6, swipeProgress * 0.6)),
          display: swipeProgress > 0 ? 'block' : 'none',
          transition: isDragging ? 'none' : 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {activeOverlay === 'SUBSCRIPTION' && (
        <SubscriptionPlans 
          currentMembership={state.membership}
          onSelectPlan={(plan) => {
            setSelectedPlan(plan);
            setActiveOverlay('CHECKOUT');
          }}
          onClose={() => setActiveOverlay('NONE')}
        />
      )}

      {activeOverlay === 'CHECKOUT' && selectedPlan && (
        <CheckoutModal 
          planName={selectedPlan.name}
          price={selectedPlan.price}
          onSuccess={handleSubscriptionSuccess}
          onClose={() => setActiveOverlay('SUBSCRIPTION')}
        />
      )}

      {activeOverlay === 'EXPORT' && (
        <ProfessionalPublicationCenter 
          project={state.currentProject} 
          onClose={() => setActiveOverlay('NONE')} 
          onUpdateProject={handleUpdateProject}
          currentLanguage={state.language}
          userCountryCode={state.userCountryCode}
        />
      )}

      {isTimelineVisible && state.currentProject && state.currentChapterId && (
        <div 
          className="fixed inset-y-0 right-0 z-[200] overflow-hidden"
          style={{
            width: timelineWidthPx,
            transform: `translateX(${timelineTranslate}%)`,
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
           <div className="absolute left-0 inset-y-0 w-10 z-[210] cursor-ew-resize active:bg-white/5" />
           <Timeline 
             history={state.currentProject.chapters.find(c => c.id === state.currentChapterId)?.history || []}
             membership={state.membership}
             isNight={true}
             onRestore={(s) => {
               handleUpdateContent(s.content);
               closeTimeline();
             }}
             onPreview={() => {}}
             onCreateMilestone={() => createSnapshot(SnapshotType.MILESTONE)}
             onClearSnapshots={() => {}}
             onClose={closeTimeline}
             securitySettings={state.securitySettings}
             onUpdateSecuritySettings={(s) => setState(prev => ({ ...prev, securitySettings: s }))}
           />
        </div>
      )}

      {activeOverlay === 'COLLABORATION' && (
        <CollaborationPanel onClose={() => setActiveOverlay('NONE')} />
      )}

      <BottomNav activeTab={state.activeTab} onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))} isVisible={isBottomNavVisible} />
    </div>
  );
};

export default App;
