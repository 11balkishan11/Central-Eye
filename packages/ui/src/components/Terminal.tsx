import React from 'react';

export interface TerminalProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  children, 
  title = "bash", 
  className = '' 
}) => {
  return (
    <div className={`bg-[#0D0D0E] border border-white/10 rounded-lg overflow-hidden shadow-2xl ${className}`}>
      <div className="bg-black/50 px-4 py-2 border-b border-white/10 flex items-center gap-2">
        <div className="flex gap-1.5 mr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-500 font-mono flex-1 text-center">{title}</span>
      </div>
      <div className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
};
