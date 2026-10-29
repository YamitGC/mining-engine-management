import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  ChevronRight, 
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { RepairOrder, RepairStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { KpiStat } from '../components/KpiStat';
import { AttentionList, AttentionItem } from '../components/AttentionList';
import { StageColumn } from '../components/StageColumn';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table filter state
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch orders - single source of truth for all dashboard widgets
        const res = await businessApi.get('/repair-orders');
        setOrders(res.data || []);
      } catch (err: any) {
        console.error('Error fetching dashboard orders:', err);
        setError('No se pudo cargar la información del taller. Verifica la conexión con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 1. Calculate Single Source of Truth Metrics
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'Finalizado' && o.status !== 'Entregado');
  }, [orders]);

  const readyForDelivery = useMemo(() => {
    return orders.filter((o) => o.status === 'Finalizado');
  }, [orders]);

  const overdueOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (o.status === 'Finalizado' || o.status === 'Entregado') return false;
      if (!o.estimated_delivery_date) return false;
      return new Date(o.estimated_delivery_date) < now;
    });
  }, [orders]);

  const averageDaysInShop = useMemo(() => {
    if (orders.length === 0) return 0;
    const totalDays = orders.reduce((sum, o) => {
      const start = o.reception_date ? new Date(o.reception_date) : new Date(o.created_at);
      const end = o.actual_delivery_date ? new Date(o.actual_delivery_date) : new Date();
      const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + diff;
    }, 0);
    return Math.round(totalDays / orders.length);
  }, [orders]);

  // 2. Build Attention List (prioritized action items)
  const attentionItems = useMemo<AttentionItem[]>(() => {
    const list: AttentionItem[] = [];
    const now = new Date();

    orders.forEach((o) => {
      if (o.status === 'Finalizado' || o.status === 'Entregado') return;

      const reception = o.reception_date ? new Date(o.reception_date) : new Date(o.created_at);
      const daysInShop = Math.max(0, Math.floor((now.getTime() - reception.getTime()) / (1000 * 60 * 60 * 24)));

      // Overdue
      if (o.estimated_delivery_date && new Date(o.estimated_delivery_date) < now) {
        const overdueDays = Math.max(1, Math.floor((now.getTime() - new Date(o.estimated_delivery_date).getTime()) / (1000 * 60 * 60 * 24)));
        list.push({
          id: o.id,
          orderNumber: o.order_number,
          engineSerial: o.engine?.serial_number || `Motor #${o.engine_id}`,
          engineModel: o.engine?.model,
          clientName: o.client?.name || 'Cliente sin nombre',
          reason: 'Fecha estimada de entrega vencida',
          urgency: 'high',
          daysOverdue: overdueDays,
        });
        return;
      }

      // Waiting approval
      if (o.status === 'Esperando aprobación') {
        list.push({
          id: o.id,
          orderNumber: o.order_number,
          engineSerial: o.engine?.serial_number || `Motor #${o.engine_id}`,
          engineModel: o.engine?.model,
          clientName: o.client?.name || 'Cliente sin nombre',
          reason: 'Esperando aprobación de cotización por el cliente',
          urgency: 'medium',
        });
        return;
      }

      // Diagnostic taking > 3 days
      if (o.status === 'En diagnóstico' && daysInShop > 3) {
        list.push({
          id: o.id,
          orderNumber: o.order_number,
          engineSerial: o.engine?.serial_number || `Motor #${o.engine_id}`,
          engineModel: o.engine?.model,
          clientName: o.client?.name || 'Cliente sin nombre',
          reason: `Diagnóstico prolongado (${daysInShop} días en análisis)`,
          urgency: 'medium',
        });
        return;
      }

      // No assigned technician
      if (!o.assigned_technician) {
        list.push({
          id: o.id,
          orderNumber: o.order_number,
          engineSerial: o.engine?.serial_number || `Motor #${o.engine_id}`,
          engineModel: o.engine?.model,
          clientName: o.client?.name || 'Cliente sin nombre',
          reason: 'Sin técnico responsable asignado',
          urgency: 'low',
        });
      }
    });

    return list;
  }, [orders]);

  // 3. Stage board distribution
  const stagesData = useMemo(() => {
    const pipelineStatuses: RepairStatus[] = [
      'Recibido',
      'En diagnóstico',
      'Esperando aprobación',
      'En reparación',
      'En pruebas',
      'Finalizado',
    ];

    return pipelineStatuses.map((st) => ({
      status: st,
      orders: orders.filter((o) => o.status === st),
    }));
  }, [orders]);

  // 4. Filtered table data
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_number.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (o.engine?.serial_number && o.engine.serial_number.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (o.client?.name && o.client.name.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (o.assigned_technician && o.assigned_technician.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, tableSearch, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#131B2E] rounded-lg border border-white/[0.04]" />
          ))}
        </div>
        <div className="h-44 bg-[#131B2E] rounded-lg border border-white/[0.04]" />
        <div className="h-56 bg-[#131B2E] rounded-lg border border-white/[0.04]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <EmptyState
          title="Error al cargar el dashboard"
          description={error}
          actionText="Reintentar"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const kpiItems = [
    {
      id: 'active',
      label: 'Motores en taller',
      value: activeOrders.length,
      unit: 'unidades',
      comparison: {
        text: `${orders.length} órdenes históricas`,
        type: 'neutral' as const,
      },
    },
    {
      id: 'overdue',
      label: 'Con retraso',
      value: overdueOrders.length,
      unit: 'órdenes',
      comparison: {
        text: overdueOrders.length > 0 ? 'Requieren reprogramación' : 'Al día con cronograma',
        type: overdueOrders.length > 0 ? ('negative' as const) : ('positive' as const),
      },
    },
    {
      id: 'ready',
      label: 'Listos para despacho',
      value: readyForDelivery.length,
      unit: 'completados',
      comparison: {
        text: readyForDelivery.length > 0 ? 'Pendientes de entrega a faena' : 'Ninguno pendiente',
        type: readyForDelivery.length > 0 ? ('positive' as const) : ('neutral' as const),
      },
    },
    {
      id: 'avg_days',
      label: 'Tiempo promedio en taller',
      value: averageDaysInShop,
      unit: 'días',
      comparison: {
        text: averageDaysInShop > 15 ? 'Por encima del objetivo (15 d)' : 'Dentro de meta técnica',
        type: averageDaysInShop > 15 ? ('warning' as const) : ('positive' as const),
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Compact KPI Row */}
      <KpiStat items={kpiItems} />

      {/* 2. Attention List */}
      <AttentionList items={attentionItems} />

      {/* 3. Process Pipeline with real engine cards */}
      <StageColumn stages={stagesData} />

      {/* 4. Active Engines & Orders Table */}
      <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg overflow-hidden">
        {/* Table header with filters */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Órdenes de trabajo activas</h2>
            <p className="text-xs text-slate-400">Listado general de motores en taller con seguimiento de plazos</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por serie, cliente o técnico..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0F1626] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">Todas las etapas</option>
              <option value="Recibido">Recibido</option>
              <option value="En diagnóstico">En diagnóstico</option>
              <option value="Esperando aprobación">Esperando aprobación</option>
              <option value="En reparación">En reparación</option>
              <option value="En pruebas">En pruebas</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1626] text-slate-400 font-medium border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Serie motor</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Etapa</th>
                <th className="py-3 px-4">Técnico</th>
                <th className="py-3 px-4">Días en taller</th>
                <th className="py-3 px-4">Entrega estimada</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const reception = order.reception_date ? new Date(order.reception_date) : new Date(order.created_at);
                  const daysInShop = Math.max(0, Math.floor((Date.now() - reception.getTime()) / (1000 * 60 * 60 * 24)));
                  const isOverdue = order.estimated_delivery_date
                    ? new Date(order.estimated_delivery_date) < new Date() && order.status !== 'Finalizado' && order.status !== 'Entregado'
                    : false;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-slate-100 block">
                          {order.engine?.serial_number || `ID ${order.engine_id}`}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.engine?.manufacturer} {order.engine?.model}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium truncate max-w-[160px]">
                        {order.client?.name || 'Cliente'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {order.assigned_technician || <span className="text-slate-500 italic">Sin asignar</span>}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-slate-200">{daysInShop} d</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {order.estimated_delivery_date ? (
                          <span className={isOverdue ? 'text-rose-300 font-medium' : 'text-slate-300'}>
                            {new Date(order.estimated_delivery_date).toLocaleDateString()}
                            {isOverdue && ' (Vencido)'}
                          </span>
                        ) : (
                          <span className="text-slate-500">Sin definir</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium gap-1 text-xs">
                          <span>Detalle</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table pagination */}
        {filteredOrders.length > itemsPerPage && (
          <div className="p-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length} órdenes
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-white/[0.08] hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Anterior
              </button>
              <span className="px-2 font-mono text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-white/[0.08] hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
