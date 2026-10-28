import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Cog, 
  Wrench, 
  ShieldCheck,
  HardHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Órdenes de Reparación', icon: Wrench },
    { to: '/engines', label: 'Motores Mineros', icon: Cog },
    { to: '/clients', label: 'Clientes', icon: Users },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', label: 'Administración Usuarios', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
          <HardHat className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-sm tracking-wide">MINING MOTORS</h1>
          <p className="text-xs text-slate-400">Taller de Minería Pesada</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-4 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>Plataforma v1.0.0</p>
        <p className="mt-0.5">Microservicios Express & FastAPI</p>
      </div>
    </aside>
  );
};
