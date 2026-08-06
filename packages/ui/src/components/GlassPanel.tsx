import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <div 
      className={`glass-panel p-6 ${hoverEffect ? 'hover:border-white/20 hover:bg-white/10 transition-colors' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
