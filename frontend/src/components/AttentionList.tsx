import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ChevronRight, UserX, CheckCircle } from 'lucide-react';
import { RepairOrder } from '../types';

export interface AttentionItem {
  id: number;
  orderNumber: string;
  engineSerial: string;
  engineModel?: string;
  clientName: string;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
  daysOverdue?: number;
}

interface AttentionListProps {
  items: AttentionItem[];
}

export const AttentionList: React.FC<AttentionListProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <h2 className="text-sm font-semibold text-slate-100">Requiere atención</h2>
          <span className="text-xs text-slate-400 font-mono">({items.length})</span>
        </div>
        <span className="text-xs text-slate-400">Prioridad operativa de hoy</span>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>No hay órdenes retrasadas o pendientes de aprobación técnica hoy.</span>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {items.map((item) => {
            const isHigh = item.urgency === 'high';
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/orders/${item.id}`)}
                className="p-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">
                    {isHigh ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-slate-200">
                        {item.orderNumber}
                      </span>
                      <span className="font-mono text-slate-400">
                        {item.engineSerial} {item.engineModel ? `(${item.engineModel})` : ''}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 truncate">{item.clientName}</span>
                    </div>
                    <p className={`mt-0.5 text-xs ${isHigh ? 'text-rose-300 font-medium' : 'text-amber-300'}`}>
                      {item.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.daysOverdue !== undefined && item.daysOverdue > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-mono font-semibold">
                      +{item.daysOverdue} d retraso
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

