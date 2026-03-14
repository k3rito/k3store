"use client";

import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[8px] z-[9999]" id="global-loader">
      <style jsx>{`
        @keyframes pulse-medical {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-medical-pulse {
          animation: pulse-medical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-medical-rotate {
          animation: rotate-slow 8s linear infinite;
        }
      `}</style>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 border-4 border-[#0054a3]/10 rounded-full animate-medical-rotate"></div>
          <svg className="animate-medical-pulse drop-shadow-xl" fill="none" height="100" id="svg-global" viewBox="0 0 100 100" width="100" xmlns="http://www.w3.org/2000/svg">
            <circle className="animate-medical-rotate" cx="50" cy="50" r="45" stroke="#0054a3" strokeDasharray="10 5" strokeWidth="4"></circle>
            <rect fill="#0054a3" height="50" rx="2" width="16" x="42" y="25"></rect>
            <rect fill="#0054a3" height="16" rx="2" width="50" x="25" y="42"></rect>
            <path d="M20 50H35L40 35L50 65L55 50H80" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
              <animate attributeName="stroke-dasharray" dur="1.5s" from="0, 100" repeatCount="indefinite" to="100, 0"></animate>
            </path>
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-[#0054a3] font-semibold text-lg tracking-wide uppercase">Securing Connection</h2>
          <p className="text-gray-500 text-sm mt-1">Accessing medical records...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
