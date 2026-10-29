import React from 'react';
import { RepairStatus } from '../types';

interface StatusBadgeProps {
  status: RepairStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Recibido':
        return {
          pill: 'bg-blue-500/[0.08] text-blue-300 border-blue-500/25',
          dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
        };
      case 'En diagnóstico':
        return {
          pill: 'bg-violet-500/[0.08] text-violet-300 border-violet-500/25',
          dot: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)] animate-pulse',
        };
      case 'Esperando aprobación':
        return {
          pill: 'bg-amber-500/[0.08] text-amber-300 border-amber-500/25',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        };
      case 'En reparación':
        return {
          pill: 'bg-orange-500/[0.08] text-orange-300 border-orange-500/25',
          dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)] animate-pulse',
        };
      case 'En pruebas':
        return {
          pill: 'bg-cyan-500/[0.08] text-cyan-300 border-cyan-500/25',
          dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
        };
      case 'Finalizado':
        return {
          pill: 'bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/25',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        };
      case 'Entregado':
        return {
          pill: 'bg-slate-500/[0.08] text-slate-300 border-slate-500/25',
          dot: 'bg-slate-400',
        };
      default:
        return {
          pill: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border tracking-wide uppercase subtle-badge backdrop-blur-md ${sizeClasses} ${style.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{status}</span>
    </span>
  );
};
