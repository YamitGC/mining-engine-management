import React from 'react';
import { LogOut, HardHat, Shield, Activity, Radio, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#0E141F]/90 backdrop-blur-xl border-b border-amber-500/20 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20">
      {/* Telemetry & Site Tag */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#141C2B] border border-amber-500/30 text-xs font-mono shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse"></span>
          <span className="text-amber-300 font-black tracking-wider text-[11px]">TALLER CENTRAL OVERHAUL</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 text-[11px] font-semibold flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            <span>MOTORES MINEROS 4000+ HP</span>
          </span>
        </div>
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pr-4 border-r border-white/[0.1]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400 flex items-center justify-center text-slate-950 font-black font-mono text-sm shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-100 tracking-tight flex items-center justify-end gap-1">
                <span>{user.name}</span>
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-black tracking-wider uppercase border ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-[#182232] text-amber-300 border-amber-500/40'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'SUPERVISOR GENERAL' : 'MECÁNICO ESPECIALISTA'}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Cerrar turno de trabajo"
          className="group flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 px-3.5 py-2 rounded-xl border border-white/[0.08] hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-200 active:scale-95"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amber-500" strokeWidth={2} />
          <span className="font-mono text-xs">Cerrar Turno</span>
        </button>
      </div>
    </header>
  );
};

