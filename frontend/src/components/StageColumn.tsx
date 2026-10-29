import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairStatus, RepairOrder } from '../types';
import { themeTokens } from '../tokens/theme';

interface StageColumnProps {
  stages: {
    status: RepairStatus;
    orders: RepairOrder[];
  }[];
}

export const StageColumn: React.FC<StageColumnProps> = ({ stages }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Línea de proceso en taller</h2>
          <p className="text-xs text-slate-400">Distribución de motores activos por etapa técnica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage) => {
          const config = themeTokens.status[stage.status];
          return (
            <div
              key={stage.status}
              className="bg-[#0F1626] border border-white/[0.06] rounded-md p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.04]">
                  <span className="text-xs font-semibold text-slate-200 truncate" title={stage.status}>
                    {stage.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded">
                    {stage.orders.length}
                  </span>
                </div>

                <div className="space-y-1.5 min-h-[90px]">
                  {stage.orders.length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic block py-4 text-center">
                      Sin unidades
                    </span>
                  ) : (
                    stage.orders.map((order) => {
                      // Calcular días en etapa o días desde recepción
                      const reception = order.reception_date ? new Date(order.reception_date) : new Date(order.created_at);
                      const daysInShop = Math.max(0, Math.floor((Date.now() - reception.getTime()) / (1000 * 60 * 60 * 24)));
                      
                      const isOverdue = order.estimated_delivery_date 
                        ? new Date(order.estimated_delivery_date) < new Date() && order.status !== 'Finalizado' && order.status !== 'Entregado'
                        : false;

                      return (
                        <div
                          key={order.id}
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className={`p-2 rounded border cursor-pointer transition-colors text-xs ${
                            isOverdue
                              ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15'
                              : 'bg-slate-800/40 border-white/[0.04] hover:bg-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-semibold text-slate-200">
                              {order.engine?.serial_number || `ORD-${order.id}`}
                            </span>
                            <span className={`text-[10px] ${isOverdue ? 'text-rose-300 font-semibold' : 'text-slate-400'}`}>
                              {daysInShop} d
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {order.client?.name || 'Cliente'}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

