import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  Wrench, 
  ShieldCheck,
  Flame,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Tablero de Control', icon: LayoutDashboard, tag: 'KPIs' },
    { to: '/orders', label: 'Órdenes de Taller', icon: Wrench, tag: 'Vivo' },
    { to: '/engines', label: 'Parque de Motores', icon: Cpu },
    { to: '/clients', label: 'Empresas Mineras', icon: Users },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', label: 'Seguridad & Usuarios', icon: ShieldCheck, tag: 'RBAC' });
  }

  return (
    <aside className="w-64 bg-[#090d16]/90 backdrop-blur-2xl border-r border-white/[0.07] flex flex-col shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3.5 border-b border-white/[0.06]">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Flame className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#090d16] animate-pulse"></span>
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-slate-100 text-sm tracking-wider font-mono">
              VULCAN<span className="text-amber-400">.OPS</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-emerald-400" />
            <span>Heavy Machinery OS</span>
          </p>
        </div>
      </div>

      {/* Navigation Group */}
      <div className="px-4 py-6 flex-1 space-y-6">
        <div>
          <p className="px-3 text-[10px] uppercase font-mono font-bold text-slate-300 tracking-wider mb-2">
            Navegación Principal
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                          strokeWidth={1.75}
                        />
                        <span className="tracking-wide">{item.label}</span>
                      </div>
                      {item.tag && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded tracking-wider uppercase font-semibold ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/[0.05] text-slate-300'
                          }`}
                        >
                          {item.tag}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Telemetry Status Footer */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
          <span className="text-slate-400">Servicios Backend</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 2/2 OK
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
          <div>AUTH :4000</div>
          <div className="text-right">FASTAPI :8000</div>
        </div>
      </div>
    </aside>
  );
};
