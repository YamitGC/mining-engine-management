import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  Calendar, 
  User, 
  Building2, 
  Cog, 
  ArrowRight 
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { RepairOrder, Client, Engine, RepairStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

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
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar las órdenes de reparación.');
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

  const openCreateModal = () => {
    const autoNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    setModalEngineId(''); // Reset motor selection
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClientId) {
      setFormError('Debe seleccionar un cliente');
      return;
    }
    if (!modalEngineId) {
      setFormError('Debe seleccionar un motor asociado al cliente');
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
      const msg = err.response?.data?.detail || 'Error al registrar la orden de reparación.';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Órdenes de Reparación</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro, diagnóstico técnico y seguimiento del ciclo de vida de motores pesados.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Reparación</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-3 bg-slate-950/60 px-3.5 py-2 rounded-lg border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por # de orden, técnico responsable o problema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los Estados</option>
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
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">No. Orden</th>
                <th className="py-3.5 px-6">Cliente & Motor</th>
                <th className="py-3.5 px-6">Problema Reportado</th>
                <th className="py-3.5 px-6">Técnico & Entrega</th>
                <th className="py-3.5 px-6">Estado</th>
                <th className="py-3.5 px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando órdenes de reparación...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No se encontraron órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400 text-sm">
                      {o.order_number}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-100">{o.client?.name}</p>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                        <Cog className="w-3.5 h-3.5 text-amber-500" />
                        <span>{o.engine?.serial_number} ({o.engine?.manufacturer} {o.engine?.model})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="line-clamp-2 text-slate-300 text-xs">
                        {o.problem_description}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <p className="text-slate-200">{o.assigned_technician || 'Sin técnico'}</p>
                      <p className="text-[11px] text-slate-500">
                        {o.estimated_delivery_date
                          ? `Est: ${new Date(o.estimated_delivery_date).toLocaleDateString()}`
                          : 'Sin fecha est.'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors"
                      >
                        <span>Gestionar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Orden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Nueva Orden de Reparación
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Ingrese la recepción técnica del motor y asigne el diagnóstico inicial.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número de Orden *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Técnico Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ing. Carlos Pérez"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selector Dependiente: Cliente -> Motores */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cliente Propietario *
                  </label>
                  <select
                    required
                    value={modalClientId}
                    onChange={(e) => handleClientChangeInModal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
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
                    Motor Asociado *
                  </label>
                  <select
                    required
                    disabled={!modalClientId}
                    value={modalEngineId}
                    onChange={(e) => setModalEngineId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                  >
                    <option value="">
                      {!modalClientId ? 'Primero seleccione un cliente' : 'Seleccione un motor...'}
                    </option>
                    {filteredModalEngines.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.serial_number} - {e.manufacturer} {e.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del Problema Reportado *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detalle la falla reportada por el cliente (ej: pérdida de potencia, ruidos anormales, sobrecalentamiento)..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Diagnóstico Técnico Preliminar
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Diagnóstico inicial del taller..."
                    value={technicalDiagnosis}
                    onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Trabajo Requerido
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Reparaciones o reemplazos previstos..."
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha Estimada de Entrega
                  </label>
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Observaciones Adicionales
                  </label>
                  <input
                    type="text"
                    placeholder="Notas para el equipo técnico..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>Crear Orden de Reparación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
