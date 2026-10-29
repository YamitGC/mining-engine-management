import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { RepairOrder, RepairStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<RepairOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<RepairStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await businessApi.get(`/repair-orders/${id}`);
      setOrder(res.data);
      setNewStatus(res.data.status);
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar el detalle de la orden de trabajo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || !order) return;
    setStatusError(null);
    setSuccessMessage(null);
    setIsUpdatingStatus(true);

    try {
      const res = await businessApi.patch(`/repair-orders/${order.id}/status`, {
        status: newStatus,
        notes: statusNotes.trim() || null
      });
      setOrder(res.data);
      setStatusNotes('');
      setSuccessMessage(`Estado actualizado a "${newStatus}" correctamente.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al actualizar el estado de la orden.';
      setStatusError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statuses: RepairStatus[] = [
    'Recibido',
    'En diagnóstico',
    'Esperando aprobación',
    'En reparación',
    'En pruebas',
    'Finalizado',
    'Entregado',
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
          <span>Cargando detalle de la orden...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a órdenes</span>
        </Link>
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-300 text-xs">
          {error || 'Orden no encontrada.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="bg-[#131B2E] border border-white/[0.08] p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <Link
            to="/orders"
            className="p-1.5 rounded-md border border-white/[0.08] bg-[#0F1626] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0 mt-0.5"
            title="Volver a órdenes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-semibold font-mono text-slate-100">
                {order.order_number}
              </h1>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fecha de recepción: {new Date(order.reception_date).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right font-mono">
          <span className="block text-[11px] uppercase tracking-wider text-slate-500">ID Registro</span>
          <span className="font-semibold text-slate-200">#{order.id}</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Info + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Technical Info */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Card: Engine & Client */}
          <div className="bg-[#131B2E] border border-white/[0.08] p-5 rounded-lg">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
              Motor y cliente
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Motor */}
              <div className="bg-[#0F1626] p-4 rounded-md border border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="uppercase tracking-wider">Motor</span>
                  <span className="font-semibold text-slate-300">
                    {order.engine?.manufacturer}
                  </span>
                </div>
                <div className="font-mono text-base font-semibold text-slate-100">
                  {order.engine?.serial_number}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Modelo: {order.engine?.model}
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Tipo</span>
                    <span className="text-slate-300 font-medium">{order.engine?.engine_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Potencia</span>
                    <span className="text-slate-200 font-mono font-medium">{order.engine?.power_capacity}</span>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-[#0F1626] p-4 rounded-md border border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="uppercase tracking-wider">Cliente</span>
                  <span className="font-mono text-slate-400">
                    {order.client?.id_type} {order.client?.id_number}
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-100">
                  {order.client?.name}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1 text-xs">
                  <p className="text-slate-300">
                    <span className="text-slate-500">Correo:</span> {order.client?.email}
                  </p>
                  {order.client?.phone && (
                    <p className="text-slate-300 font-mono">
                      <span className="text-slate-500 font-sans">Teléfono:</span> {order.client?.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Technical Sheet */}
          <div className="bg-[#131B2E] border border-white/[0.08] p-5 rounded-lg space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Diagnóstico y trabajos
            </h2>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Falla reportada
              </span>
              <div className="bg-[#0F1626] p-3 rounded-md border border-white/[0.08] text-xs text-slate-200 leading-relaxed">
                {order.problem_description}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Diagnóstico técnico
                </span>
                <div className="bg-[#0F1626] p-3 rounded-md border border-white/[0.08] text-xs text-slate-200 min-h-[70px] leading-relaxed">
                  {order.technical_diagnosis || (
                    <span className="text-slate-500 italic">Sin diagnóstico registrado aún.</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Trabajo realizado
                </span>
                <div className="bg-[#0F1626] p-3 rounded-md border border-white/[0.08] text-xs text-slate-200 min-h-[70px] leading-relaxed">
                  {order.work_performed || (
                    <span className="text-slate-500 italic">Sin intervenciones registradas.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
              <div className="p-3 rounded-md bg-[#0F1626] border border-white/[0.08]">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Técnico responsable</span>
                <span className="font-medium text-slate-200">
                  {order.assigned_technician || <span className="text-slate-500 italic">Por asignar</span>}
                </span>
              </div>

              <div className="p-3 rounded-md bg-[#0F1626] border border-white/[0.08]">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Fecha estimada</span>
                <span className="font-medium text-slate-200">
                  {order.estimated_delivery_date
                    ? new Date(order.estimated_delivery_date).toLocaleDateString()
                    : 'Sin definir'}
                </span>
              </div>

              <div className="p-3 rounded-md bg-[#0F1626] border border-white/[0.08]">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Fecha entrega real</span>
                <span className="font-medium text-slate-200">
                  {order.actual_delivery_date
                    ? new Date(order.actual_delivery_date).toLocaleDateString()
                    : 'En proceso'}
                </span>
              </div>
            </div>

            {order.observations && (
              <div className="pt-2">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Observaciones
                </span>
                <p className="text-xs text-slate-300 bg-[#0F1626] p-3 rounded-md border border-white/[0.08]">
                  {order.observations}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: State Machine & Timeline */}
        <div className="space-y-5">
          
          {/* Card: Update status */}
          <div className="bg-[#131B2E] border border-white/[0.08] p-5 rounded-lg">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
              Actualizar estado
            </h2>

            {statusError && (
              <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nuevo estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RepairStatus)}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-200"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === order.status ? '(actual)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de cambio de estado
                </label>
                <textarea
                  rows={3}
                  placeholder="Observaciones sobre la transición..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-200 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus || newStatus === order.status}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2 px-3 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <span>Guardar estado</span>
                )}
              </button>
            </form>
          </div>

          {/* Card: History / Audit */}
          <div className="bg-[#131B2E] border border-white/[0.08] p-5 rounded-lg">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Historial de cambios
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {order.status_history?.length || 0} eventos
              </span>
            </div>

            <div className="space-y-4">
              {!order.status_history || order.status_history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Sin cambios de estado registrados.
                </p>
              ) : (
                <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
                  {order.status_history.map((h, idx) => (
                    <div key={h.id} className="relative">
                      <div
                        className={`absolute -left-5 top-1.5 w-2 h-2 rounded-full ${
                          idx === 0
                            ? 'bg-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-slate-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={h.new_status} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            {new Date(h.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Por: <span className="font-medium text-slate-200">{h.changed_by_user_name || 'Sistema'}</span>
                        </p>
                        {h.notes && (
                          <p className="text-xs text-slate-400 mt-1 bg-[#0F1626] p-2 rounded-md border border-white/[0.06]">
                            {h.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
