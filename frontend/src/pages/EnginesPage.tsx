import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  X
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { Engine, Client } from '../types';
import { Pagination } from '../components/Pagination';

const STANDARD_MANUFACTURERS = [
  'Caterpillar',
  'Komatsu',
  'Cummins',
  'Detroit Diesel',
  'Hitachi'
];

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
  const [selectedManufacturer, setSelectedManufacturer] = useState('Caterpillar');
  const [customManufacturer, setCustomManufacturer] = useState('');
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
        if (manufacturerFilter === 'Otros') {
          const standardList = ['caterpillar', 'komatsu', 'cummins', 'detroit', 'hitachi'];
          result = result.filter((e: Engine) => 
            !standardList.some(std => e.manufacturer.toLowerCase().includes(std))
          );
        } else {
          result = result.filter((e: Engine) => 
            e.manufacturer.toLowerCase().includes(manufacturerFilter.toLowerCase())
          );
        }
      }

      setEngines(result);
      setClients(clientsRes.data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar el inventario de motores.');
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
    setSelectedManufacturer('Caterpillar');
    setCustomManufacturer('');
    setModel('3516B');
    setEngineType('Diésel V16');
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
    if (STANDARD_MANUFACTURERS.includes(engine.manufacturer)) {
      setSelectedManufacturer(engine.manufacturer);
      setCustomManufacturer('');
    } else {
      setSelectedManufacturer('Otro');
      setCustomManufacturer(engine.manufacturer);
    }
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
      setFormError('Debe asociar un cliente al motor');
      return;
    }

    const finalManufacturer = selectedManufacturer === 'Otro' ? customManufacturer.trim() : selectedManufacturer.trim();
    if (!finalManufacturer) {
      setFormError('Debe especificar el fabricante del motor');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (modalMode === 'create') {
        await businessApi.post('/engines', {
          serial_number: serialNumber.trim(),
          manufacturer: finalManufacturer,
          model: model.trim(),
          engine_type: engineType.trim(),
          power_capacity: powerCapacity.trim(),
          client_id: Number(clientId),
        });
      } else if (selectedEngine) {
        await businessApi.put(`/engines/${selectedEngine.id}`, {
          serial_number: serialNumber.trim(),
          manufacturer: finalManufacturer,
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
      const msg = err.response?.data?.detail || 'Error al guardar los datos del motor.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
              Motores
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#131B2E] border border-white/[0.08] text-slate-400 font-mono tabular-nums">
              {engines.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inventario técnico de motores y especificaciones
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3.5 py-2 rounded-md text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar motor</span>
        </button>
      </div>

      {/* Filter and Manufacturer Bar */}
      <div className="bg-[#131B2E] border border-white/[0.08] p-3 rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#0F1626] px-3 py-2 rounded-md border border-white/[0.08] focus-within:border-amber-500/60 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por número de serie, modelo o fabricante..."
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

          <div className="min-w-[240px]">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
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

        {/* Quick Manufacturer Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.06] text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Fabricante:</span>
          {['', 'Caterpillar', 'Komatsu', 'Cummins', 'Detroit', 'Hitachi', 'Otros'].map((m) => (
            <button
              key={m}
              onClick={() => setManufacturerFilter(m)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                manufacturerFilter === m
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-[#0F1626] text-slate-300 hover:bg-slate-800 border border-white/[0.08]'
              }`}
            >
              {m === '' ? 'Todos' : m}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Engines Table */}
      <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1626] text-slate-400 font-medium text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Número de serie</th>
                <th className="py-3 px-4">Fabricante y modelo</th>
                <th className="py-3 px-4">Tipo y potencia</th>
                <th className="py-3 px-4">Cliente</th>
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
                      <span>Cargando motores...</span>
                    </div>
                  </td>
                </tr>
              ) : engines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron motores con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedEngines.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-slate-100 text-xs">
                        {e.serial_number}
                      </span>
                      <p className="text-[11px] text-slate-500 font-sans">
                        ID #{e.id}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-200">
                        {e.manufacturer}
                      </span>
                      <span className="text-slate-400 ml-1.5 font-mono">
                        {e.model}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">
                        {e.engine_type}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {e.power_capacity}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">
                        {e.client?.name || `Cliente #${e.client_id}`}
                      </div>
                      {e.client?.id_number && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NIT: {e.client?.id_number}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {e.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700/40 text-slate-400 border border-white/[0.08]">
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(e)}
                        className="px-2.5 py-1 rounded border border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131B2E] border border-white/[0.1] rounded-lg w-full max-w-lg p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {modalMode === 'create' ? 'Registrar nuevo motor' : 'Editar motor'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {modalMode === 'create'
                    ? 'Ingrese los datos técnicos para dar de alta el motor'
                    : 'Modifique las especificaciones del motor'}
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
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cliente propietario *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Número de serie *
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fabricante *
                  </label>
                  <select
                    value={selectedManufacturer}
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  >
                    {STANDARD_MANUFACTURERS.map((mfg) => (
                      <option key={mfg} value={mfg}>{mfg}</option>
                    ))}
                    <option value="Otro">Otro (Especificar)</option>
                  </select>
                </div>

                {selectedManufacturer === 'Otro' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nombre del fabricante *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Liebherr, Volvo, Scania, Perkins..."
                      value={customManufacturer}
                      onChange={(e) => setCustomManufacturer(e.target.value)}
                      className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                )}

                <div className={selectedManufacturer === 'Otro' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 3516B, D16, QSK60"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Configuración *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Diésel V16"
                    value={engineType}
                    onChange={(e) => setEngineType(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Potencia (HP) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 3500 HP"
                    value={powerCapacity}
                    onChange={(e) => setPowerCapacity(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-[#0F1626] border-white/20 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">
                      Motor activo en inventario
                    </span>
                  </label>
                </div>
              )}

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
                  <span>{modalMode === 'create' ? 'Registrar motor' : 'Guardar cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
