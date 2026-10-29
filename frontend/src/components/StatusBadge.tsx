import React from 'react';
import { RepairStatus } from '../types';

interface StatusBadgeProps {
  status: RepairStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Recibido':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'En diagnóstico':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Esperando aprobación':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'En reparación':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'En pruebas':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Finalizado':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Entregado':
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};
