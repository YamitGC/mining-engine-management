import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  User, 
  Building2, 
  Cog, 
  ArrowRight,
  ClipboardList,
  Sparkles,
  X,
  Truck,
  Mountain,
  HardHat,
  Hammer
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { RepairOrder, Client, Engine, RepairStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';

export const RepairOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [modalClientId, setModalClientId] = useState<number | ''>('');
  const [modalEngineId, setModalEngineId] = useState<number | ''>('');
  const [problemDescription, setProblemDescription] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [observations, setObservations] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Motores filtrados según el cliente seleccionado en el modal
  const filteredModalEngines = engines.filter(
    (e) => modalClientId === '' || e.client_id === Number(modalClientId)
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = '/repair-orders?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedStatus) url += `status=${encodeURIComponent(selectedStatus)}&`;
      if (selectedClient) url += `client_id=${selectedClient}&`;

      const [ordersRes, clientsRes, enginesRes] = await Promise.all([
        businessApi.get(url),
        businessApi.get('/clients?active_only=true'),
        businessApi.get('/engines?active_only=true')
      ]);

      setOrders(ordersRes.data || []);
      setClients(clientsRes.data || []);
      setEngines(enginesRes.data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar las órdenes de reparación en el servicio de negocio.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, selectedClient]);

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreateModal = () => {
    const autoNumber = `ORD-CAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(autoNumber);
    setModalClientId('');
    setModalEngineId('');
    setProblemDescription('');
    setTechnicalDiagnosis('');
    setWorkPerformed('');
    setAssignedTechnician('');
    setEstimatedDeliveryDate('');
    setObservations('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleClientChangeInModal = (cId: number | '') => {
    setModalClientId(cId);
    setModalEngineId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClientId) {
      setFormError('Debe seleccionar la compañía minera propietaria');
      return;
    }
    if (!modalEngineId) {
      setFormError('Debe seleccionar el motor registrado para esta faena');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      await businessApi.post('/repair-orders', {
        order_number: orderNumber.trim(),
        client_id: Number(modalClientId),
        engine_id: Number(modalEngineId),
        problem_description: problemDescription.trim(),
        technical_diagnosis: technicalDiagnosis.trim() || null,
        work_performed: workPerformed.trim() || null,
        assigned_technician: assignedTechnician.trim() || null,
        estimated_delivery_date: estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toISOString() : null,
        observations: observations.trim() || null,
        status: 'Recibido'
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al emitir la orden de reparación técnica.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1 shadow-sm">
              <Wrench className="w-3.5 h-3.5" />
              <span>BAHÍAS DE OVERHAUL & TALLER</span>
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">{orders.length} órdenes en sistema</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight font-sans">
            Órdenes de Reparación & Diagnóstico
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Ciclo de vida operativo, hojas de ruta de maquinado y trazabilidad auditada de motores mineros.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-200 active:scale-95 self-start sm:self-auto border border-amber-300"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>INGRESAR ORDEN A BAHÍA</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mining-panel p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-2.5 bg-[#0B1019] px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus-within:border-amber-500/50 transition-colors">
          <Search className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por código de orden (ORD-CAT-...), mecánico o falla técnica..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 px-1.5 py-0.5 bg-amber-500/10 rounded"
            >
              LIMPIAR
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#0B1019] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">TODAS LAS FASES DE TALLER</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full bg-[#0B1019] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">TODAS LAS COMPAÑÍAS</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="mining-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1019] text-amber-400/90 font-mono uppercase text-[11px] font-black border-b border-white/[0.08]">
              <tr>
                <th className="py-4 px-6">Código de Orden</th>
                <th className="py-4 px-6">Compañía & Motor Asignado</th>
                <th className="py-4 px-6">Diagnóstico / Falla Reportada</th>
                <th className="py-4 px-6">Mecánico & Fecha Faena</th>
                <th className="py-4 px-6">Estado Bahía</th>
                <th className="py-4 px-6 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-mono">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>CONSULTANDO EXPEDIENTES DE REPARACIÓN...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-mono">
                    No se registran órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#182232] border border-amber-500/30 text-amber-400 font-mono font-black text-xs">
                        <Wrench className="w-3.5 h-3.5 text-amber-500" />
                        <span>{o.order_number}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        Ingreso: {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Mountain className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-100">{o.client?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono mt-1">
                        <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-amber-300 font-black">{o.engine?.serial_number}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300 font-semibold">{o.engine?.manufacturer} {o.engine?.model}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <p className="line-clamp-2 text-slate-200 text-xs font-sans leading-relaxed">
                        {o.problem_description}
                      </p>
                    </td>

                    <td className="py-4 px-6 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-100 font-bold">
                        <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{o.assigned_technician || 'Sin asignar'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>
                          {o.estimated_delivery_date
                            ? `Entrega: ${new Date(o.estimated_delivery_date).toLocaleDateString()}`
                            : 'Sin fecha de entrega'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={o.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <span>GESTIONAR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={orders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Crear Orden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1522] border border-amber-500/30 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black uppercase">
                  RECEPCIÓN EN TALLER
                </span>
                <h3 className="text-lg font-black text-slate-100 font-sans mt-1">
                  Apertura de Orden de Overhaul Minero
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Código de Orden (Auto-generado) *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Mecánico Líder Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ing. Carlos Pérez (Especialista CAT)"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Selector Dependiente: Cliente -> Motores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Compañía Minera Propietaria *
                  </label>
                  <select
                    required
                    value={modalClientId}
                    onChange={(e) => handleClientChangeInModal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="">Seleccione compañía minera...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Motor Asociado *
                  </label>
                  <select
                    required
                    disabled={!modalClientId}
                    value={modalEngineId}
                    onChange={(e) => setModalEngineId(Number(e.target.value))}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono disabled:opacity-40"
                  >
                    <option value="">
                      {!modalClientId ? 'Primero elija una compañía' : 'Seleccione número de serie...'}
                    </option>
                    {filteredModalEngines.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.serial_number} — {e.manufacturer} {e.model} ({e.power_capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Descripción de la Falla en Faena *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detalle la falla reportada en tajo (pérdida de presión de aceite, sobrecalentamiento en rampa, vibración excesiva de bancada)..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Diagnóstico Inicial & Metrología
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Inspección visual en bahía 1, medición de luz de aceite y juego axial..."
                    value={technicalDiagnosis}
                    onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Alcance del Trabajo Previsto
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Rectificado de cigüeñal, cambio de metales de biela, calibración de inyectores HEUI..."
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Fecha Compromiso de Entrega
                  </label>
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Observaciones Operativas
                  </label>
                  <input
                    type="text"
                    placeholder="Notas para el equipo de bahía y banco..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>GENERAR ORDEN DE TALLER</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
