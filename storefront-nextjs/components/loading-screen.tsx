import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="relative">
        {/* Outer medical pulse circle */}
        <div className="absolute inset-0 animate-ping opacity-20 bg-primary rounded-full scale-150"></div>

        {/* Spinner container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute w-32 h-32 border-4 border-primary/10 rounded-full animate-medical-rotate"></div>
          <div className="absolute w-32 h-32 border-4 border-t-primary rounded-full animate-spin"></div>

          {/* Center icon */}
          <div className="relative z-10 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-primary block">medical_services</span>
          </div>
        </div>

        {/* Loading text */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse">
            System Initializing...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes medical-rotate {
          0% { transform: rotate(0deg); opacity: 0.1; }
          50% { transform: rotate(180deg); opacity: 0.3; }
          100% { transform: rotate(360deg); opacity: 0.1; }
        }
        .animate-medical-rotate {
          animation: medical-rotate 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
