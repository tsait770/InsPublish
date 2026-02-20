
import React, { useState } from 'react';

interface CheckoutModalProps {
  planName: string;
  price: string;
  onSuccess: () => void;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ planName, price, onSuccess, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* 根據參考圖優化後的結帳面板容器 */}
      <div className="relative w-full max-w-[450px] bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <form className="p-8 flex flex-col gap-6" onClick={(e) => e.stopPropagation()} onSubmit={handleCheckout}>
          
          <div className="flex justify-between items-center mb-2">
             <div>
               <h2 className="text-xl font-black text-[#121212] tracking-tight text-left">結帳付款</h2>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 text-left">
                 {planName} · {price}
               </p>
             </div>
             <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>

          {/* 最佳化比例後的三個支付 Logo 按鈕區域 */}
          <div className="grid grid-cols-3 gap-3">
            {/* PayPal - 比例優化為更精緻的尺寸 */}
            <button type="button" className="h-[64px] bg-[#F6F7F9] rounded-2xl flex items-center justify-center border-0 outline-none active:scale-95 transition-all hover:bg-[#EFF1F4]">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
                alt="PayPal" 
                className="h-[18px]" 
              />
            </button>
            
            {/* Apple Pay - 根據參考圖優化 Apple 圖標與 Pay 文字比例 */}
            <button type="button" className="h-[64px] bg-[#F6F7F9] rounded-2xl flex items-center justify-center border-0 outline-none active:scale-95 transition-all hover:bg-[#EFF1F4]">
               <div className="flex items-center space-x-1">
                 <i className="fa-brands fa-apple text-[22px] text-black -translate-y-[1px]"></i>
                 <span className="text-[18px] font-bold text-black tracking-tight leading-none">Pay</span>
               </div>
            </button>
            
            {/* Google Pay - 根據參考圖優化 G 圖標與 Pay 文字比例 */}
            <button type="button" className="h-[64px] bg-[#F6F7F9] rounded-2xl flex items-center justify-center border-0 outline-none active:scale-95 transition-all hover:bg-[#EFF1F4]">
               <div className="flex items-center space-x-1.5">
                 <svg width="19" height="19" viewBox="0 0 24 24" className="-translate-y-[0.5px]">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 <span className="text-[18px] font-bold text-[#5F6368] tracking-tight leading-none">Pay</span>
               </div>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[#8B8E98] my-2">
            <hr className="flex-1 border-gray-200" />
            <p className="text-[11px] font-bold">or pay using credit card</p>
            <hr className="flex-1 border-gray-200" />
          </div>

          <div className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#8B8E98] font-bold uppercase tracking-wider pl-1">Card holder full name</label>
              <input 
                required
                className="h-12 px-4 rounded-2xl bg-[#F2F2F2] border border-transparent focus:border-black outline-none transition-all text-sm font-medium text-[#121212]" 
                type="text" 
                placeholder="Enter your full name" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#8B8E98] font-bold uppercase tracking-wider pl-1">Card Number</label>
              <div className="relative">
                <input 
                  required
                  className="w-full h-12 px-4 rounded-2xl bg-[#F2F2F2] border border-transparent focus:border-black outline-none transition-all text-sm font-medium text-[#121212] tracking-widest" 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                />
                <i className="fa-solid fa-credit-card absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#8B8E98] font-bold uppercase tracking-wider pl-1">Expiry Date</label>
                <input 
                  required
                  className="h-12 px-4 rounded-2xl bg-[#F2F2F2] border border-transparent focus:border-black outline-none transition-all text-sm font-medium text-[#121212]" 
                  type="text" 
                  placeholder="01/23" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#8B8E98] font-bold uppercase tracking-wider pl-1">CVV</label>
                <input 
                  required
                  className="h-12 px-4 rounded-2xl bg-[#F2F2F2] border border-transparent focus:border-black outline-none transition-all text-sm font-medium text-[#121212]" 
                  type="password" 
                  maxLength={3}
                  placeholder="CVV" 
                />
              </div>
            </div>
          </div>

          {/* 優化後的主結帳按鈕 */}
          <button 
            type="submit"
            disabled={isProcessing}
            className="h-[64px] mt-2 rounded-2xl text-white text-[15px] font-bold uppercase tracking-[0.2em] bg-[#121212] hover:bg-black hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Checkout</span>
            )}
          </button>
          
          <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest mt-2">
            <i className="fa-solid fa-lock mr-2"></i>
            SECURE SSL ENCRYPTED PAYMENT
          </p>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
