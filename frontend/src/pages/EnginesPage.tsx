import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Zap, 
  Cog,
  Truck,
  Fuel,
  Gauge,
  X,
  Mountain,
  Pickaxe
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { Engine, Client } from '../types';
import { Pagination } from '../components/Pagination';

export const EnginesPage: React.FC = () => {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');
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
  const [manufacturer, setManufacturer] = useState('Caterpillar');
  const [model, setModel] = useState('');
  const [engineType, setEngineType] = useState('Diésel V16 Twin-Turbo');
  const [powerCapacity, setPowerCapacity] = useState('3500 HP');
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

      let result = enginesRes.data || [];
      if (manufacturerFilter) {
        result = result.filter((e: Engine) => 
          e.manufacturer.toLowerCase().includes(manufacturerFilter.toLowerCase())
        );
      }

      setEngines(result);
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
  }, [search, selectedClientFilter, manufacturerFilter]);

  const paginatedEngines = engines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEngine(null);
    setSerialNumber(`ENG-CAT-${Math.floor(100000 + Math.random() * 900000)}`);
    setManufacturer('Caterpillar');
    setModel('3516B-HD');
    setEngineType('Diésel V16 Twin-Turbo');
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
      setFormError('Debe asociar una compañía minera al motor');
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
      const msg = err.response?.data?.detail || 'Error al persistir el motor en la base de datos.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getManufacturerBadge = (mfg: string) => {
    const lower = mfg.toLowerCase();
    if (lower.includes('caterpillar') || lower.includes('cat')) {
      return 'bg-amber-400 text-slate-950 font-black border border-amber-300';
    }
    if (lower.includes('komatsu')) {
      return 'bg-blue-600 text-white font-black border border-blue-400';
    }
    if (lower.includes('cummins')) {
      return 'bg-red-600 text-white font-black border border-red-400';
    }
    if (lower.includes('detroit') || lower.includes('mtu')) {
      return 'bg-emerald-600 text-white font-black border border-emerald-400';
    }
    return 'bg-slate-800 text-slate-200 font-bold border border-slate-700';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1 shadow-sm">
              <Truck className="w-3.5 h-3.5" />
              <span>FLOTA DE MAQUINARIA PESADA</span>
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">{engines.length} motores registrados</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight font-sans">
            Parque de Motores de Alta Potencia
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Inventario técnico de motores diésel para camiones de extracción, palas hidráulicas y generadores mineros.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-200 active:scale-95 self-start sm:self-auto border border-amber-300"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>INGRESAR MOTOR A PARQUE</span>
        </button>
      </div>

      {/* Filter and Manufacturer Bar */}
      <div className="mining-panel p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 bg-[#0B1019] px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus-within:border-amber-500/50">
            <Search className="w-4 h-4 text-amber-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por número de serie, modelo (3516B, QSK60, C175) o fabricante..."
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

          <div className="flex items-center gap-2 min-w-[280px]">
            <Filter className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="w-full bg-[#0B1019] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">TODAS LAS COMPAÑÍAS MINERAS</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (NIT: {c.id_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Manufacturer Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
          <span className="text-slate-400 text-[11px] font-bold">FABRICANTE:</span>
          {['', 'Caterpillar', 'Komatsu', 'Cummins', 'Detroit'].map((m) => (
            <button
              key={m}
              onClick={() => setManufacturerFilter(m)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                manufacturerFilter === m
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-[#141C2B] text-slate-300 hover:text-amber-300 border border-white/[0.06]'
              }`}
            >
              {m === '' ? 'TODOS' : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Engines Table */}
      <div className="mining-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1019] text-amber-400/90 font-mono uppercase text-[11px] font-black border-b border-white/[0.08]">
              <tr>
                <th className="py-4 px-6">Identificador & Serie</th>
                <th className="py-4 px-6">Marca & Modelo</th>
                <th className="py-4 px-6">Configuración & Potencia</th>
                <th className="py-4 px-6">Compañía / Faena Minera</th>
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
                      <span>CONSULTANDO PARQUE DE MAQUINARIA PESADA...</span>
                    </div>
                  </td>
                </tr>
              ) : engines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-mono">
                    No se registran motores con los parámetros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedEngines.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#182234] border border-amber-500/30 text-amber-400">
                          <Cpu className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                            {e.serial_number}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">ID #{e.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getManufacturerBadge(e.manufacturer)}`}>
                          {e.manufacturer}
                        </span>
                        <span className="font-bold text-slate-100 text-xs">
                          {e.model}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1 font-mono text-[11px]">
                        <p className="text-slate-200 flex items-center gap-1.5">
                          <Fuel className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{e.engine_type}</span>
                        </p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>{e.power_capacity}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-100">{e.client?.name || `Cliente #${e.client_id}`}</p>
                          <p className="text-[10px] font-mono text-slate-400">NIT: {e.client?.id_number}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {e.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                          OPERATIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          EN REVISIÓN
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(e)}
                        className="text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1522] rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative border border-amber-500/30">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black uppercase">
                  {modalMode === 'create' ? 'ALTA DE MOTOR' : 'MODIFICAR FICHA'}
                </span>
                <h3 className="text-lg font-black text-slate-100 font-sans mt-1">
                  {modalMode === 'create' ? 'Ingreso de Motor Pesado' : 'Modificación de Especificaciones'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-slate-100 flex items-center justify-center"
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
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Compañía Minera Propietaria *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Seleccione titular minero...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — NIT: {c.id_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Número de Serie Único (Block ID) *
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Fabricante *
                  </label>
                  <select
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Caterpillar">Caterpillar (CAT)</option>
                    <option value="Komatsu">Komatsu</option>
                    <option value="Cummins">Cummins Mining</option>
                    <option value="Detroit Diesel">Detroit Diesel / MTU</option>
                    <option value="Hitachi">Hitachi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Modelo de Motor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 3516B-HD, QSK60"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Configuración / Ciclo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Diésel V16 Twin-Turbo"
                    value={engineType}
                    onChange={(e) => setEngineType(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Potencia Bruta (HP) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 3500 HP"
                    value={powerCapacity}
                    onChange={(e) => setPowerCapacity(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-[#080D15] border-white/20 focus:ring-0"
                    />
                    <span className="text-xs font-mono text-slate-200">
                      Motor Habilitado en Parque Operativo
                    </span>
                  </label>
                </div>
              )}

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
                  <span>{modalMode === 'create' ? 'REGISTRAR MOTOR' : 'GUARDAR CAMBIOS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

