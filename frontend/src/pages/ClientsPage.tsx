import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  X,
  Mountain,
  Pickaxe
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { Client } from '../types';
import { Pagination } from '../components/Pagination';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [idType, setIdType] = useState('NIT');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = search ? `/clients?search=${encodeURIComponent(search)}` : '/clients';
      const res = await businessApi.get(url);
      setClients(res.data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar el directorio de clientes en el microservicio de negocio.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedClient(null);
    setName('');
    setIdType('NIT');
    setIdNumber('');
    setEmail('');
    setPhone('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setName(client.name);
    setIdType(client.id_type);
    setIdNumber(client.id_number);
    setEmail(client.email);
    setPhone(client.phone || '');
    setIsActive(client.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      if (modalMode === 'create') {
        await businessApi.post('/clients', {
          name: name.trim(),
          id_type: idType.trim(),
          id_number: idNumber.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        });
      } else if (selectedClient) {
        await businessApi.put(`/clients/${selectedClient.id}`, {
          name: name.trim(),
          id_type: idType.trim(),
          id_number: idNumber.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          is_active: isActive,
        });
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al persistir los datos del cliente.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1 shadow-sm">
              <Mountain className="w-3.5 h-3.5" />
              <span>YACIMIENTOS & FAENAS</span>
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">{clients.length} empresas mineras</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight font-sans">
            Compañías Mineras & Contratistas
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Directorio de titulares mineros, concesiones de tajo abierto y consorcios de maquinaria pesada.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-200 active:scale-95 self-start sm:self-auto border border-amber-300"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>REGISTRAR EMPRESA MINERA</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="mining-panel p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Filtrar por razón social, número de identificación tributaria (NIT) o correo de faena..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full font-mono"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-[10px] font-mono text-amber-400 hover:text-amber-300 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/25"
          >
            LIMPIAR
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clients Table */}
      <div className="mining-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1019] text-amber-400/90 font-mono uppercase text-[11px] font-black border-b border-white/[0.08]">
              <tr>
                <th className="py-4 px-6">Identificación Fiscal (NIT)</th>
                <th className="py-4 px-6">Compañía Minera / Titular</th>
                <th className="py-4 px-6">Líneas de Contacto & Faena</th>
                <th className="py-4 px-6">Estado Contrato</th>
                <th className="py-4 px-6 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-mono">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>CONSULTANDO DIRECTORIO MINERO...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-mono">
                    No se registran empresas con los parámetros solicitados.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-6 font-mono">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#182232] border border-amber-500/30 text-amber-400 font-black text-xs">
                        <span>{c.id_type}:</span>
                        <span>{c.id_number}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">ID Contrato: #{c.id}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#182234] border border-amber-500/30 text-amber-400">
                          <Mountain className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 text-sm tracking-tight">{c.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">Concesión / Tajo Minero</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-[11px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-amber-500" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <Phone className="w-3.5 h-3.5 text-amber-500" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                          VIGENTE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          SUSPENDIDO
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(c)}
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
          totalItems={clients.length}
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
                  {modalMode === 'create' ? 'ALTA DE CONCESIÓN' : 'MODIFICAR EMPRESA'}
                </span>
                <h3 className="text-lg font-black text-slate-100 font-sans mt-1">
                  {modalMode === 'create' ? 'Registrar Compañía Minera' : 'Actualizar Datos de Empresa'}
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
                  Razón Social / Titular Minero *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Minera Cerrejón S.A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Tipo Doc *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="NIT">NIT</option>
                    <option value="RUT">RUT</option>
                    <option value="RUC">RUC</option>
                    <option value="CC">CC</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    Número de Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-7"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Correo Electrónico de Enlace *
                </label>
                <input
                  type="email"
                  required
                  placeholder="operaciones@mineracerrejon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Línea Telefónica de Taller (Solo dígitos)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="3001234567"
                  value={phone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '');
                    setPhone(onlyNums);
                  }}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  * Solo dígitos numéricos permitidos (sin caracteres especiales).
                </span>
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
                      Empresa con contrato de mantenimiento activo
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
                  <span>{modalMode === 'create' ? 'REGISTRAR EMPRESA' : 'GUARDAR CAMBIOS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
