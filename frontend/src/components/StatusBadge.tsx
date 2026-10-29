import React from 'react';
import { RepairStatus } from '../types';
import { Wrench, CheckCircle2, AlertTriangle, Clock, TrendingUp, Truck, Inbox } from 'lucide-react';

interface StatusBadgeProps {
  status: RepairStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'Recibido':
        return {
          pill: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
          icon: Inbox,
          prefix: '1. RECEPCIÓN'
        };
      case 'En diagnóstico':
        return {
          pill: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] animate-pulse',
          icon: Clock,
          prefix: '2. METROLOGÍA'
        };
      case 'Esperando aprobación':
        return {
          pill: 'bg-amber-400/20 text-amber-200 border-amber-400/50',
          dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse',
          icon: AlertTriangle,
          prefix: '3. APROBACIÓN'
        };
      case 'En reparación':
        return {
          pill: 'bg-orange-500/20 text-orange-200 border-orange-500/50',
          dot: 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)] animate-pulse',
          icon: Wrench,
          prefix: '4. OVERHAUL'
        };
      case 'En pruebas':
        return {
          pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse',
          icon: TrendingUp,
          prefix: '5. DINAMÓMETRO'
        };
      case 'Finalizado':
        return {
          pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
          icon: CheckCircle2,
          prefix: '6. CERTIFICADO'
        };
      case 'Entregado':
        return {
          pill: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
          dot: 'bg-slate-400',
          icon: Truck,
          prefix: '7. EN FAENA'
        };
      default:
        return {
          pill: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-500',
          icon: Wrench,
          prefix: ''
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono font-bold border tracking-wider uppercase backdrop-blur-md shadow-sm ${sizeClasses} ${config.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <Icon className="w-3 h-3 shrink-0" strokeWidth={2.2} />
      <span>{status}</span>
    </span>
  );
};

