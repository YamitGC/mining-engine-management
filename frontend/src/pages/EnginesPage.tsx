import React, { useEffect, useState } from 'react';
import { Cog, Plus, Search, Filter, AlertCircle, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { Engine, Client } from '../types';
import { Pagination } from '../components/Pagination';

export const EnginesPage: React.FC = () => {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);

  // Form State
  const [serialNumber, setSerialNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [engineType, setEngineType] = useState('');
  const [powerCapacity, setPowerCapacity] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = '/engines?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedClientFilter) url += `client_id=${selectedClientFilter}&`;

      const [enginesRes, clientsRes] = await Promise.all([
        businessApi.get(url),
        businessApi.get('/clients?active_only=true')
      ]);

      setEngines(enginesRes.data || []);
      setClients(clientsRes.data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar la información de motores o clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedClientFilter]);

  const paginatedEngines = engines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEngine(null);
    setSerialNumber('');
    setManufacturer('Caterpillar');
    setModel('');
    setEngineType('Diesel Turboalimentado');
    setPowerCapacity('');
    setClientId(clients[0]?.id || '');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (engine: Engine) => {
    setModalMode('edit');
    setSelectedEngine(engine);
    setSerialNumber(engine.serial_number);
    setManufacturer(engine.manufacturer);
    setModel(engine.model);
    setEngineType(engine.engine_type);
    setPowerCapacity(engine.power_capacity);
    setClientId(engine.client_id);
    setIsActive(engine.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setFormError('Debe seleccionar un cliente propietario');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (modalMode === 'create') {
        await businessApi.post('/engines', {
          serial_number: serialNumber,
          manufacturer,
          model,
          engine_type: engineType,
          power_capacity: powerCapacity,
          client_id: Number(clientId),
        });
      } else if (selectedEngine) {
        await businessApi.put(`/engines/${selectedEngine.id}`, {
          serial_number: serialNumber,
          manufacturer,
          model,
          engine_type: engineType,
          power_capacity: powerCapacity,
          client_id: Number(clientId),
          is_active: isActive,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al guardar los datos del motor.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Parque de Motores Mineros</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro técnico de motores pesados, especificaciones y clientes asociados.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Motor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-slate-950/60 px-3.5 py-2 rounded-lg border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de serie, fabricante o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[240px]">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id_number})
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

      {/* Engines Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Serie / Código</th>
                <th className="py-3.5 px-6">Fabricante & Modelo</th>
                <th className="py-3.5 px-6">Especificaciones</th>
                <th className="py-3.5 px-6">Cliente Propietario</th>
                <th className="py-3.5 px-6">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando motores...</span>
                    </div>
                  </td>
                </tr>
              ) : engines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No se encontraron motores registrados.
                  </td>
                </tr>
              ) : (
                paginatedEngines.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400">
                      <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4 text-amber-500" />
                        <span>{e.serial_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-100">{e.manufacturer}</p>
                      <p className="text-slate-400 text-[11px]">{e.model}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <p>{e.engine_type}</p>
                      <p className="text-amber-500/80 font-medium text-[11px]">{e.power_capacity}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{e.client?.name || `Cliente #${e.client_id}`}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {e.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(e)}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={engines.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              {modalMode === 'create' ? 'Registrar Nuevo Motor Minero' : 'Editar Ficha de Motor'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Ingrese el número de serie único y especificaciones de ingeniería.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cliente Propietario *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id_type} {c.id_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Código Interno o Número de Serie *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CAT-C175-9988"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fabricante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Caterpillar, Cummins"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: C175-16, QSK60"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Motor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Diesel Turbo V16"
                    value={engineType}
                    onChange={(e) => setEngineType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Potencia / Capacidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 3500 HP / 2610 kW"
                    value={powerCapacity}
                    onChange={(e) => setPowerCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isEngineActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="isEngineActive" className="text-xs text-slate-300">
                    Motor activo en servicio
                  </label>
                </div>
              )}

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
                  <span>{modalMode === 'create' ? 'Registrar' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

