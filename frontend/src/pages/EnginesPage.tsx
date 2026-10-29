import React, { useEffect, useState } from 'react';
import { Cpu, Plus, Search, Filter, AlertTriangle, CheckCircle2, XCircle, Building2, Zap, Cog } from 'lucide-react';
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
      setError('Error al consultar el inventario de motores mineros.');
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
    setPowerCapacity('3500 HP');
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
      setFormError('Debe asociar un cliente minero al motor');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (modalMode === 'create') {
        await businessApi.post('/engines', {
          serial_number: serialNumber.trim(),
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          engine_type: engineType.trim(),
          power_capacity: powerCapacity.trim(),
          client_id: Number(clientId),
        });
      } else if (selectedEngine) {
        await businessApi.put(`/engines/${selectedEngine.id}`, {
          serial_number: serialNumber.trim(),
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          engine_type: engineType.trim(),
          power_capacity: powerCapacity.trim(),
          client_id: Number(clientId),
          is_active: isActive,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al persistir el registro del motor.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
              Flota de Motores Pesados
            </span>
            <span className="text-xs text-slate-400 font-mono">{engines.length} unidades inventariadas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Inventario & Ficha de Motores
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Especificaciones técnicas, fabricantes, cubicaje y vinculación con concesiones mineras.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>INGRESAR MOTOR</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-2xl flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#070a12]/80 px-3.5 py-2 rounded-xl border border-white/[0.06]">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por número de serie, fabricante (Caterpillar, Cummins, Komatsu) o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[260px]">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">TODOS LOS CLIENTES PROPIETARIOS</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Engines Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16]/80 text-slate-300 font-mono uppercase text-[11px] font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-6">Código de Serie</th>
                <th className="py-4 px-6">Fabricante & Modelo</th>
                <th className="py-4 px-6">Especificaciones de Potencia</th>
                <th className="py-4 px-6">Propietario</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-mono">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>CONSULTANDO PARQUE DE MAQUINARIA...</span>
                    </div>
                  </td>
                </tr>
              ) : engines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-mono">
                    No se registran motores con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedEngines.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400 tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                          <Cpu className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </div>
                        <span>{e.serial_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-100">{e.manufacturer}</p>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {e.model}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <p className="text-slate-200">{e.engine_type}</p>
                        <p className="text-amber-400 font-bold">{e.power_capacity}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-200">{e.client?.name || `Cliente #${e.client_id}`}</p>
                          <p className="text-[10px] font-mono text-slate-400">{e.client?.id_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {e.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                          Operativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(e)}
                        className="text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/25 transition-all"
                      >
                        EDITAR
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
        <div className="fixed inset-0 z-50 bg-[#070a12]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative border border-white/[0.1]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wide">
                  {modalMode === 'create' ? 'Alta de Motor en Taller' : 'Modificación de Ficha de Motor'}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Registro de serie única con especificaciones de ingeniería
                </p>
              </div>
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Empresa Propietaria *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Seleccione una empresa...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id_type} {c.id_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Número de Serie / Código Único *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CAT-C175-9988"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Fabricante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Caterpillar, Cummins"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: C175-16, QSK60"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Tipo de Combustión *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Diesel Turbo V16"
                    value={engineType}
                    onChange={(e) => setEngineType(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Potencia / Capacidad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 3500 HP / 2610 kW"
                    value={powerCapacity}
                    onChange={(e) => setPowerCapacity(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isEngineActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/[0.1]"
                  />
                  <label htmlFor="isEngineActiveCheck" className="text-xs font-mono text-slate-300">
                    Motor disponible para asignación de órdenes
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-5 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{modalMode === 'create' ? 'CREAR REGISTRO' : 'GUARDAR CAMBIOS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
