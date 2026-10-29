import React from 'react';
import { RepairStatus } from '../types';
import { themeTokens } from '../tokens/theme';

interface StatusBadgeProps {
  status: RepairStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = themeTokens.status[status] || {
    label: status,
    badgeClass: 'bg-slate-700/20 text-slate-300 border-slate-600/30',
    dotClass: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${sizeClasses} ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};
