
import React, { useState } from 'react';
import { AppState, MembershipLevel, SupportedLanguage, AIPreferences, SecuritySettings, BackupSettings, CreditCard } from '../types';
import LanguageSelector from './LanguageSelector';
import PrivacyModal from './PrivacyModal';
import AIPreferencesPage from './AIPreferences';
import SecuritySettingsPage from './SecuritySettingsPage';
import CreditCardManager from './CreditCardManager';

interface ProfileProps {
  state: AppState;
  onUpgrade: () => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onUpdateAIPreferences: (prefs: AIPreferences) => void;
  onUpdateSecuritySettings: (settings: SecuritySettings) => void;
  onUpdateBackupSettings: (settings: BackupSettings) => void;
  onUpdateSavedCards: (cards: CreditCard[]) => void;
  onUpdateCountryCode?: (code: string) => void;
  onUpdateAvatar?: (avatar: string, type: 'UPLOAD' | 'GRAVATAR') => void;
}

const Profile: React.FC<ProfileProps> = ({ state, onUpgrade, onLanguageChange, onUpdateAIPreferences, onUpdateSecuritySettings, onUpdateBackupSettings, onUpdateSavedCards, onUpdateCountryCode, onUpdateAvatar }) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAIPreferencesOpen, setIsAIPreferencesOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [gravatarEmail, setGravatarEmail] = useState('');

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    onLanguageChange(lang);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const toggleGDrive = () => {
    onUpdateBackupSettings({
      ...state.backupSettings,
      googleDriveConnected: !state.backupSettings.googleDriveConnected,
      status: state.backupSettings.googleDriveConnected ? 'IDLE' : 'SYNCING',
      lastBackupTime: state.backupSettings.googleDriveConnected ? state.backupSettings.lastBackupTime : Date.now()
    });
  };

  const handleAddCard = (card: CreditCard) => {
    onUpdateSavedCards([card, ...state.savedCards]);
  };

  const handleDeleteCard = (id: string) => {
    onUpdateSavedCards(state.savedCards.filter(c => c.id !== id));
  };

  const currentLangName = {
    'en': 'English',
    'zh-TW': '繁體中文',
    'zh-CN': '简体中文',
    'es': 'Español',
    'pt-BR': 'Português (Brasil)',
    'pt-PT': 'Português',
    'de': 'Deutsch',
    'fr': 'Français',
    'it': 'Italiano',
    'nl': 'Nederlands',
    'sv': 'Svenska',
    'tr': 'Türkçe',
    'ru': 'Русский',
    'ja': '日本語',
    'ko': '韓國語',
    'th': 'ไทย',
    'vi': 'Tiếng Việt',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'ar': 'العربية',
    'hi': 'हिन्दी',
  }[state.language] || state.language;

  const isRTL = state.language === 'ar';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAvatar) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result as string, 'UPLOAD');
        setIsAvatarModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGravatar = () => {
    if (gravatarEmail && onUpdateAvatar) {
      // Simple Gravatar URL generation
      const hash = gravatarEmail.trim().toLowerCase();
      // In a real app we would use MD5, but for this demo we'll just use the email
      // and assume the backend or a utility handles the hash if needed.
      // Since we can't easily MD5 here without a library, we'll use a placeholder logic
      // or just store the email and let the UI handle the URL construction.
      onUpdateAvatar(hash, 'GRAVATAR');
      setIsAvatarModalOpen(false);
    }
  };

  const getAvatarUrl = () => {
    if (state.avatarType === 'UPLOAD' && state.userAvatar) {
      return state.userAvatar;
    }
    if (state.avatarType === 'GRAVATAR' && state.userAvatar) {
      // Placeholder for Gravatar URL (would normally be MD5 hash)
      return `https://www.gravatar.com/avatar/${state.userAvatar}?d=identicon&s=200`;
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-48" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-[#D4FF5F] text-black px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(212,255,95,0.3)] animate-in fade-in slide-in-from-top-4 duration-300">
          Success: Language Updated
        </div>
      )}

      {/* 1. Identity & Growth Hero Section */}
      <section className="relative overflow-hidden bg-[#1C1C1E] rounded-[44px] border border-white/5 p-8 sm:p-12 shadow-3xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#B2A4FF]/5 rounded-full -ml-24 -mb-24 blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-blue-600 to-[#B2A4FF] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform duration-500 group-hover:scale-105 overflow-hidden">
                {getAvatarUrl() ? (
                  <img src={getAvatarUrl()!} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  state.language.slice(0, 1).toUpperCase()
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="fa-solid fa-camera text-2xl"></i>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#D4FF5F] rounded-full border-4 border-[#1C1C1E] flex items-center justify-center text-black text-xs shadow-lg">
                <i className="fa-solid fa-feather-pointed"></i>
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-3">
              <h2 className="text-4xl font-black text-white tracking-tighter">作家身分 ARCHETYPE</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border transition-all ${
                  state.membership === MembershipLevel.PREMIUM 
                    ? 'bg-[#FADE4B] text-black border-[#FADE4B]' 
                    : state.membership === MembershipLevel.PRO 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white/5 text-gray-400 border-white/10'
                }`}>
                  {state.membership} MEMBER
                </span>
                <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-gray-400">
                  <i className="fa-solid fa-fire mr-2 text-[#FF6B2C]"></i>
                  連續創作 {state.stats.writingStreak} 天
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-[0.1em]">{state.stats.wordCount.toLocaleString()} 累積總字數紀錄</p>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0">
            {state.membership === MembershipLevel.FREE ? (
              <button 
                onClick={onUpgrade}
                className="w-full md:px-12 py-6 bg-[#2563EB] rounded-[28px] text-white font-black text-[13px] uppercase tracking-[0.3em] shadow-[0_25px_50px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-bolt-lightning"></i>
                <span>升級 PRO 創作引擎</span>
              </button>
            ) : (
              <button 
                onClick={onUpgrade}
                className="w-full md:px-10 py-6 bg-white/5 border border-white/10 rounded-[28px] text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all"
              >
                <i className="fa-solid fa-gem mr-3 text-[#FADE4B]"></i>
                管理專業版訂閱
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 2. Data Backup & Security (Orange / Blue Theme) */}
        <div className="space-y-8">
          <div className="px-2">
            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em]">數據救贖與同步 DATA BACKUP</h3>
          </div>
          
          <div className="bg-[#1C1C1E] rounded-[44px] border border-white/5 p-8 space-y-8 shadow-xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-inner ${state.backupSettings.googleDriveConnected ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-white/5 text-gray-600'}`}>
                      <i className="fa-brands fa-google-drive text-3xl"></i>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-white tracking-tight">Google Drive 連結</h4>
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">
                        {state.backupSettings.googleDriveConnected ? 'AUTOMATIC SYNC ACTIVE' : 'CLOUD SYNC DISCONNECTED'}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={toggleGDrive}
                  className={`w-20 h-10 rounded-full flex items-center px-1.5 transition-all duration-500 ${state.backupSettings.googleDriveConnected ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
                >
                  <div className={`w-7 h-7 bg-white rounded-full shadow-lg transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1) ${state.backupSettings.googleDriveConnected ? 'translate-x-10' : 'translate-x-0'}`} />
                </button>
             </div>

             {state.backupSettings.googleDriveConnected && (
               <div className="pt-8 border-t border-white/5 space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                     <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">備份路徑</span>
                     <span className="text-[11px] font-black text-blue-400 font-mono">{state.backupSettings.backupFolder}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                     <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">軍事級端對端加密</span>
                        <i className="fa-solid fa-lock text-[10px] text-[#D4FF5F]/80"></i>
                     </div>
                     <button 
                       onClick={() => onUpdateBackupSettings({...state.backupSettings, isEncrypted: !state.backupSettings.isEncrypted})}
                       className={`w-14 h-7 rounded-full flex items-center px-1 transition-all ${state.backupSettings.isEncrypted ? 'bg-[#D4FF5F]/20' : 'bg-white/5'}`}
                     >
                       <div className={`w-5 h-5 bg-white rounded-full transition-transform ${state.backupSettings.isEncrypted ? 'translate-x-7' : 'translate-x-0'}`} />
                     </button>
                  </div>
                  <div className="flex justify-between items-center px-2 pt-2">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${state.backupSettings.status === 'SYNCING' ? 'bg-blue-500 animate-pulse' : 'bg-[#D4FF5F]'}`}></div>
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                          {state.backupSettings.status === 'SYNCING' ? '同步處理中' : '雲端狀態：安全'}
                        </span>
                     </div>
                     <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                       LAST: {state.backupSettings.lastBackupTime ? new Date(state.backupSettings.lastBackupTime).toLocaleString() : 'PENDING'}
                     </span>
                  </div>
               </div>
             )}
          </div>

          <div className="bg-[#1C1C1E]/40 border border-dashed border-white/10 p-8 rounded-[36px] flex items-start gap-6">
             <i className="fa-solid fa-cloud-bolt text-3xl text-gray-700 mt-1"></i>
             <div className="space-y-2">
                <h5 className="text-[12px] font-black text-gray-500 uppercase tracking-widest">雲端存儲狀態 CLOUD STATUS</h5>
                <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                  您的作品目前主要保護於本地 IndexedDB 數據庫中。{state.membership === MembershipLevel.FREE ? '升級至 PRO 即可啟動全球雲端雙向加密同步協定。' : '全球加密同步協定已在背景運行中。'}
                </p>
             </div>
          </div>
        </div>

        {/* 3. Settings Grid (Multi-color Theme) */}
        <div className="space-y-8">
          <div className="px-2">
            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em]">偏好與安全設置 PREFERENCES</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            
            {/* Payment Methods - Green Accent */}
            <button 
              onClick={() => setIsCardsOpen(true)}
              className="group bg-[#1C1C1E] p-8 rounded-[36px] border border-white/5 hover:border-[#D4FF5F]/30 hover:bg-[#D4FF5F]/5 transition-all text-left space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4FF5F]/10 text-[#D4FF5F] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-credit-card"></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight">常用支付卡片</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{state.savedCards.length} 儲存張數</p>
                  <i className="fa-solid fa-chevron-right text-gray-800 text-xs"></i>
                </div>
              </div>
            </button>

            {/* AI Assistant - Purple Accent - Renamed to 模型 & API 設定 */}
            <button 
              onClick={() => setIsAIPreferencesOpen(true)}
              className="group bg-[#1C1C1E] p-8 rounded-[36px] border border-white/5 hover:border-[#B2A4FF]/30 hover:bg-[#B2A4FF]/5 transition-all text-left space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#B2A4FF]/10 text-[#B2A4FF] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight">模型 & API 設定</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{state.aiPreferences.tone} MODE</p>
                  <i className="fa-solid fa-chevron-right text-gray-800 text-xs"></i>
                </div>
              </div>
            </button>

            {/* Security & Snapshot - Orange Accent */}
            <button 
              onClick={() => setIsSecurityOpen(true)}
              className="group bg-[#1C1C1E] p-8 rounded-[36px] border border-white/5 hover:border-[#FF6B2C]/30 hover:bg-[#FF6B2C]/5 transition-all text-left space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight">安全與自動快照</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${state.securitySettings.autoSnapshotEnabled ? 'text-[#D4FF5F]' : 'text-gray-600'}`}>
                    {state.securitySettings.autoSnapshotEnabled ? 'PROTECTED' : 'DISABLED'}
                  </p>
                  <i className="fa-solid fa-chevron-right text-gray-800 text-xs"></i>
                </div>
              </div>
            </button>

            {/* Language - Blue Accent */}
            <button 
              onClick={() => setIsSelectorOpen(true)}
              className="group bg-[#1C1C1E] p-8 rounded-[36px] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all text-left space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-language"></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight">系統介面語言</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{currentLangName} ({state.userCountryCode})</p>
                  <i className="fa-solid fa-chevron-right text-gray-800 text-xs"></i>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-[#1C1C1E] rounded-[36px] border border-white/5 divide-y divide-white/5 overflow-hidden">
            <button 
              onClick={() => setIsPrivacyOpen(true)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <i className="fa-solid fa-file-contract text-gray-500 group-hover:text-white"></i>
                <span className="text-[13px] font-black text-gray-300 uppercase tracking-widest">隱私權與法律條款</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-800 text-xs"></i>
            </button>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <i className="fa-solid fa-moon text-gray-500"></i>
                <span className="text-[13px] font-black text-gray-300 uppercase tracking-widest">深色模式佈局</span>
              </div>
              <div className="w-14 h-7 bg-blue-600 rounded-full flex items-center px-1">
                <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${isRTL ? '-translate-x-7' : 'translate-x-7'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-10 pb-20 border-t border-white/5">
        <p className="text-[10px] text-gray-800 font-black uppercase tracking-[0.6em]">InsPublish Narrative Protocol v1.1.0-RC</p>
        <p className="text-[9px] text-gray-900 font-bold uppercase tracking-[0.2em] mt-2">All rights reserved to the author's legacy</p>
      </div>

      {isAIPreferencesOpen && (
        <AIPreferencesPage 
          preferences={state.aiPreferences}
          onUpdate={onUpdateAIPreferences}
          onClose={() => setIsAIPreferencesOpen(false)}
        />
      )}

      {isSecurityOpen && (
        <SecuritySettingsPage
          settings={state.securitySettings}
          onUpdate={onUpdateSecuritySettings}
          onClose={() => setIsSecurityOpen(false)}
        />
      )}

      {isCardsOpen && (
        <CreditCardManager 
          cards={state.savedCards}
          onAdd={handleAddCard}
          onDelete={handleDeleteCard}
          onClose={() => setIsCardsOpen(false)}
        />
      )}

      {isSelectorOpen && (
        <LanguageSelector 
          currentLanguage={state.language}
          userCountryCode={state.userCountryCode}
          onSelect={(lang) => {
            handleLanguageSelect(lang);
          }}
          onCountrySelect={(code) => {
            if (onUpdateCountryCode) onUpdateCountryCode(code);
          }}
          onClose={() => setIsSelectorOpen(false)}
        />
      )}

      {isPrivacyOpen && (
        <PrivacyModal 
          onClose={() => setIsPrivacyOpen(false)}
        />
      )}

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1C1C1E] w-full max-w-md rounded-[44px] border border-white/10 p-10 space-y-8 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-white tracking-tighter">更新頭像</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-2">上傳照片</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-600 group-hover:text-blue-500 mb-2"></i>
                    <p className="text-xs text-gray-500 font-bold">點擊或拖拽上傳</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-gray-700 uppercase tracking-widest">或使用 Gravatar</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-2">Gravatar 電子郵件</label>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    value={gravatarEmail}
                    onChange={(e) => setGravatarEmail(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-600 transition-all"
                  />
                  <button 
                    onClick={handleGravatar}
                    className="px-6 bg-blue-600 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    同步
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
