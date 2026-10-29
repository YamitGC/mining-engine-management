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
  Check,
  Truck,
  Mountain,
  HardHat,
  Gauge,
  Fuel,
  Hammer
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
      setError('Error al consultar el expediente técnico de la orden de reparación.');
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
      setSuccessMessage(`Fase de taller actualizada exitosamente a "${newStatus}"`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al actualizar la fase técnica del motor.';
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
          <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-amber-400 tracking-wider font-bold">
            RECUPERANDO EXPEDIENTE TÉCNICO DE MOTOR...
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al taller de overhaul</span>
        </Link>
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono">
          {error || 'Expediente no localizado en el sistema.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="mining-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 hazard-ribbon"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-start gap-4">
            <Link
              to="/orders"
              className="p-2.5 bg-[#0B1019] hover:bg-[#182232] text-amber-400 rounded-xl border border-amber-500/30 transition-all hover:scale-105 shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-wider">
                  {order.order_number}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1.5 flex items-center gap-2">
                <span className="text-slate-400">Recepción en Bahía:</span>
                <span className="text-slate-200 font-bold">{new Date(order.reception_date).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs bg-[#0B1019] border border-amber-500/30 px-4 py-2 rounded-xl">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">FASE OPERATIVA:</span>
            <span className="text-amber-300 font-black">{order.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Grid: 2 Columns for Tech Specs & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tech Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Linked Engine & Client */}
          <div className="mining-panel p-6 rounded-2xl">
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Maquinaria Pesada & Compañía Minera</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Motor */}
              <div className="bg-[#0B1019] p-4 rounded-xl border border-white/[0.08] relative overflow-hidden group">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>BLOCK MOTOR</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">
                    {order.engine?.manufacturer?.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-mono text-xl font-black text-amber-300 tracking-wider">
                  {order.engine?.serial_number}
                </h3>
                <p className="text-xs text-slate-200 font-bold mt-0.5">
                  Modelo: {order.engine?.model}
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CONFIGURACIÓN</span>
                    <span className="text-slate-200 font-semibold">{order.engine?.engine_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">POTENCIA BRUTA</span>
                    <span className="text-amber-400 font-black">{order.engine?.power_capacity}</span>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-[#0B1019] p-4 rounded-xl border border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Mountain className="w-4 h-4" />
                    <span>FAENA / CONCESIÓN</span>
                  </div>
                  <span className="text-[10px] bg-[#182234] text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    TITULAR
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-100">
                  {order.client?.name}
                </h3>
                <p className="text-xs font-mono text-amber-400/90 mt-0.5 font-bold">
                  {order.client?.id_type}: {order.client?.id_number}
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1 text-xs">
                  <p className="text-slate-300 flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">ENLACE:</span>
                    <span>{order.client?.email}</span>
                  </p>
                  {order.client?.phone && (
                    <p className="text-amber-400 flex items-center gap-2 font-mono text-xs font-bold">
                      <span className="text-slate-400 text-[11px]">TELÉFONO:</span>
                      <span>{order.client?.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Technical Diagnostic Sheet */}
          <div className="mining-panel p-6 rounded-2xl space-y-5">
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Expediente de Desarme & Plan de Overhaul</span>
            </h2>

            <div>
              <span className="text-[11px] font-mono uppercase text-slate-300 font-bold block mb-1.5">
                Falla Reportada en Faena Minera
              </span>
              <div className="bg-[#0B1019] p-4 rounded-xl border border-white/[0.08] text-xs text-slate-100 leading-relaxed font-sans">
                {order.problem_description}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-300 font-bold block mb-1.5">
                  Metrología & Diagnóstico de Taller
                </span>
                <div className="bg-[#0B1019] p-3.5 rounded-xl border border-white/[0.08] text-xs text-slate-200 min-h-[75px] leading-relaxed">
                  {order.technical_diagnosis || (
                    <span className="italic text-slate-500 font-mono">Fase de metrología e inspección en curso.</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-300 font-bold block mb-1.5">
                  Trabajo Realizado / Repuestos Nuevos
                </span>
                <div className="bg-[#0B1019] p-3.5 rounded-xl border border-white/[0.08] text-xs text-slate-200 min-h-[75px] leading-relaxed">
                  {order.work_performed || (
                    <span className="italic text-slate-500 font-mono">Sin intervenciones registradas hasta el momento.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/[0.08] text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#0B1019] border border-white/[0.08]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Mecánico Líder</span>
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-400" />
                  {order.assigned_technician || 'Por asignar'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1019] border border-white/[0.08]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Fecha Compromiso</span>
                <span className="font-bold text-amber-300">
                  {order.estimated_delivery_date
                    ? new Date(order.estimated_delivery_date).toLocaleDateString()
                    : 'Sin fecha programada'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1019] border border-white/[0.08]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Entrega Real Faena</span>
                <span className="font-bold text-emerald-400">
                  {order.actual_delivery_date
                    ? new Date(order.actual_delivery_date).toLocaleDateString()
                    : 'En ciclo de reparación'}
                </span>
              </div>
            </div>

            {order.observations && (
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Notas de Taller & Observaciones
                </span>
                <p className="text-xs text-slate-300 bg-[#0B1019] p-3 rounded-xl border border-white/[0.08] italic">
                  "{order.observations}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: State Machine & Live Audit Trail */}
        <div className="space-y-6">
          
          {/* Action Box: Transition State Terminal */}
          <div className="mining-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/20">
              <h2 className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Transición de Fase</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-950 bg-amber-400 px-2 py-0.5 rounded font-black">
                AUDITORÍA ACTIVA
              </span>
            </div>

            {statusError && (
              <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 font-bold mb-1.5">
                  Mover a Siguiente Estación
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RepairStatus)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === order.status ? '— [FASE ACTUAL]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 font-bold mb-1.5">
                  Bitácora Técnica / Firma de Operador
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalle el resultado técnico de la fase (ej: Holguras de bancada dentro de tolerancia CAT, prueba hidrostática superada a 45 PSI)..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-sans text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus || newStatus === order.status}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-40 shadow-[0_0_20px_rgba(245,158,11,0.25)] border border-amber-300"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>REGISTRANDO EN DB AUDITORÍA...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>CERTIFICAR CAMBIO DE FASE</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Audit Timeline */}
          <div className="mining-panel p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/20">
              <h2 className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Trazabilidad de Taller</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-300 font-bold">
                {order.status_history?.length || 0} EVENTOS
              </span>
            </div>

            <div className="space-y-4">
              {!order.status_history || order.status_history.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono text-center py-6">
                  Sin eventos cronológicos registrados.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/30">
                  {order.status_history.map((h, idx) => (
                    <div key={h.id} className="relative group">
                      <div
                        className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                          idx === 0
                            ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-500/30'
                            : 'bg-slate-800 border-slate-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={h.new_status} size="sm" />
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-300 mt-1">
                          Operador: <span className="text-amber-300 font-bold">{h.changed_by_user_name || 'Sistema'}</span>
                        </p>
                        {h.notes && (
                          <p className="text-xs text-slate-200 mt-1.5 bg-[#0B1019] p-2.5 rounded-lg border border-white/[0.08] font-sans">
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
