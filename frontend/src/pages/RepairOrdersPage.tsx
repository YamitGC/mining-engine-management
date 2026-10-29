import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Calendar, 
  User, 
  ArrowRight,
  X,
  FileText
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

  // Engines filtered by selected client in modal
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
      setError('Error al consultar las órdenes de trabajo.');
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
      setFormError('Debe seleccionar el cliente propietario');
      return;
    }
    if (!modalEngineId) {
      setFormError('Debe seleccionar el motor a reparar');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const maxDateStr = '2100-12-31';

    if (estimatedDeliveryDate) {
      if (estimatedDeliveryDate < todayStr) {
        setFormError(`La fecha estimada de entrega no puede ser anterior al día de hoy (${todayStr}).`);
        return;
      }
      if (estimatedDeliveryDate > maxDateStr) {
        setFormError('La fecha estimada de entrega no puede superar el año 2100.');
        return;
      }
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
      const msg = err.response?.data?.detail || 'Error al crear la orden de trabajo.';
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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
              Órdenes de trabajo
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#131B2E] border border-white/[0.08] text-slate-400 font-mono tabular-nums">
              {orders.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seguimiento y registro de reparaciones en taller
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3.5 py-2 rounded-md text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva orden</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#131B2E] border border-white/[0.08] p-3 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-2 bg-[#0F1626] px-3 py-2 rounded-md border border-white/[0.08] focus-within:border-amber-500/60 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por código de orden, técnico o falla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Limpiar
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#0F1626] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los estados</option>
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
            className="w-full bg-[#0F1626] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1626] text-slate-400 font-medium text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Cliente / Motor</th>
                <th className="py-3 px-4">Falla reportada</th>
                <th className="py-3 px-4">Técnico / Entrega</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>Cargando órdenes de trabajo...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-100 text-xs">
                        {o.order_number}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">
                        {o.client?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                        <span className="text-slate-300">{o.engine?.serial_number}</span>
                        <span>·</span>
                        <span className="text-slate-400 font-sans">{o.engine?.manufacturer} {o.engine?.model}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-300 text-xs leading-relaxed">
                        {o.problem_description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="text-slate-200 font-medium">
                        {o.assigned_technician || <span className="text-slate-500 italic">Sin asignar</span>}
                      </div>
                      <div className="text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>
                          {o.estimated_delivery_date
                            ? new Date(o.estimated_delivery_date).toLocaleDateString()
                            : 'Sin fecha'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                      >
                        <span>Detalle</span>
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

      {/* Modal Nueva Orden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131B2E] border border-white/[0.1] rounded-lg w-full max-w-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Nueva orden de trabajo
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete los datos técnicos para registrar el ingreso a taller
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-start gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Código de orden *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Técnico asignado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Pérez"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Selector Dependiente: Cliente -> Motores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cliente *
                  </label>
                  <select
                    required
                    value={modalClientId}
                    onChange={(e) => handleClientChangeInModal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="">Seleccione un cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Motor *
                  </label>
                  <select
                    required
                    disabled={!modalClientId}
                    value={modalEngineId}
                    onChange={(e) => setModalEngineId(Number(e.target.value))}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 disabled:opacity-40"
                  >
                    <option value="">
                      {!modalClientId ? 'Primero seleccione un cliente' : 'Seleccione un motor...'}
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
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del problema *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detalle la falla reportada por el cliente..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Diagnóstico inicial
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Inspección visual y metrología preliminar..."
                    value={technicalDiagnosis}
                    onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Alcance de trabajo previsto
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Repuestos o procedimientos requeridos..."
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha estimada de entrega
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max="2100-12-31"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Rango permitido: desde hoy hasta el año 2100
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Observaciones
                  </label>
                  <input
                    type="text"
                    placeholder="Notas adicionales..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-md text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving && (
                    <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>Crear orden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
