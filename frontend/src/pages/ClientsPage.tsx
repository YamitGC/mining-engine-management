import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  AlertTriangle, 
  X
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
      setError('Error al consultar el directorio de clientes.');
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
      const msg = err.response?.data?.detail || 'Error al guardar los datos del cliente.';
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
              Clientes
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#131B2E] border border-white/[0.08] text-slate-400 font-mono tabular-nums">
              {clients.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Directorio de empresas mineras y contratistas
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3.5 py-2 rounded-md text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear cliente</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#131B2E] border border-white/[0.08] p-3 rounded-lg flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Buscar por razón social, NIT o correo..."
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

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1626] text-slate-400 font-medium text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Documento / NIT</th>
                <th className="py-3 px-4">Razón social</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>Cargando directorio de clientes...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron clientes con el filtro indicado.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-slate-100 text-xs">
                        {c.id_number}
                      </span>
                      <p className="text-[11px] text-slate-500 font-sans">
                        {c.id_type} · ID #{c.id}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-200">
                        {c.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">
                        {c.email}
                      </div>
                      {c.phone && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {c.phone}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.is_active ? (
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
                        onClick={() => openEditModal(c)}
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
          totalItems={clients.length}
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
                  {modalMode === 'create' ? 'Registrar nuevo cliente' : 'Editar cliente'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {modalMode === 'create'
                    ? 'Ingrese los datos de la empresa o contratista'
                    : 'Actualice los datos de contacto y facturación'}
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
                  Razón social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Minera Cerrejón S.A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo doc. *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="NIT">NIT</option>
                    <option value="RUT">RUT</option>
                    <option value="RUC">RUC</option>
                    <option value="CC">CC</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número de documento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-7"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Teléfono (solo números)
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
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 font-mono"
                />
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
                      Cliente con contrato activo
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
                  <span>{modalMode === 'create' ? 'Crear cliente' : 'Guardar cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
