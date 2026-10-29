import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Lock, Mail, AlertTriangle, ArrowRight, Shield, Radio } from 'lucide-react';
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
      const msg = err.response?.data?.message || 'Acceso denegado: Credenciales corporativas no válidas.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Blueprint Grid Texture & Ambient Radial Lights */}
      <div className="absolute inset-0 bg-radial-grid opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Industrial Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/[0.08] text-[11px] font-mono text-slate-300 mb-5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="tracking-widest">MINING OPERATIONS GATEWAY</span>
          </div>

          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Flame className="w-7 h-7" strokeWidth={1.75} />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight font-sans">
            VULCAN<span className="text-amber-400">.OPS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Control de Diagnóstico y Reparación de Motores Pesados
          </p>
        </div>

        {/* Auth Terminal Box */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                Identificación de Operador
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Acceso con token JWT firmado con HS256
              </p>
            </div>
            <Shield className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" strokeWidth={1.75} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@mining.com"
                  className="w-full bg-[#070a12]/80 border border-white/[0.08] rounded-xl px-10 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" strokeWidth={1.75} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070a12]/80 border border-white/[0.08] rounded-xl px-10 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>AUTENTICANDO ACCESO...</span>
                </>
              ) : (
                <>
                  <span>AUTENTICAR EN LA PLATAFORMA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <span className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              Sesión protegida por arquitectura de microservicios con Express y FastAPI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
