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
  Wrench
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
      alert('Operación restringida: No puedes suspender tu propia credencial de administrador activo.');
      return;
    }

    try {
      await authApi.patch(`/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado de usuario');
    }
  };

  const handleChangeRole = async (user: User, newRole: UserRole) => {
    if (user.id === currentUser?.id) {
      alert('Operación restringida: No puedes degradar tu propio rol de administrador.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-amber-500" />
              <span>Control de Acceso & RBAC</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">{users.length} cuentas registradas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Administración de Usuarios & Permisos
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Gestión centralizada de credenciales, tokens JWT y perfiles de operador en la mina.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>CREAR USUARIO</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16]/80 text-slate-300 font-mono uppercase text-[11px] font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-6">Identidad & Operador</th>
                <th className="py-4 px-6">Correo Corporativo</th>
                <th className="py-4 px-6">Rol Criptográfico</th>
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
                      <span>CONSULTANDO SERVICIO AUTH...</span>
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
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shadow-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-100">{u.name}</p>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold">
                                  TÚ
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID: #{u.id} · Creado: {new Date(u.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-300 font-mono">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="inline-flex items-center">
                          <select
                            value={u.role}
                            disabled={isCurrent}
                            onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                            className={`bg-slate-950/80 border rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none transition-colors disabled:opacity-60 cursor-pointer ${
                              u.role === 'ADMIN'
                                ? 'text-amber-400 border-amber-500/30 focus:border-amber-500'
                                : 'text-blue-400 border-blue-500/30 focus:border-blue-500'
                            }`}
                          >
                            <option value="ADMIN">🛡️ ADMIN (Acceso Total)</option>
                            <option value="OPERATOR">⚙️ OPERATOR (Taller)</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            ACTIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            SUSPENDIDO
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right font-mono">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                            u.is_active
                              ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20'
                              : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20'
                          }`}
                        >
                          {u.is_active ? 'DESACTIVAR' : 'REACTIVAR'}
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
          <div className="bg-[#0b0f19] border border-white/[0.12] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                    Alta de Operador
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-100 font-sans">
                  Registrar Nueva Cuenta
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-mono">
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
                  placeholder="Ej: Ing. Laura Martínez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
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
                  className="w-full bg-slate-950/80 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres alfanuméricos"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  Rol de Acceso RBAC *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950/80 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="OPERATOR">OPERATOR (Gestión de Motores y Órdenes)</option>
                  <option value="ADMIN">ADMIN (Acceso Total y Administración de Usuarios)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs font-mono tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-200 disabled:opacity-50"
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


