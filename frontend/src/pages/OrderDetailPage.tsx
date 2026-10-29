import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wrench, 
  Building2, 
  Cpu, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Activity,
  Send,
  Zap,
  Check
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
      setSuccessMessage(`Fase operativa actualizada exitosamente a "${newStatus}"`);
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-slate-400 tracking-wider">CARGANDO FICHA TÉCNICA...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de órdenes</span>
        </Link>
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono">
          {error || 'Orden técnica no localizada.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link
              to="/orders"
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-white/[0.08] transition-all hover:scale-105 shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-extrabold font-mono text-amber-400 tracking-wider">
                  {order.order_number}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                <span>Ingreso en taller:</span>
                <span className="text-slate-300 font-semibold">{new Date(order.reception_date).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs bg-slate-900/70 border border-white/[0.06] px-3.5 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">FASE ACTIVA:</span>
            <span className="text-slate-100 font-bold">{order.status}</span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid: 2 Columns for Tech Specs & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tech Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Linked Engine & Client */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Matriz de Equipamiento & Propietario</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Motor */}
              <div className="bg-[#090d16]/70 p-4 rounded-xl border border-white/[0.06] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/[0.04] rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>MOTOR INDUSTRIAL</span>
                  </div>
                  <span className="text-[10px] bg-white/[0.05] px-1.5 py-0.5 rounded text-slate-300 font-mono">SERIE</span>
                </div>
                <h3 className="font-mono text-lg font-bold text-slate-100 tracking-wide">
                  {order.engine?.serial_number}
                </h3>
                <p className="text-xs text-amber-400/90 font-semibold mt-0.5">
                  {order.engine?.manufacturer} — {order.engine?.model}
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TIPO COMBUSTIÓN</span>
                    <span className="text-slate-200">{order.engine?.engine_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">POTENCIA NOMINAL</span>
                    <span className="text-amber-400 font-bold">{order.engine?.power_capacity}</span>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-[#090d16]/70 p-4 rounded-xl border border-white/[0.06]">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <Building2 className="w-4 h-4" />
                    <span>EMPRESA PROPIETARIA</span>
                  </div>
                  <span className="text-[10px] bg-white/[0.05] px-1.5 py-0.5 rounded text-slate-300 font-mono">CLIENTE</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  {order.client?.name}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {order.client?.id_type}: {order.client?.id_number}
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1 text-xs">
                  <p className="text-slate-300 flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">EMAIL:</span>
                    <span>{order.client?.email}</span>
                  </p>
                  {order.client?.phone && (
                    <p className="text-slate-400 flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400 text-[11px]">TEL:</span>
                      <span>{order.client?.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Technical Diagnostic Sheet */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Informe de Diagnóstico y Plan de Intervención</span>
            </h2>

            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                Problema o Falla Notificada por el Operador
              </span>
              <div className="bg-[#090d16]/80 p-4 rounded-xl border border-white/[0.06] text-xs text-slate-200 leading-relaxed font-sans">
                {order.problem_description}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                  Diagnóstico Técnico del Taller
                </span>
                <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-white/[0.06] text-xs text-slate-300 min-h-[75px] leading-relaxed">
                  {order.technical_diagnosis || (
                    <span className="italic text-slate-400 font-mono">Fase de diagnóstico en curso.</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                  Trabajo Realizado / Componentes Reemplazados
                </span>
                <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-white/[0.06] text-xs text-slate-300 min-h-[75px] leading-relaxed">
                  {order.work_performed || (
                    <span className="italic text-slate-400 font-mono">Sin intervenciones registradas.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/[0.06] text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Técnico a Cargo</span>
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {order.assigned_technician || 'Sin asignar'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Entrega Estimada</span>
                <span className="font-semibold text-slate-100">
                  {order.estimated_delivery_date
                    ? new Date(order.estimated_delivery_date).toLocaleDateString()
                    : 'Sin fecha programada'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Entrega Real en Planta</span>
                <span className="font-semibold text-emerald-400">
                  {order.actual_delivery_date
                    ? new Date(order.actual_delivery_date).toLocaleDateString()
                    : 'En ciclo de reparación'}
                </span>
              </div>
            </div>

            {order.observations && (
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Observaciones Generales
                </span>
                <p className="text-xs text-slate-400 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] italic">
                  "{order.observations}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: State Machine & Live Audit Trail */}
        <div className="space-y-6">
          
          {/* Action Box: Transition State Terminal */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Transición de Fase</span>
              </h2>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                AUDITORÍA ACTIVA
              </span>
            </div>

            {statusError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                  Seleccionar Siguiente Estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RepairStatus)}
                  className="w-full bg-[#070a12]/90 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === order.status ? '— [ESTADO ACTUAL]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                  Nota / Bitácora Técnica de Justificación
                </label>
                <textarea
                  rows={3}
                  placeholder="Describa el motivo técnico o aprobación del cliente (ej: Pruebas hidrostáticas completadas satisfactoriamente)..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full bg-[#070a12]/90 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-sans text-slate-100 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus || newStatus === order.status}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-40 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>REGISTRANDO EN BLOCKCHAIN/DB...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>REGISTRAR CAMBIO DE ESTADO</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Audit Timeline */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Trazabilidad & Auditoría</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                {order.status_history?.length || 0} EVENTOS
              </span>
            </div>

            <div className="space-y-4">
              {!order.status_history || order.status_history.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono text-center py-6">
                  Sin eventos cronológicos registrados.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                  {order.status_history.map((h, idx) => (
                    <div key={h.id} className="relative group">
                      {/* Node indicator */}
                      <div
                        className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                          idx === 0
                            ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-500/20'
                            : 'bg-slate-800 border-slate-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={h.new_status} size="sm" />
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Operador: <span className="text-slate-200 font-semibold">{h.changed_by_user_name || 'Sistema'}</span>
                        </p>
                        {h.notes && (
                          <p className="text-xs text-slate-300 mt-1.5 bg-[#070a12]/80 p-2.5 rounded-lg border border-white/[0.06] font-sans">
                            "{h.notes}"
                          </p>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          {new Date(h.created_at).toLocaleDateString()}
                        </span>
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
