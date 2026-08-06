import React from 'react';

export interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  className = '' 
}) => {
  const getStyles = () => {
    switch(status) {
      case 'healthy': return 'bg-[var(--color-brand-emerald-dark)]/20 text-[var(--color-brand-emerald-light)] border-[var(--color-brand-emerald-light)]/50';
      case 'warning': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${getStyles()} ${className}`}>
      {label || status.toUpperCase()}
    </span>
  );
};
