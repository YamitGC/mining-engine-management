import { RepairStatus } from '../types';

export const themeTokens = {
  colors: {
    canvas: '#0B0F19',
    card: '#131B2E',
    cardHover: '#18233C',
    subtle: '#1E293B',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    borderFocus: '#F59E0B',
    accent: '#F59E0B',
    accentHover: '#D97706',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  status: {
    Recibido: {
      label: 'Recibido',
      badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      dotClass: 'bg-blue-400',
    },
    'En diagnóstico': {
      label: 'En diagnóstico',
      badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      dotClass: 'bg-indigo-400',
    },
    'Esperando aprobación': {
      label: 'Esperando aprobación',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-400',
    },
    'En reparación': {
      label: 'En reparación',
      badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      dotClass: 'bg-orange-400',
    },
    'En pruebas': {
      label: 'En pruebas',
      badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      dotClass: 'bg-cyan-400',
    },
    Finalizado: {
      label: 'Finalizado',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
    },
    Entregado: {
      label: 'Entregado',
      badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
      dotClass: 'bg-slate-400',
    },
  } as Record<RepairStatus, { label: string; badgeClass: string; dotClass: string }>,
};

