import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User as UserIcon, 
  Mail, 
  Lock,
  X,
  Shield,
  Wrench,
  HardHat,
  Pickaxe
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/Pagination';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.get('/users');
      setUsers(res.data?.data?.users || []);
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar el directorio de usuarios en el microservicio de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Operación restringida: No puedes suspender tu propia credencial de supervisor activo.');
      return;
    }

    try {
      await authApi.patch(`/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado del operador');
    }
  };

  const handleChangeRole = async (user: User, newRole: UserRole) => {
    if (user.id === currentUser?.id) {
      alert('Operación restringida: No puedes degradar tu propio rol de supervisor general.');
      return;
    }

    try {
      await authApi.put(`/users/${user.id}`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar el perfil de permisos');
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      await authApi.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('OPERATOR');
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al emitir credenciales para el usuario.';
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
              <HardHat className="w-3.5 h-3.5" />
              <span>CUADRILLAS & CONTROL DE ACCESO</span>
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">{users.length} operadores registrados</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight font-sans">
            Personal de Taller & Cuadrillas Mineras
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Gestión de roles de seguridad (Supervisor / Mecánico Especialista) y firmas de trabajo en faena.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-200 active:scale-95 self-start sm:self-auto border border-amber-300"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>DAR DE ALTA OPERADOR</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="mining-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1019] text-amber-400/90 font-mono uppercase text-[11px] font-black border-b border-white/[0.08]">
              <tr>
                <th className="py-4 px-6">Identidad & Especialista</th>
                <th className="py-4 px-6">Correo Corporativo</th>
                <th className="py-4 px-6">Rol de Taller (RBAC)</th>
                <th className="py-4 px-6">Estado Cuenta</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-mono">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>CONSULTANDO CUADRILLAS EN SERVICIO AUTH...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-mono">
                    No se registran usuarios en la base de datos.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400 flex items-center justify-center text-slate-950 font-black font-mono text-sm shadow-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-100 text-sm">{u.name}</p>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-mono font-black">
                                  TÚ
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: #{u.id} · Ingreso: {new Date(u.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-200 font-mono">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-amber-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                          className={`bg-[#0B1019] border rounded-xl px-3 py-1.5 text-xs font-mono font-black focus:outline-none transition-colors disabled:opacity-60 cursor-pointer ${
                            u.role === 'ADMIN'
                              ? 'text-amber-300 border-amber-500/40 focus:border-amber-400'
                              : 'text-blue-300 border-blue-500/40 focus:border-blue-400'
                          }`}
                        >
                          <option value="ADMIN">🛡️ SUPERVISOR (Acceso Total)</option>
                          <option value="OPERATOR">⚙️ MECÁNICO (Taller Bahías)</option>
                        </select>
                      </td>

                      <td className="py-4 px-6">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            HABILITADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black bg-rose-500/15 text-rose-300 border border-rose-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            SUSPENDIDO
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right font-mono">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                            u.is_active
                              ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30'
                              : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                          }`}
                        >
                          {u.is_active ? 'SUSPENDER' : 'REACTIVAR'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1522] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black uppercase">
                  ALTA DE CUADRILLA
                </span>
                <h3 className="text-lg font-black text-slate-100 font-sans mt-1">
                  Registrar Operador de Mina
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

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ing. Laura Martínez (Especialista Motores)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="laura@mining.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Contraseña Inicial de Turno *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Rol de Acceso en Taller *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono font-bold"
                >
                  <option value="OPERATOR">⚙️ MECÁNICO ESPECIALISTA (Intervención de Motores & Órdenes)</option>
                  <option value="ADMIN">🛡️ SUPERVISOR GENERAL (Acceso Total & Cuadrillas)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-200 disabled:opacity-50 border border-amber-300"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>EMITIR CREDENCIAL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
