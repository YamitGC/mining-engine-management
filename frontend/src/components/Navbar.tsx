import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, LogOut, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/orders?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <header className="h-14 bg-[#0F1626] border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 gap-4">
      {/* Context & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <span className="text-xs font-semibold text-slate-300 hidden md:inline shrink-0">
          Taller Central
        </span>

        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Buscar por serie, cliente, modelo u orden..."
            className="w-full bg-[#131B2E] border border-white/[0.08] focus:border-amber-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </form>
      </div>

      {/* Actions and User */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/orders"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva orden</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
            <div className="w-7 h-7 rounded bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-200 text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-medium text-slate-200 block leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {user.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
