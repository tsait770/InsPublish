
import React, { useState } from 'react';
import { CreditCard } from '../types';

interface CreditCardManagerProps {
  cards: CreditCard[];
  onAdd: (card: CreditCard) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CreditCardManager: React.FC<CreditCardManagerProps> = ({ cards, onAdd, onDelete, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    type: 'MASTERCARD' as 'MASTERCARD' | 'VISA'
  });

  const handleAdd = () => {
    if (!formData.number || !formData.name || !formData.expiry) return;
    onAdd({
      id: 'card-' + Date.now(),
      ...formData
    });
    setFormData({ number: '', name: '', expiry: '', cvv: '', type: 'MASTERCARD' });
    setIsAdding(false);
  };

  const formatCardNumber = (num: string) => {
    return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\//g, '').replace(/(\d{2})/, '$1/').slice(0, 5);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      <header className="h-24 px-8 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-3xl shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">常用信用卡</h2>
            <p className="text-[9px] text-[#8E8E93] font-black uppercase tracking-[0.2em] mt-0.5">PAYMENT METHODS</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <i className="fa-solid fa-plus text-white"></i>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-8 pb-48">
        <div className="max-w-md mx-auto space-y-12">
          {cards.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[44px] opacity-20">
               <i className="fa-solid fa-credit-card text-6xl mb-6"></i>
               <p className="text-[10px] font-black uppercase tracking-widest">尚未新增任何卡片</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              {cards.map((card, idx) => (
                <div key={card.id} className="relative group">
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <p className="heading_8264">{card.type}</p>
                        <svg className="logo_card" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                          <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"></path>
                          <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"></path>
                          <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"></path>
                        </svg>
                        <svg version="1.1" className="chip_card" width="40px" height="40px" viewBox="0 0 50 50">
                          <rect fill="#FADE4B" x="10" y="15" width="30" height="20" rx="4" />
                          <line x1="20" y1="15" x2="20" y2="35" stroke="black" strokeWidth="0.5" />
                          <line x1="30" y1="15" x2="30" y2="35" stroke="black" strokeWidth="0.5" />
                          <line x1="10" y1="25" x2="40" y2="25" stroke="black" strokeWidth="0.5" />
                        </svg>
                        <p className="number_card">{card.number}</p>
                        <p className="valid_thru_card">VALID THRU</p>
                        <p className="date_8264">{card.expiry}</p>
                        <p className="name_card">{card.name}</p>
                      </div>
                      <div className="flip-card-back">
                        <div className="strip_card"></div>
                        <div className="mstrip_card"></div>
                        <div className="sstrip_card">
                          <p className="code_card">***</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(card.id)}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isAdding && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-lg bg-[#1C1C1E] rounded-t-[44px] sm:rounded-[44px] border border-white/5 overflow-hidden shadow-3xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
            <header className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-2xl font-black text-white">新增信用卡</h2>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">SECURE WALLET ENCRYPTION</p>
               </div>
               <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-full bg-white/5 text-gray-500"><i className="fa-solid fa-xmark"></i></button>
            </header>
            
            <main className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">卡號 CARD NUMBER</label>
                <input 
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: formatCardNumber(e.target.value)})}
                  className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-2xl text-xl font-black text-white tracking-widest outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">有效期限 EXPIRY</label>
                  <input 
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={e => setFormData({...formData, expiry: formatExpiry(e.target.value)})}
                    className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-2xl text-lg font-black text-white outline-none focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">安全碼 CVV</label>
                  <input 
                    type="password"
                    placeholder="***"
                    maxLength={3}
                    value={formData.cvv}
                    onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-2xl text-lg font-black text-white outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">持卡人姓名 HOLDER NAME</label>
                <input 
                  type="text"
                  placeholder="BRUCE WAYNE"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-2xl text-lg font-black text-white outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">卡片類型 TYPE</label>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setFormData({...formData, type: 'MASTERCARD'})}
                    className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'MASTERCARD' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}
                  >
                    Mastercard
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, type: 'VISA'})}
                    className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'VISA' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}
                  >
                    Visa
                  </button>
                </div>
              </div>
            </main>

            <footer className="p-10 shrink-0 bg-[#0F0F10] border-t border-white/5">
              <button 
                onClick={handleAdd}
                className="w-full py-7 bg-blue-600 text-white font-black text-sm uppercase tracking-[0.4em] rounded-[32px] shadow-2xl active:scale-[0.97] transition-all"
              >
                確 認 新 增 卡 片
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardManager;
