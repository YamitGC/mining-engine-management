import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Pickaxe, 
  Lock, 
  Mail, 
  AlertTriangle, 
  ArrowRight, 
  HardHat, 
  Shield, 
  User, 
  UserPlus, 
  LogIn 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'login' }) => {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname === '/register' || initialMode === 'register' ? 'register' : 'login'
  );

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OPERATOR' | 'ADMIN'>('OPERATOR');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, role);
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = 
        err.response?.data?.message || 
        (mode === 'login' 
          ? 'Acceso denegado: Credenciales de turno no válidas.' 
          : 'Error al registrar el operador en el servicio de autenticación.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setError(null);
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background radial amber ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Industrial Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141C2B] border border-amber-500/30 text-[11px] font-mono text-amber-300 mb-4 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">PORTAL OPERATIVO DE TALLER MINERO</span>
          </div>

          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.35)] border-2 border-amber-300">
              <Pickaxe className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-100 tracking-tight font-sans">
            MINE<span className="text-amber-400">POWER</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-mono font-medium">
            Sistema de Gestión de Motores & Maquinaria Pesada
          </p>
        </div>

        {/* Auth Box */}
        <div className="mining-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border border-amber-500/30 overflow-hidden">
          {/* Top Hazard Warning Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 hazard-ribbon"></div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#080D15] border border-white/[0.08] mb-6 pt-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>INICIAR TURNO</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'register'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>REGISTRARSE</span>
            </button>
          </div>

          <div className="flex items-center justify-between pb-3 mb-5 border-b border-amber-500/20">
            <div>
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>{mode === 'login' ? 'Identificación de Operador' : 'Alta de Nuevo Operador'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {mode === 'login'
                  ? 'Ingrese sus credenciales de taller para continuar'
                  : 'Cree su cuenta técnica para ingresar al sistema'}
              </p>
            </div>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-300 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nombre (Solo en modo Register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" strokeWidth={2} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ing. Carlos Pérez"
                    className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-10 py-2.5 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
                Correo Electrónico Corporativo *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" strokeWidth={2} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador@mining.com"
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-10 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
                Contraseña de Seguridad *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" strokeWidth={2} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-10 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            {/* Rol de Acceso (Solo en modo Register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
                  Rol de Cuadrilla *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'OPERATOR' | 'ADMIN')}
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="OPERATOR">⚙️ OPERATOR — Mecánico Especialista de Bahía</option>
                  <option value="ADMIN">🛡️ ADMIN — Supervisor General de Taller</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-200 active:scale-95 disabled:opacity-50 border border-amber-300"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'login' ? 'AUTENTICANDO OPERADOR...' : 'REGISTRANDO OPERADOR...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'INICIAR TURNO EN TALLER' : 'CREAR CUENTA & ACCEDER'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Switch Prompt at Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400 font-sans">
                ¿No tienes cuenta de operador?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-amber-400 hover:text-amber-300 font-bold underline ml-1 cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-sans">
                ¿Ya tienes credenciales registradas?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-amber-400 hover:text-amber-300 font-bold underline ml-1 cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
