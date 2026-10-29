import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pickaxe, Lock, Mail, AlertTriangle, ArrowRight, HardHat, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Acceso denegado: Credenciales de turno no válidas.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background radial amber ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Industrial Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141C2B] border border-amber-500/30 text-[11px] font-mono text-amber-300 mb-4 shadow-sm">
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
        <div className="mining-panel p-8 rounded-2xl shadow-2xl relative border border-amber-500/30 overflow-hidden">
          {/* Top Hazard Warning Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 hazard-ribbon"></div>

          <div className="flex items-center justify-between pb-4 mb-6 border-b border-amber-500/20 pt-1">
            <div>
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>Ingreso de Turno</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Validación de credenciales y permisos de cuadrilla
              </p>
            </div>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-300 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
                Correo Electrónico Corporativo
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
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" strokeWidth={2} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#080D15] border border-white/[0.1] rounded-xl px-10 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-200 active:scale-95 disabled:opacity-50 border border-amber-300"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>AUTENTICANDO OPERADOR...</span>
                </>
              ) : (
                <>
                  <span>INICIAR TURNO EN TALLER</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Micro Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-[10px] font-mono text-slate-400">
              SISTEMA RESTRINGIDO A PERSONAL AUTORIZADO DE MINA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
