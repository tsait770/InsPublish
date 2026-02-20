
import React, { useState } from 'react';

interface CollaborationPanelProps {
  onClose: () => void;
}

enum PermissionLevel {
  EDITOR = 'EDITOR',
  COMMENTER = 'COMMENTER',
  VIEWER = 'VIEWER'
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<PermissionLevel>(PermissionLevel.EDITOR);
  const [isSending, setIsSending] = useState(false);

  const permissions = [
    {
      id: PermissionLevel.EDITOR,
      label: '編輯者',
      sub: '可以修改內容與章節',
      icon: 'fa-pen-to-square',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    {
      id: PermissionLevel.COMMENTER,
      label: '評論者',
      sub: '僅能查看並提供意見',
      icon: 'fa-comment-dots',
      color: 'bg-green-500/10 text-green-400 border-green-500/30'
    },
    {
      id: PermissionLevel.VIEWER,
      label: '檢視者',
      sub: '僅具備閱讀權限',
      icon: 'fa-eye',
      color: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  ];

  const handleInvite = () => {
    if (!email) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#1C1C1E] rounded-t-[44px] sm:rounded-[44px] p-8 sm:p-10 flex flex-col space-y-10 animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-black tracking-tight text-white">協作邀請</h2>
             <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mt-1">INVITE CO-AUTHORS</p>
           </div>
           <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:bg-white/5">
             <i className="fa-solid fa-xmark text-xl"></i>
           </button>
        </div>

        {/* Email Input */}
        <div className="space-y-4">
           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">電子郵件帳號</label>
           <div className="relative">
             <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="author@inspublish.com" 
                className="w-full bg-white/5 border border-white/10 h-16 px-6 rounded-2xl text-lg font-bold outline-none focus:border-blue-500 transition-all text-white"
             />
             <i className="fa-solid fa-envelope absolute right-6 top-1/2 -translate-y-1/2 text-gray-600"></i>
           </div>
        </div>

        {/* Permission Grid */}
        <div className="space-y-4">
           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">權限等級</label>
           <div className="grid grid-cols-1 gap-3">
              {permissions.map((p) => (
                 <button 
                    key={p.id}
                    onClick={() => setLevel(p.id)}
                    className={`group relative p-6 rounded-3xl border transition-all text-left flex items-center space-x-5 ${level === p.id ? 'bg-[#7b61ff] border-[#7b61ff] shadow-lg shadow-purple-900/20' : 'bg-white/5 border-white/5'}`}
                 >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${level === p.id ? 'bg-white text-[#7b61ff]' : p.color.split(' ')[0] + ' ' + p.color.split(' ')[1]}`}>
                       <i className={`fa-solid ${p.icon}`}></i>
                    </div>
                    <div>
                       <h3 className={`font-bold transition-colors ${level === p.id ? 'text-white' : 'text-gray-200'}`}>{p.label}</h3>
                       <p className={`text-[10px] font-medium transition-colors ${level === p.id ? 'text-white/70' : 'text-gray-500'}`}>{p.sub}</p>
                    </div>
                    {level === p.id && (
                       <div className="absolute right-6 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                         <i className="fa-solid fa-check text-[#7b61ff] text-[10px]"></i>
                       </div>
                    )}
                 </button>
              ))}
           </div>
        </div>

        <button 
           onClick={handleInvite}
           disabled={!email || isSending}
           className={`w-full py-6 rounded-[30px] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 ${!email || isSending ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 active:scale-95'}`}
        >
           {isSending ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
           ) : (
             <i className="fa-solid fa-paper-plane text-xs"></i>
           )}
           <span>{isSending ? '正在傳送...' : '發送協作邀請'}</span>
        </button>
        
        <p className="text-center text-[9px] text-gray-600 uppercase font-black tracking-widest pb-4">
           成員將會收到一封包含專案存取連結的電子郵件
        </p>
      </div>
    </div>
  );
};

export default CollaborationPanel;
