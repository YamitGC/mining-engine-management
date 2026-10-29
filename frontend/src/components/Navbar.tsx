import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
          OPERACIONES
        </span>
        <span className="text-sm text-slate-400">Control de Diagnóstico y Mantenimiento de Motores</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-500">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-200">{user.name}</p>
              <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};

