import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wrench, 
  Building2, 
  Cog, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity
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
      setError('Error al consultar el detalle de la orden de reparación.');
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
      setSuccessMessage(`El estado se actualizó exitosamente a "${newStatus}"`);
      setTimeout(() => setSuccessMessage(null), 4000);
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado</span>
        </Link>
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error || 'Orden no encontrada.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100 font-mono tracking-wide">
                {order.order_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ingresado: {new Date(order.reception_date).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Info + Status Transition Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Client & Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Entidades Asociadas</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>CLIENTE PROPIETARIO</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm">{order.client?.name}</h3>
                <p className="text-xs text-amber-400/80 font-mono mt-0.5">
                  {order.client?.id_type}: {order.client?.id_number}
                </p>
                <p className="text-xs text-slate-400 mt-2">{order.client?.email}</p>
                {order.client?.phone && (
                  <p className="text-xs text-slate-500">{order.client?.phone}</p>
                )}
              </div>

              {/* Motor */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-2">
                  <Cog className="w-4 h-4 text-amber-500" />
                  <span>MOTOR PESADO</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm font-mono text-amber-400">
                  {order.engine?.serial_number}
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  {order.engine?.manufacturer} - {order.engine?.model}
                </p>
                <p className="text-xs text-slate-400 mt-2">{order.engine?.engine_type}</p>
                <p className="text-xs text-slate-500 font-semibold">{order.engine?.power_capacity}</p>
              </div>
            </div>
          </div>

          {/* Card: Technical Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Informe y Diagnóstico Técnico</span>
            </h2>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-1">Problema Reportado por el Cliente:</h4>
              <p className="text-xs text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                {order.problem_description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1">Diagnóstico Técnico:</h4>
                <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 min-h-[60px]">
                  {order.technical_diagnosis || 'Pendiente por diagnóstico en taller.'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1">Trabajo Realizado / Requerido:</h4>
                <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 min-h-[60px]">
                  {order.work_performed || 'Sin intervenciones registradas hasta el momento.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Técnico Responsable:</span>
                <span className="font-semibold text-slate-200">
                  {order.assigned_technician || 'No asignado'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Fecha Estimada Entrega:</span>
                <span className="font-semibold text-slate-200">
                  {order.estimated_delivery_date
                    ? new Date(order.estimated_delivery_date).toLocaleDateString()
                    : 'Sin estimar'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Fecha Real de Entrega:</span>
                <span className="font-semibold text-emerald-400">
                  {order.actual_delivery_date
                    ? new Date(order.actual_delivery_date).toLocaleDateString()
                    : 'En proceso'}
                </span>
              </div>
            </div>

            {order.observations && (
              <div className="pt-2">
                <span className="text-slate-500 block text-xs mb-1">Observaciones:</span>
                <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  "{order.observations}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Update Status & Audit History */}
        <div className="space-y-6">
          
          {/* Action Box: Update State */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Transición de Estado</span>
            </h2>

            {statusError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nuevo Estado del Proceso:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RepairStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === order.status ? '(Estado Actual)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nota / Justificación del Cambio:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Aprobación telefónica recibida por parte del cliente para reemplazo de pistones..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus || newStatus === order.status}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <span>Registrar Cambio de Estado</span>
                )}
              </button>
            </form>
          </div>

          {/* Timeline: History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Historial de Auditoría</span>
            </h2>

            <div className="space-y-4">
              {!order.status_history || order.status_history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Sin historial registrado.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {order.status_history.map((h, idx) => (
                    <div key={h.id} className="relative">
                      {/* Circle Dot */}
                      <div
                        className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 ${
                          idx === 0
                            ? 'bg-amber-500 border-amber-400 ring-4 ring-amber-500/20'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      ></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={h.new_status} />
                          <span className="text-[10px] text-slate-500">
                            {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Por: <span className="text-slate-200 font-medium">{h.changed_by_user_name || 'Sistema'}</span>
                        </p>
                        {h.notes && (
                          <p className="text-xs text-slate-300 mt-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                            "{h.notes}"
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
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
