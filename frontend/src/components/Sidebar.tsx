import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Cpu, 
  Building2, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Órdenes de trabajo', icon: Wrench },
    { to: '/engines', label: 'Motores', icon: Cpu },
    { to: '/clients', label: 'Clientes', icon: Building2 },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', label: 'Usuarios', icon: ShieldCheck });
  }

  return (
    <aside
      className={`bg-[#0F1626] border-r border-white/[0.08] flex flex-col shrink-0 select-none z-30 transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
              M
            </div>
            <span className="font-bold text-slate-100 text-sm tracking-tight truncate">
              MinePower
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors mx-auto"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors min-h-[40px] ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
