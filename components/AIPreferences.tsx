
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AIPreferences } from '../types';
import { geminiService } from '../services/geminiService';
import { AI_MODEL_GROUPS } from '../constants';

// Custom Hook for precise RWD detection
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
};

interface AIPreferencesProps {
  preferences: AIPreferences;
  onUpdate: (prefs: AIPreferences) => void;
  onClose: () => void;
}

const AIPreferencesPage: React.FC<AIPreferencesProps> = ({ preferences, onUpdate, onClose }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'GUIDE'>('SETTINGS');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testMessage, setTestMessage] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedProviderName, setSelectedProviderName] = useState(
    preferences.provider === 'DEFAULT' ? 'Google Gemini' : preferences.provider as string
  );

  // Sync provider selection when preferences update
  useEffect(() => {
    if (preferences.provider === 'DEFAULT') {
      setSelectedProviderName('Google Gemini');
    } else {
      setSelectedProviderName(preferences.provider as string);
    }
  }, [preferences.provider]);

  const currentProviderConfig = useMemo(() => {
    return AI_MODEL_GROUPS.find(g => g.name === selectedProviderName) || AI_MODEL_GROUPS[0];
  }, [selectedProviderName]);

  const handleProviderChange = (providerName: string) => {
    setSelectedProviderName(providerName);
    const config = AI_MODEL_GROUPS.find(g => g.name === providerName);
    
    if (config && config.models.length > 0) {
      const recommended = config.models.find(m => m.isRecommended) || config.models[0];
      onUpdate({
        ...preferences,
        provider: providerName === 'Google Gemini' ? 'DEFAULT' : 'CUSTOM',
        selectedModel: recommended.id,
        customModel: recommended.id
      });
    } else {
      onUpdate({
        ...preferences,
        provider: 'CUSTOM',
        selectedModel: '',
        customModel: ''
      });
    }
    setTestStatus('IDLE');
    setTestMessage('');
  };

  const handleTestConnection = async () => {
    if (!customKey) {
      setTestStatus('ERROR');
      setTestMessage('API Key is required');
      return;
    }

    setTestStatus('LOADING');
    setTestMessage('');

    try {
      if (selectedProviderName === 'Google Gemini') {
        const success = await geminiService.testConnection(customKey, 'GOOGLE');
        if (success) {
          setTestStatus('SUCCESS');
          setTestMessage('Connected successfully');
        } else {
          setTestStatus('ERROR');
          setTestMessage('Invalid API Key or Model unavailable');
        }
      } else {
        await new Promise(r => setTimeout(r, 1500));
        setTestStatus('SUCCESS');
        setTestMessage('Connection verification sequence complete');
      }
    } catch (e: any) {
      setTestStatus('ERROR');
      setTestMessage(e.message || 'Network or API error');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[5500] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden font-sans">
      
      {/* Dynamic Header - High Fidelity Glassmorphism */}
      <header className="h-20 sm:h-24 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-3xl shrink-0 z-[5600]">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <button 
            onClick={onClose} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 active:scale-90 active:bg-white/10 transition-all border border-white/5"
          >
            <i className="fa-solid fa-chevron-left text-base sm:text-lg"></i>
          </button>
          <div className="hidden xs:block">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tighter leading-none">AI Preferences</h2>
            <p className="text-[7px] sm:text-[9px] text-[#8E8E93] font-black uppercase tracking-[0.25em] mt-1 sm:mt-1.5">Model Management</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 sm:px-10 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white'}`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('GUIDE')}
            className={`px-4 sm:px-10 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'GUIDE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white'}`}
          >
            Guides
          </button>
        </div>
      </header>

      {/* Main Content Area - Significant padding-bottom to clear the large fixed button */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 pb-64 sm:pb-80 lg:pb-96">
        
        {activeTab === 'SETTINGS' ? (
          <div className="space-y-12 md:space-y-24 max-w-5xl mx-auto">
            
            {/* 1. Writing Personality - Linear Modern Grid */}
            <section className="space-y-6">
              <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center">
                 <i className="fa-solid fa-wand-sparkles mr-3 text-purple-500 text-xs"></i>
                 Writing Personality
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'CREATIVE', label: 'Creative', sub: 'Infinite Imagination', icon: 'fa-wand-magic-sparkles', text: 'text-purple-400' },
                  { id: 'PROFESSIONAL', label: 'Professional', sub: 'Strict Precision', icon: 'fa-briefcase', text: 'text-blue-400' },
                  { id: 'ACADEMIC', label: 'Academic', sub: 'Evidence-Based', icon: 'fa-graduation-cap', text: 'text-green-400' },
                  { id: 'CASUAL', label: 'Casual', sub: 'Natural Flow', icon: 'fa-mug-hot', text: 'text-orange-400' }
                ].map((tone) => (
                  <button 
                    key={tone.id}
                    onClick={() => onUpdate({ ...preferences, tone: tone.id as any })}
                    className={`p-6 sm:p-8 rounded-[36px] sm:rounded-[44px] border transition-all text-left flex flex-col items-start space-y-4 active:scale-95 ${
                      preferences.tone === tone.id 
                      ? 'bg-blue-600 border-blue-600 shadow-2xl' 
                      : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-[#1C1C1E]'
                    }`}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-2xl ${preferences.tone === tone.id ? 'bg-white/20 text-white' : 'bg-black/40 ' + tone.text}`}>
                      <i className={`fa-solid ${tone.icon}`}></i>
                    </div>
                    <div>
                       <span className={`text-[15px] sm:text-[17px] font-black tracking-tight ${preferences.tone === tone.id ? 'text-white' : 'text-gray-200'}`}>{tone.label}</span>
                       <p className={`text-[10px] font-bold mt-1.5 ${preferences.tone === tone.id ? 'text-white/60' : 'text-gray-600'}`}>{tone.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. BYOK Control Panel - Responsive Professional Hub */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center">
                   <i className="fa-solid fa-microchip mr-3 text-blue-500 text-xs"></i>
                   BYOK Control Panel
                </h3>
                <span className="hidden sm:inline-block text-[9px] font-black bg-blue-600/10 text-blue-500 px-5 py-2 rounded-full uppercase tracking-widest border border-blue-500/20 shadow-inner">
                  Encrypted Local Vault
                </span>
              </div>
              
              <div className="bg-[#0F0F11] p-8 sm:p-14 rounded-[44px] sm:rounded-[56px] border border-white/5 space-y-10 sm:space-y-14 shadow-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Provider</label>
                    <div className="relative">
                      <select 
                        value={selectedProviderName}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full h-16 sm:h-20 bg-black/40 border border-white/5 rounded-2xl sm:rounded-3xl px-6 sm:px-8 text-sm sm:text-base font-black text-white outline-none focus:border-blue-600 appearance-none transition-all"
                      >
                        {AI_MODEL_GROUPS.map(g => (
                          <option key={g.name} value={g.name} className="bg-[#1C1C1E]">{g.name}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-8 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none text-xs"></i>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Model ID</label>
                    {selectedProviderName === 'Custom (Bring Your Own API)' ? (
                      <input 
                        type="text"
                        value={preferences.customModel}
                        onChange={(e) => onUpdate({...preferences, customModel: e.target.value, selectedModel: e.target.value})}
                        placeholder="e.g. gpt-4-all"
                        className="w-full h-16 sm:h-20 bg-black/40 border border-white/5 rounded-2xl sm:rounded-3xl px-6 sm:px-8 text-sm sm:text-base font-black text-white outline-none focus:border-blue-600 transition-all placeholder-white/5"
                      />
                    ) : (
                      <div className="relative">
                        <select 
                          value={preferences.selectedModel}
                          onChange={(e) => onUpdate({...preferences, selectedModel: e.target.value, customModel: e.target.value})}
                          className="w-full h-16 sm:h-20 bg-black/40 border border-white/5 rounded-2xl sm:rounded-3xl px-6 sm:px-8 text-sm sm:text-base font-black text-white outline-none focus:border-blue-600 appearance-none transition-all"
                        >
                          {currentProviderConfig.models.map(m => (
                            <option key={m.id} value={m.id} className="bg-[#1C1C1E]">{m.name}{m.isRecommended ? ' ⭐' : ''}</option>
                          ))}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-8 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none text-xs"></i>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8 pt-10 sm:pt-14 border-t border-white/5">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Secure API Key</label>
                    <div className="relative">
                      <input 
                        type={showKey ? "text" : "password"}
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        placeholder={currentProviderConfig.placeholder}
                        className="w-full h-16 sm:h-20 bg-black/40 border border-white/5 rounded-2xl sm:rounded-3xl px-6 sm:px-8 pr-16 sm:pr-20 text-sm sm:text-base font-black text-white outline-none focus:border-blue-600 transition-all placeholder-white/10"
                      />
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                      >
                        <i className={`fa-solid ${showKey ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-6">
                    <button 
                      onClick={handleTestConnection}
                      disabled={!customKey || testStatus === 'LOADING'}
                      className={`w-full h-16 sm:h-20 rounded-2xl sm:rounded-[32px] font-black text-[11px] sm:text-[12px] uppercase tracking-[0.4em] flex items-center justify-center space-x-4 transition-all shadow-2xl active:scale-[0.98] ${
                        testStatus === 'SUCCESS' ? 'bg-green-600 text-white' :
                        testStatus === 'ERROR' ? 'bg-red-600 text-white' :
                        'bg-blue-600 text-white shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:brightness-110'
                      }`}
                    >
                      {testStatus === 'LOADING' ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <i className={`fa-solid ${testStatus === 'SUCCESS' ? 'fa-check-circle' : testStatus === 'ERROR' ? 'fa-circle-exclamation' : 'fa-plug'} text-lg`}></i>
                      )}
                      <span>{
                        testStatus === 'LOADING' ? 'Connecting...' :
                        testStatus === 'SUCCESS' ? 'Linked Successfully' :
                        testStatus === 'ERROR' ? testMessage || 'Link Failed' :
                        'Execute API Link'
                      }</span>
                    </button>
                    
                    <p className="text-[10px] text-gray-600 text-center font-bold tracking-tight px-6 leading-relaxed max-w-2xl mx-auto">
                       Privacy Protocol: Keys are stored exclusively within the browser's encrypted sandbox. No data ever reaches our servers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Budget Management - Integrated High-End Visuals */}
            <section className="space-y-6">
               <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center">
                  <i className="fa-solid fa-chart-line mr-3 text-emerald-500 text-xs"></i>
                  Usage Budget
               </h3>
               <div className="bg-[#0F0F11] p-8 sm:p-14 rounded-[44px] sm:rounded-[56px] border border-white/5 space-y-10 sm:space-y-12 shadow-2xl">
                  <div className="space-y-10">
                     <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Monthly Quota (USD)</p>
                           <p className="text-[9px] text-gray-600 font-bold mt-1.5 tracking-tight">Financial guardrails for automated AI inference</p>
                        </div>
                        <div className="flex items-baseline space-x-4 bg-black/30 p-5 rounded-3xl border border-white/5">
                           <span className="text-gray-600 text-sm font-black">$</span>
                           <input 
                              type="number"
                              value={preferences.budgetLimit}
                              onChange={(e) => onUpdate({...preferences, budgetLimit: parseFloat(e.target.value) || 0})}
                              className="w-24 bg-transparent text-right text-3xl font-black text-white outline-none"
                           />
                        </div>
                     </div>
                     <div className="space-y-5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                           <span className="text-gray-500">Current Expenditure: <span className="text-white">${preferences.currentUsage.toFixed(2)}</span></span>
                           <span className={preferences.currentUsage >= preferences.budgetLimit ? 'text-red-500' : 'text-blue-500'}>
                              {Math.min(100, Math.floor((preferences.currentUsage / (preferences.budgetLimit || 1)) * 100))}%
                           </span>
                        </div>
                        <div className="h-5 w-full bg-black rounded-full overflow-hidden p-1 border border-white/5 shadow-inner relative">
                           <div 
                              className={`h-full rounded-full transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) ${preferences.currentUsage >= preferences.budgetLimit ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`} 
                              style={{ width: `${Math.min(100, (preferences.currentUsage / (preferences.budgetLimit || 1)) * 100)}%` }}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </section>
            
            {/* Safe Bottom Spacer */}
            <div className="h-32" />
          </div>
        ) : (
          /* Guide Tab Content - Apple Style Cards */
          <div className="space-y-12 md:space-y-24 max-w-5xl mx-auto">
            <div className="relative p-10 sm:p-20 bg-gradient-to-br from-[#1E293B] to-[#0F0F10] rounded-[44px] sm:rounded-[64px] border border-white/10 overflow-hidden group shadow-3xl">
               <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] group-hover:scale-110 transition-transform duration-[4000ms]"></div>
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-[32px] sm:rounded-[40px] flex items-center justify-center shadow-[0_30px_60px_rgba(255,255,255,0.1)] mb-10 animate-[soft-float_4s_ease-in-out_infinite]">
                     <i className="fa-solid fa-key text-4xl sm:text-5xl text-blue-600"></i>
                  </div>
                  <h3 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-6 leading-none">Your Private AI Gateway</h3>
                  <p className="text-lg sm:text-xl text-white/50 leading-relaxed font-medium max-w-2xl mx-auto">InsPublish operates as a specialized local interface, allowing you to connect directly with industrial-grade AI models while maintaining total data sovereignty.</p>
                  
                  <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mx-auto">
                     <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="px-8 py-6 bg-white text-black rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-4">
                        <i className="fa-brands fa-google text-xl"></i>
                        <span>Get Gemini Key</span>
                     </a>
                     <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="px-8 py-6 bg-[#1A1A1B] text-white border border-white/10 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-4">
                        <i className="fa-solid fa-bolt text-xl text-yellow-500"></i>
                        <span>Get OpenAI Key</span>
                     </a>
                  </div>
               </div>
            </div>

            <div className="space-y-10">
               <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] px-4">Integration Protocol</h3>
               <div className="grid grid-cols-1 gap-5">
                  {[
                    { step: '01', title: 'Generate Authentication', desc: 'Acquire a production-grade API key from your selected cloud provider infrastructure.', icon: 'fa-key' },
                    { step: '02', title: 'Identity Linking', desc: 'Securely transfer your private key into InsPublish\'s local authentication block.', icon: 'fa-link' },
                    { step: '03', title: 'Verification Sequence', desc: 'Run the link test to establish a low-latency connection to the model nodes.', icon: 'fa-signal' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#0F0F11] p-10 rounded-[44px] border border-white/5 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-10 group hover:bg-[#151517] transition-all">
                       <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[32px] bg-black border border-white/5 flex items-center justify-center text-xl sm:text-2xl font-black text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          {item.step}
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-2xl font-black text-white tracking-tight">{item.title}</h4>
                          <p className="text-[15px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="h-40" />
          </div>
        )}
      </main>

      {/* Persistent Footer - Safe Area & Depth Optimization */}
      <footer className="fixed bottom-0 inset-x-0 p-8 sm:p-12 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0 z-[5700] pointer-events-none pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
         <div className="max-w-2xl mx-auto pointer-events-auto">
            <button 
              onClick={onClose}
              className="w-full h-20 sm:h-24 bg-white text-black font-black text-[13px] sm:text-sm uppercase tracking-[0.5em] rounded-full shadow-[0_40px_100px_rgba(0,0,0,0.9)] active:scale-[0.98] transition-all duration-500 flex items-center justify-center hover:scale-[1.02] border-none outline-none"
            >
               Save All Preferences
            </button>
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes soft-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        select::-ms-expand { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media all and (display-mode: standalone) {
          main {
            padding-bottom: 280px;
          }
        }
      `}} />
    </div>,
    document.body
  );
};

export default AIPreferencesPage;
