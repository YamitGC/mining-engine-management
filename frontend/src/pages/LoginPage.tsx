import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const msg = err.response?.data?.message || 'Credenciales inválidas. Verifica tu correo y contraseña.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center p-6 selection:bg-amber-500/20 selection:text-amber-200">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500 text-slate-950 font-black text-xl mb-3 shadow-sm">
            M
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">MinePower</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de motores de minería pesada</p>
        </div>

        {/* Card */}
        <div className="bg-[#131B2E] border border-white/[0.08] rounded-lg p-6 sm:p-7 shadow-lg">
          <h2 className="text-base font-semibold text-slate-100 mb-1">Iniciar sesión</h2>
          <p className="text-xs text-slate-400 mb-5">Ingresa tus credenciales corporativas</p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@minepower.com"
                className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-md px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                  Contraseña
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Para restablecer tu contraseña, contacta al administrador del sistema.');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0F1626] border border-white/[0.08] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-md px-3 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold rounded-md text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-xs text-slate-400">
              ¿Sin acceso? <span className="text-slate-300">Contacta al administrador del taller.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
