import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Gauge, 
  Wrench, 
  Truck, 
  Mountain, 
  HardHat,
  Flame,
  Pickaxe,
  Hammer,
  ShieldAlert,
  Fuel
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Centro de Operaciones', icon: Gauge, tag: 'TELEMETRÍA' },
    { to: '/orders', label: 'Taller de Overhaul', icon: Wrench, tag: 'BAHÍAS' },
    { to: '/engines', label: 'Parque de Motores', icon: Truck, tag: 'FLOTA' },
    { to: '/clients', label: 'Faenas & Clientes', icon: Mountain },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', label: 'Cuadrillas & Roles', icon: HardHat, tag: 'ADMIN' });
  }

  return (
    <aside className="w-64 bg-[#0E141F] border-r border-amber-500/20 flex flex-col shrink-0 select-none z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="h-22 p-4 border-b border-amber-500/20 bg-gradient-to-b from-[#141C2B] to-[#0E141F] relative overflow-hidden">
        {/* Subtle Hazard Line at the top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 hazard-ribbon opacity-90"></div>

        <div className="flex items-center gap-3 pt-2">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-400">
              <Pickaxe className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0E141F] shadow-sm"></span>
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-1">
              <h1 className="font-black text-slate-100 text-sm tracking-wider font-sans">
                MINE<span className="text-amber-400">POWER</span>
              </h1>
              <span className="text-[9px] font-black font-mono bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded border border-amber-400/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-amber-500/90 font-mono tracking-tight font-semibold flex items-center gap-1 mt-0.5">
              <span>HEAVY DIESEL SYSTEMS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Safety Badge / Shift Status */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-[#141C2B] border border-amber-500/25 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-bold text-[11px]">TURNO MINERO D</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
          ACTIVO
        </span>
      </div>

      {/* Navigation Group */}
      <div className="px-3 py-4 flex-1 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[10px] uppercase font-mono font-black text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Módulos de Taller</span>
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] translate-x-1'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-[#162030] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-[#182232] text-slate-400 group-hover:text-amber-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <span className="tracking-wide text-xs">{item.label}</span>
                      </div>
                      {item.tag && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded tracking-wider uppercase font-black ${
                            isActive
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-[#162030] text-slate-400 border border-white/5'
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

        {/* Mining Equipment Status Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#141C2B] to-[#0F1622] border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px] mb-2">
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>DISPONIBILIDAD TALLER</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Bahías Ocupadas:</span>
              <span className="text-amber-300 font-bold">4 / 6 Bahías</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[66%]"></div>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 text-[10px]">
              <span>Dinamómetro:</span>
              <span className="text-emerald-400 font-bold">CALIBRADO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Days Counter Footer */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-[#121824] border border-white/[0.08] text-xs">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Seguridad Operativa</span>
          </span>
          <span className="text-amber-400 font-bold">342 DÍAS</span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono">Sin incidentes de trabajo en tajo y taller.</p>
      </div>
    </aside>
  );
};

