import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  ArrowUpRight,
  TrendingUp,
  Inbox,
  Flame,
  Activity,
  Layers,
  ArrowRight,
  Gauge,
  HardHat,
  Mountain,
  Pickaxe,
  Hammer,
  Fuel,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { RepairOrder, RepairStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<RepairOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          businessApi.get('/repair-orders/summary/stats'),
          businessApi.get('/repair-orders?limit=6')
        ]);
        setStats(statsRes.data || {});
        setRecentOrders(ordersRes.data || []);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError('No se pudo establecer enlace de telemetría con el servicio de negocio.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOrders = Object.values(stats).reduce((acc, curr) => acc + curr, 0);
  const activeOrders = (stats['Recibido'] || 0) + 
                       (stats['En diagnóstico'] || 0) + 
                       (stats['Esperando aprobación'] || 0) + 
                       (stats['En reparación'] || 0) + 
                       (stats['En pruebas'] || 0);
  const deliveredOrders = (stats['Finalizado'] || 0) + (stats['Entregado'] || 0);

  const statusList: { 
    label: RepairStatus; 
    phaseName: string;
    bayName: string;
    count: number; 
    color: string; 
    barColor: string; 
    icon: any 
  }[] = [
    { 
      label: 'Recibido', 
      phaseName: 'Recepción & Lavado', 
      bayName: 'Bahía 1 (Descontaminación)',
      count: stats['Recibido'] || 0, 
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/40', 
      barColor: 'bg-blue-400', 
      icon: Inbox 
    },
    { 
      label: 'En diagnóstico', 
      phaseName: 'Metrología & NDT', 
      bayName: 'Bahía 2 (Inspección Magnaflux)',
      count: stats['En diagnóstico'] || 0, 
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/40', 
      barColor: 'bg-purple-400', 
      icon: Clock 
    },
    { 
      label: 'Esperando aprobación', 
      phaseName: 'Presupuesto Mina', 
      bayName: 'Oficina Técnica / Minera',
      count: stats['Esperando aprobación'] || 0, 
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/40', 
      barColor: 'bg-amber-400', 
      icon: AlertTriangle 
    },
    { 
      label: 'En reparación', 
      phaseName: 'Overhaul de Bloque', 
      bayName: 'Bahía 3 & 4 (Armado y Torques)',
      count: stats['En reparación'] || 0, 
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/40', 
      barColor: 'bg-orange-400', 
      icon: Wrench 
    },
    { 
      label: 'En pruebas', 
      phaseName: 'Banco Dinamométrico', 
      bayName: 'Banco 4500 HP (Prueba Plena Carga)',
      count: stats['En pruebas'] || 0, 
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40', 
      barColor: 'bg-cyan-400', 
      icon: TrendingUp 
    },
    { 
      label: 'Finalizado', 
      phaseName: 'Certificado & Pintura', 
      bayName: 'Área de Despacho CAT/Komatsu',
      count: stats['Finalizado'] || 0, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40', 
      barColor: 'bg-emerald-400', 
      icon: CheckCircle2 
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-amber-400 tracking-wider font-bold">
            CONECTANDO TELEMETRÍA DE TALLER MINERO...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Top Industrial Banner Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#161F2E] via-[#121926] to-[#0E141F] border border-amber-500/30 p-6 shadow-2xl overflow-hidden">
        {/* Top Hazard Warning Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 hazard-ribbon"></div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/[0.08] rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Pickaxe className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>FAENA MINERA CENTRAL</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#1B2536] border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                TALLER DE RECONSTRUCCIÓN MAYOR
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                <span>TURNO 12X12 OPERATIVO</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight font-sans">
              Centro de Control & Overhaul de Motores
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl font-sans leading-relaxed">
              Supervisión de bahías de desarme, metrología de cigüeñales y prueba dinamométrica de motores diésel de alta potencia para camiones de extracción, palas y perforadoras.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/orders"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs font-mono tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-200 active:scale-95 border border-amber-300"
            >
              <Wrench className="w-4 h-4" strokeWidth={2.5} />
              <span>INGRESAR MOTOR A BAHÍA</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* BENTO GRID: Heavy Machinery Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Motores en Bahías */}
        <div className="mining-panel mining-card-interactive p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Motores en Taller</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              EN PROCESO
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">
              {activeOrders}
            </span>
            <span className="text-xs text-slate-300 font-mono font-semibold">unidades en bahías</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Flujo de potencia en diagnóstico y armado.
          </p>
        </div>

        {/* KPI 2: Disponibilidad y Conclusión */}
        <div className="mining-panel mining-card-interactive p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Disponibilidad Mecánica</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              KPI ÓPTIMO
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-400 font-mono">tasa de entrega</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.08] mt-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Entregados a Faena */}
        <div className="mining-panel mining-card-interactive p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Despachados a Faena</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="mt-2">
            <span className="text-4xl font-black text-slate-100 font-mono tracking-tight">
              {deliveredOrders}
            </span>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Motores reincorporados a extracción minera.
            </p>
          </div>
        </div>

        {/* KPI 4: Total Histórico */}
        <div className="mining-panel mining-card-interactive p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Órdenes Acumuladas</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-bold">TOTAL</span>
          </div>
          <div className="mt-2">
            <span className="text-4xl font-black text-slate-100 font-mono tracking-tight">
              {totalOrders}
            </span>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Registros trazados en auditoría técnica.
            </p>
          </div>
        </div>
      </div>

      {/* WORKSHOP BAY WORKLOAD: 6 Active Workshop Stations */}
      <div className="mining-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Hammer className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100 font-sans">
                Línea de Reconstrucción & Ocupación de Bahías
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Seguimiento por estación técnica: desde ingreso hasta calibración en dinamómetro.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#162132] text-amber-300 border border-amber-500/30 font-bold">
            6 ESTACIONES TÉCNICAS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {statusList.map((st) => {
            const Icon = st.icon;
            const percentage = totalOrders > 0 ? Math.round((st.count / totalOrders) * 100) : 0;
            return (
              <div
                key={st.label}
                className="bg-[#121926] hover:bg-[#182234] border border-white/[0.08] hover:border-amber-500/40 p-4 rounded-xl flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg border ${st.color}`}>
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-100">
                      {st.count}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-100 tracking-tight leading-snug">
                    {st.phaseName}
                  </p>
                  <p className="text-[10px] font-mono text-amber-500/90 mt-1 truncate">
                    {st.bayName}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/[0.06]">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span>Ocupación</span>
                    <span className="font-bold text-slate-200">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${st.barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT ORDERS TABLE: Live Workshop Activity */}
      <div className="mining-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-amber-500/20 bg-gradient-to-r from-[#141C2B] to-[#101724] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-100 font-sans">
                  Motores Mineros en Proceso de Reparación
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Últimos motores intervenidos con número de serie y técnico asignado.
              </p>
            </div>
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all self-start sm:self-auto"
          >
            <span>VER TODAS LAS ÓRDENES</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1019] text-amber-400/90 font-mono uppercase text-[11px] font-black border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-6">No. Orden Taller</th>
                <th className="py-3.5 px-6">Compañía / Faena Minera</th>
                <th className="py-3.5 px-6">Motor & Especificación</th>
                <th className="py-3.5 px-6">Mecánico Especialista</th>
                <th className="py-3.5 px-6">Fase Operativa</th>
                <th className="py-3.5 px-6 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400 font-mono text-xs">
                    No se registran órdenes activas en el taller.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#182232] border border-amber-500/30 text-amber-400 font-mono font-black text-xs">
                        <Wrench className="w-3 h-3 text-amber-500" />
                        <span>{order.order_number}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Mountain className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-100">{order.client?.name}</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 ml-5.5">
                        NIT: {order.client?.id_number}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                          <Cpu className="w-3.5 h-3.5" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="font-mono text-amber-300 font-bold">{order.engine?.serial_number}</p>
                          <p className="text-[11px] text-slate-300 font-sans font-medium">
                            {order.engine?.manufacturer} {order.engine?.model}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-300">
                      {order.assigned_technician ? (
                        <div className="flex items-center gap-1.5">
                          <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-sans text-xs">{order.assigned_technician}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">SIN ASIGNAR</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <span>GESTIONAR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

