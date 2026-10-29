import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Mail, Phone, Building2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
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
      const res = await businessApi.get(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setClients(res.data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar el catálogo de empresas mineras.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono uppercase tracking-widest font-bold">
              Directorio Corporativo
            </span>
            <span className="text-xs text-slate-400 font-mono">{clients.length} empresas registradas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Clientes & Empresas Mineras
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Control de contratistas, consorcios y titulares de maquinaria pesada.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>REGISTRAR CLIENTE</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Filtrar por razón social, número de identificación tributaria (NIT) o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full font-mono"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20"
          >
            LIMPIAR
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clients Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16]/80 text-slate-300 font-mono uppercase text-[11px] font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-6">Identificación Fiscal</th>
                <th className="py-4 px-6">Razón Social / Titular</th>
                <th className="py-4 px-6">Líneas de Contacto</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-mono">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>CONSULTANDO BASE DE DATOS...</span>
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
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400">
                      <span className="text-[10px] text-slate-400 mr-1.5">{c.id_type}</span>
                      <span>{c.id_number}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">REGISTRO #{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                          Activo
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
                        onClick={() => openEditModal(c)}
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
          totalItems={clients.length}
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
                  {modalMode === 'create' ? 'Alta de Empresa Minera' : 'Actualización de Datos'}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Validación de unicidad fiscal por número de identificación
                </p>
              </div>
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Tipo</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="NIT">NIT</option>
                    <option value="CC">Cédula (CC)</option>
                    <option value="RUT">RUT</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="900123456-1"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Minera San Jorge S.A.S"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operaciones@minera.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Teléfono (Solo Dígitos)
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="3001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveClient"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/[0.1]"
                  />
                  <label htmlFor="isActiveClient" className="text-xs font-mono text-slate-300">
                    Empresa autorizada en servicio activo
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
