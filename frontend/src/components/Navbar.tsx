import React from 'react';
import { LogOut, User as UserIcon, Shield, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#090d16]/70 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Telemetry pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse"></span>
          <span className="text-slate-300 font-semibold tracking-wider text-[11px]">TALLER CENTRAL</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[10px]">DIAGNÓSTICO PESADO</span>
        </div>
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pr-4 border-r border-white/[0.08]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200 tracking-tight">{user.name}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold tracking-wider uppercase border ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Cerrar sesión segura"
          className="group flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/[0.06] transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.75} />
          <span>Desconectar</span>
        </button>
      </div>
    </header>
  );
};
