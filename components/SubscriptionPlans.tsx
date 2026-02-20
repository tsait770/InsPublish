
import React from 'react';
import { MembershipLevel } from '../types';

interface SubscriptionPlansProps {
  currentMembership: MembershipLevel;
  onSelectPlan: (plan: { id: MembershipLevel, name: string, price: string }) => void;
  onClose: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentMembership, onSelectPlan, onClose }) => {
  const plans = [
    {
      id: MembershipLevel.FREE,
      name: 'Safe Drafting',
      price: '$0',
      period: 'Forever',
      description: 'Your work is always safe. Start capturing your first ideas.',
      features: ['10 Local Projects', 'Basic AI Assistance', 'Offline Protection', 'Standard Export (TXT/MD)'],
      color: 'bg-white/5',
      accent: 'text-gray-400'
    },
    {
      id: MembershipLevel.PRO,
      name: 'Serious Writing',
      price: '$4.99',
      period: 'Monthly',
      popular: true,
      description: 'Your work is protected over time. Advanced tools for deep narrative.',
      features: ['Unlimited Cloud Projects', 'Gemini Pro Analysis', '1-Min Auto Snapshot', 'Version History Backups', 'Google Drive Sync'],
      color: 'bg-blue-600/10',
      accent: 'text-blue-500'
    },
    {
      id: MembershipLevel.PREMIUM,
      name: 'Professional Delivery',
      price: '$12.99',
      period: 'Monthly',
      description: 'Your work is delivered professionally to the world.',
      features: ['Global One-Click Delivery', 'No Publishing Knowledge Needed', 'Professional Submission Standards', 'Multi-user Collaboration', 'Priority Publisher Access'],
      color: 'bg-amber-500/10',
      accent: 'text-amber-500'
    }
  ];

  const testimonials = [
    { text: "InsPublish is the bridge I needed to reach my audience professionally.", author: "SARAH J.", title: "PUBLISHED AUTHOR", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
    { text: "InsPublish 不只是寫作工具，它讓我把腦中的想法完美保存，並輕鬆交付給讀者。", author: "MICHAEL L.", title: "NOVELIST", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
    { text: "每一次使用 InsPublish，我都覺得自己像有了私人出版助理，創作與出版變得無縫而簡單。", author: "SOPHIA K.", title: "FICTION WRITER", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop" },
    { text: "InsPublish 讓我的文字有了永續的生命，從寫作到出版，一切都如此流暢。", author: "DAVID P.", title: "JOURNALIST", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" },
    { text: "我從未想過分享作品可以如此輕鬆。InsPublish 讓我的創作觸及全球讀者。", author: "LUCY H.", title: "AWARD-WINNING POET", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
    { text: "InsPublish 不僅保護我的靈感，更把它轉化為可見的影響力。", author: "JAMES W.", title: "NON-FICTION AUTHOR", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" },
    { text: "從草稿到出版，InsPublish 讓整個流程簡單到令人驚訝，我再也不用擔心技術細節。", author: "EMILY R.", title: "NOVELIST", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" },
    { text: "這個平台讓我專注於寫作本身，而不是繁瑣的出版程序，InsPublish 成了我的創作夥伴。", author: "OLIVER S.", title: "SHORT STORY WRITER", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop" },
    { text: "InsPublish 幫我把散落的文字串成完整作品，並自信地分享給世界。", author: "HANNAH M.", title: "CHILDREN’S BOOK AUTHOR", img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&h=300&fit=crop" },
    { text: "有了 InsPublish，我能在最短時間內把靈感化為實際出版作品，讀者反應超乎預期。", author: "ALEX T.", title: "CREATIVE NON-FICTION WRITER", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop" },
    { text: "InsPublish 不只是工具，它是我與讀者之間最直接的橋樑。", author: "ELENA R.", title: "AWARD-WINNING AUTHOR", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop" }
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <header className="h-24 px-8 pt-8 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Complete Your Journey</h2>
            <p className="text-[9px] text-[#8E8E93] font-black uppercase tracking-[0.2em] mt-0.5">FROM MANUSCRIPT TO THE WORLD</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6">
             <h3 className="text-4xl font-black text-white tracking-tighter">We don’t just help you write. We deliver your work.</h3>
             <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xl mx-auto">
               Most writing apps stop at files. InsPublish completes the journey — from manuscript to real global publishing channels.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-8 rounded-[44px] border transition-all flex flex-col h-full ${plan.popular ? 'bg-gradient-to-br from-blue-900/20 to-black border-blue-500 shadow-[0_30px_60px_rgba(37,99,235,0.15)]' : 'bg-[#1C1C1E] border-white/5'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-6 py-2 rounded-full uppercase tracking-widest">
                    Best Value
                  </span>
                )}

                <div className="mb-8">
                   <h4 className={`text-sm font-black uppercase tracking-widest ${plan.accent}`}>{plan.name}</h4>
                   <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="ml-2 text-[10px] font-bold text-gray-600 uppercase">/ {plan.period}</span>
                   </div>
                   <p className="mt-4 text-xs text-gray-400 leading-relaxed min-h-[40px]">{plan.description}</p>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                   {plan.features.map((f, i) => (
                     <div key={i} className="flex items-center space-x-3">
                        <i className={`fa-solid fa-circle-check text-xs ${plan.accent}`}></i>
                        <span className="text-[11px] font-medium text-gray-300">{f}</span>
                     </div>
                   ))}
                </div>

                <button 
                  onClick={() => onSelectPlan({ id: plan.id, name: plan.name, price: plan.price })}
                  disabled={currentMembership === plan.id}
                  className={`w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] transition-all active:scale-95 ${
                    currentMembership === plan.id 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : plan.id === MembershipLevel.PREMIUM ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/20' : plan.popular ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-black'
                  }`}
                >
                  {currentMembership === plan.id ? 'Current Active' : plan.id === MembershipLevel.PREMIUM ? 'Unlock Global Publishing' : 'Upgrade Plan'}
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-12">
             <h4 className="text-[12px] font-black text-gray-600 uppercase tracking-[0.4em] text-center mb-10">What Professional Authors Say</h4>
             <div className="grid grid-cols-1 gap-6">
                {testimonials.map((t, idx) => {
                  // 根據用戶截圖實作邊框邏輯
                  const isWhiteGlow = (idx === 3 || idx === 6 || idx === 9); // David P., Emily R., Alex T.
                  const isBlueBorder = (idx === 1 || idx === 5 || idx === 10); // Michael L., James W., Elena R.
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-10 rounded-[44px] border flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-6 md:space-y-0 md:space-x-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all bg-[#1C1C1E] ${
                        isWhiteGlow 
                        ? 'border-white ring-4 ring-white/10' 
                        : isBlueBorder 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                        : 'border-white/5'
                      }`} 
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 shadow-2xl bg-black/20 ${isWhiteGlow ? 'border-white' : isBlueBorder ? 'border-blue-500' : 'border-white/10'}`}>
                         <img src={t.img} alt={t.author} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-4">
                         <p className="text-white font-bold text-lg leading-relaxed italic">"{t.text}"</p>
                         <div className="flex flex-col">
                            <p className="text-blue-500 font-black text-[12px] uppercase tracking-[0.2em]">— {t.author}</p>
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1">{t.title}</p>
                         </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPlans;
