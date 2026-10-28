import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
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
      const msg = err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role: 'admin' | 'operator') => {
    if (role === 'admin') {
      setEmail('admin@mining.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl text-amber-500 mb-4 border border-amber-500/20">
            <HardHat className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">MINING MOTORS</h2>
          <p className="text-sm text-slate-400 mt-1">
            Plataforma de Reparación de Motores de Minería Pesada
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Iniciar Sesión</h3>
          <p className="text-xs text-slate-400 mb-6">
            Ingrese sus credenciales corporativas para acceder al sistema.
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mining.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-medium mb-2">Credenciales de Acceso Rápido:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="flex-1 py-1.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700/60 transition-colors text-left"
              >
                <span className="font-semibold text-amber-400">Admin:</span> admin@mining.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
