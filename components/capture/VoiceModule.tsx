
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { geminiService } from '../../services/geminiService';
import { OCRBlock, CaptureMode } from '../../types';

// 自定義 Hook 用於偵測視窗尺寸，支援 RWD 計算
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

interface VoiceModuleProps {
  mode: CaptureMode;
  setMode: (mode: CaptureMode) => void;
  setIsProcessing: (loading: boolean) => void;
  setOcrBlocks: (blocks: OCRBlock[]) => void;
  setDetectedLanguage: (lang: string | null) => void;
  setLangConfidence: (conf: number | null) => void;
  setShowDistribution: (show: boolean) => void;
}

const VoiceModule: React.FC<VoiceModuleProps> = ({ 
  mode, 
  setMode, 
  setIsProcessing, 
  setOcrBlocks, 
  setDetectedLanguage, 
  setLangConfidence, 
  setShowDistribution 
}) => {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Siri-style Audio Analysis
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode === 'VOICE_RECORDING') {
      startVoiceRecording();
    } else {
      cleanupAudio();
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      cleanupAudio();
    };
  }, [mode]);

  const cleanupAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Web Audio API for Siri-like visual feedback
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Normalize volume to 0-1 range for styling
        setVolume(average / 128); 
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setIsProcessing(true);
          try {
            const text = await geminiService.transcribeAudio(base64Data, 'audio/webm');
            if (text && text.trim()) {
              setOcrBlocks([{
                id: `voice-${Date.now()}`,
                text: text,
                type: 'body',
                confidence: 0.98,
                isSelected: true
              }]);
              setDetectedLanguage("語音辨識");
              setLangConfidence(1);
              setShowDistribution(true);
            } else {
              alert('未偵測到有效的語音內容');
            }
          } catch (e) {
            console.error("Transcription Error:", e);
          } finally {
            setIsProcessing(false);
          }
        };
        stream.getTracks().forEach(t => t.stop());
      };

      setRecordingTime(0);
      mediaRecorder.start();
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access error:", err);
      alert('無法存取麥克風。');
      setMode('IDLE');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setMode('IDLE');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Siri 動態波紋配置
  const rippleLayers = [
    { scale: 0.2, opacity: 0.1, delay: '0s', color: 'rgba(178, 164, 255, 0.4)' },
    { scale: 0.35, opacity: 0.08, delay: '0.2s', color: 'rgba(59, 130, 246, 0.3)' },
    { scale: 0.5, opacity: 0.05, delay: '0.4s', color: 'rgba(178, 164, 255, 0.2)' },
    { scale: 0.7, opacity: 0.03, delay: '0.6s', color: 'rgba(59, 130, 246, 0.1)' },
  ];

  if (mode !== 'VOICE_RECORDING') return null;

  return (
    <div className="fixed inset-0 z-[2005] bg-black flex flex-col items-center justify-center animate-in fade-in duration-700 overflow-hidden font-sans">
       
       {/* 核心置中區域 - Siri 式動畫與文字 */}
       <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-8 relative">
          
          {/* Siri 動態波紋區域 */}
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center mb-16 sm:mb-24">
             
             {/* Siri 背景流體發光底色 */}
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 via-blue-500/5 to-transparent rounded-full blur-[100px] animate-pulse"></div>
             
             {/* 即時音波反應層 - 多層模糊圓環 */}
             {rippleLayers.map((layer, i) => (
               <div 
                 key={i}
                 className="absolute inset-0 rounded-full border transition-all duration-150 ease-out"
                 style={{ 
                   transform: `scale(${1 + (volume * layer.scale)})`, 
                   opacity: layer.opacity + (volume * 0.2),
                   borderColor: layer.color,
                   borderWidth: isDesktop ? '3px' : '2px',
                   filter: `blur(${4 + i * 4}px)`,
                   animation: `siri-gentle-ripple ${4 + i}s infinite ease-in-out`
                 }}
               ></div>
             ))}

             {/* 核心麥克風圓形按鈕 - 隨音量脈動 */}
             <div 
               className="relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] bg-gradient-to-br from-[#B2A4FF] to-[#7b61ff] rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(178,164,255,0.6)] transition-transform duration-100 ease-out z-10"
               style={{ transform: `scale(${1 + volume * 0.12})` }}
             >
                <div className="absolute inset-2 rounded-full border-2 border-white/20"></div>
                <i className="fa-solid fa-microphone text-white text-5xl sm:text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"></i>
             </div>
          </div>

          {/* 狀態資訊區 */}
          <div className="text-center space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter drop-shadow-lg">正在聆聽靈感...</h2>
                <p className="text-[10px] sm:text-[11px] text-[#B2A4FF] font-black uppercase tracking-[0.6em] opacity-80 mt-2">
                   TRANSCRIBING WITH GEMINI AI
                </p>
             </div>

             <div className="flex flex-col items-center">
                <p className="text-6xl sm:text-8xl font-black text-white/10 tabular-nums leading-none tracking-tighter italic select-none">
                  {formatTime(recordingTime)}
                </p>
                
                {/* 狀態跳動點動畫 */}
                <div className="flex space-x-3 mt-8">
                   {[0, 1, 2].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-bounce" 
                        style={{ animationDelay: `${i * 0.15}s` }} 
                      />
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* 響應式優化後的底部停止按鈕 */}
       <div className="w-full max-w-xl px-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:pb-32 z-50">
          <button 
            onClick={stopVoiceRecording} 
            className="group relative w-full h-20 sm:h-24 bg-white rounded-full text-black font-black text-[14px] sm:text-[16px] uppercase tracking-[0.4em] shadow-[0_40px_80px_rgba(0,0,0,0.8)] active:scale-[0.96] transition-all hover:scale-[1.02] overflow-hidden"
          >
            {/* 按鈕內部的微妙光影 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative flex items-center justify-center space-x-4">
               <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-stop text-[11px] sm:text-[13px]"></i>
               </div>
               <span className="whitespace-nowrap">停 止 並 完 成 擷 取</span>
            </div>
          </button>
       </div>

       <style dangerouslySetInnerHTML={{ __html: `
          @keyframes siri-gentle-ripple {
            0%, 100% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
          @keyframes siri-inner-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(178, 164, 255, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 100px rgba(178, 164, 255, 0.7); }
          }
          /* 防止文字被選中干擾動畫 */
          .select-none {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
       `}} />
    </div>
  );
};

export default VoiceModule;
