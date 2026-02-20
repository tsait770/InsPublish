
import React from 'react';
import { Project, PublicationStatus } from '../types';

interface PublicationTrackerProps {
  project: Project | null;
  isNight: boolean;
}

const PublicationTracker: React.FC<PublicationTrackerProps> = ({ project, isNight }) => {
  const steps = [
    { status: PublicationStatus.SUBMITTED, label: 'Submitted', icon: 'fa-paper-plane' },
    { status: PublicationStatus.REVIEWING, label: 'In Review', icon: 'fa-magnifying-glass' },
    { status: PublicationStatus.ACCEPTED, label: 'Approved', icon: 'fa-check' },
    { status: PublicationStatus.LIVE, label: 'Live', icon: 'fa-earth-americas' }
  ];

  const currentStatus = project?.metadata === 'REVIEW PENDING' ? PublicationStatus.REVIEWING : PublicationStatus.SUBMITTED;
  const activeIdx = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className={`w-full max-w-4xl mt-12 px-10 py-10 rounded-[44px] border animate-in slide-in-from-top duration-700 ${isNight ? 'bg-black border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl">
             <i className="fa-solid fa-route"></i>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Global Publishing Lifecycle</h3>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Status Tracking: {project?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20">
           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Official Channel Active</span>
        </div>
      </div>

      <div className="relative flex items-center justify-between px-6">
        {/* Connection Line */}
        <div className="absolute left-10 right-10 h-0.5 bg-white/5 top-1/2 -translate-y-1/2 z-0">
           <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }} />
        </div>

        {steps.map((step, i) => {
          const isActive = i <= activeIdx;
          const isCurrent = i === activeIdx;
          
          return (
            <div key={step.status} className="flex flex-col items-center relative z-10 group">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${
                isCurrent ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110' :
                isActive ? 'bg-blue-600/20 border-blue-600/40 text-blue-500' :
                'bg-[#121214] border-white/5 text-gray-700'
              }`}>
                <i className={`fa-solid ${step.icon} text-lg`}></i>
              </div>
              <div className="absolute -bottom-10 whitespace-nowrap text-center">
                 <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {step.label}
                 </p>
                 {isCurrent && (
                   <p className="text-[8px] text-blue-500 font-bold uppercase mt-1 animate-pulse">Processing</p>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 p-8 bg-white/5 rounded-[32px] border border-white/5 flex items-start space-x-6">
         <i className="fa-solid fa-shield-halved text-gray-600 text-xl"></i>
         <div className="space-y-1">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Verified Channel Log</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Manuscript components verified and synced with destination platform standards. All data transmission is encrypted via RSA-4096. 
              InsPublish holds no claim to intellectual property during this responsibility transfer.
            </p>
         </div>
      </div>
    </div>
  );
};

export default PublicationTracker;
