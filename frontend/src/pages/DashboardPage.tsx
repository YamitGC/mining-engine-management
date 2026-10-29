import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ArrowUpRight,
  TrendingUp,
  Inbox,
  Flame,
  Activity,
  Layers,
  ArrowRight,
  Gauge
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

  const statusList: { label: RepairStatus; count: number; color: string; barColor: string; icon: any }[] = [
    { label: 'Recibido', count: stats['Recibido'] || 0, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', barColor: 'bg-blue-400', icon: Inbox },
    { label: 'En diagnóstico', count: stats['En diagnóstico'] || 0, color: 'text-violet-400 bg-violet-500/10 border-violet-500/30', barColor: 'bg-violet-400', icon: Clock },
    { label: 'Esperando aprobación', count: stats['Esperando aprobación'] || 0, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', barColor: 'bg-amber-400', icon: AlertTriangle },
    { label: 'En reparación', count: stats['En reparación'] || 0, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', barColor: 'bg-orange-400', icon: Wrench },
    { label: 'En pruebas', count: stats['En pruebas'] || 0, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', barColor: 'bg-cyan-400', icon: TrendingUp },
    { label: 'Finalizado', count: stats['Finalizado'] || 0, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', barColor: 'bg-emerald-400', icon: CheckCircle2 },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-slate-400 tracking-wider">SINCRONIZANDO TELEMETRÍA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
              Telemetría Operativa
            </span>
            <span className="text-xs text-slate-400 font-mono">ID TALLER: #MINING-CENTRAL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Tablero de Control Industrial
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión integral de motores pesados, flujo de diagnóstico y entrega de maquinaria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-200 active:scale-95"
          >
            <Wrench className="w-4 h-4" strokeWidth={2} />
            <span>GESTIONAR ÓRDENES</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* BENTO GRID LEVEL 1: High-Density Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        
        {/* Bento Hero Card (Spans 2 columns on lg) */}
        <div className="md:col-span-2 lg:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/[0.08] transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold tracking-wider">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>ESTADO DE OPERACIÓN ACTIVA</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              PLANTA EN LÍNEA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Motores en Taller</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {activeOrders}
                </span>
                <span className="text-xs text-amber-400 font-mono font-medium">unidades en proceso</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Carga operativa distribuida en 5 fases técnicas.
              </p>
            </div>

            <div className="border-l border-white/[0.07] pl-6 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase text-slate-400">Tasa de Conclusión</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">eficiencia</span>
                </div>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/[0.06] mt-3">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Metric Card 2: Total History */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Histórico</span>
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300">
              <Layers className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {totalOrders}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Órdenes emitidas desde génesis
            </p>
          </div>
        </div>

        {/* Bento Metric Card 3: Entregados con éxito */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Entregados / Listos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {deliveredOrders}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Reparaciones finalizadas y entregadas
            </p>
          </div>
        </div>
      </div>

      {/* BENTO GRID LEVEL 2: Status Lifecycle Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Distribución por Fase del Ciclo de Vida (7 Estados Normativos)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Actualizado en vivo</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {statusList.map((st) => {
            const Icon = st.icon;
            const percentage = totalOrders > 0 ? Math.round((st.count / totalOrders) * 100) : 0;
            return (
              <div
                key={st.label}
                className="glass-panel glass-panel-hover p-4 rounded-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2 rounded-lg border ${st.color}`}>
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-xl font-bold text-slate-100">
                      {st.count}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 tracking-tight leading-snug">
                    {st.label}
                  </p>
                </div>

                <div className="mt-3.5 pt-2 border-t border-white/[0.04]">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span>Carga</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
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

      {/* BENTO GRID LEVEL 3: Live Order Stream */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                Flujo Reciente de Órdenes en Planta
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registro secuencial de los motores que transitan por diagnóstico, desmontaje y pruebas.
            </p>
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 transition-colors self-start sm:self-auto"
          >
            <span>VER CATÁLOGO COMPLETO</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16]/80 text-slate-300 font-mono uppercase text-[11px] font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-6">Código de Orden</th>
                <th className="py-4 px-6">Cliente Minero</th>
                <th className="py-4 px-6">Motor & Serie</th>
                <th className="py-4 px-6">Especialista</th>
                <th className="py-4 px-6">Fase Actual</th>
                <th className="py-4 px-6 text-right">Telemetría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                    No se registran órdenes en la cola de trabajo.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400 tracking-wider">
                      {order.order_number}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-100">{order.client?.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {order.client?.id_type} {order.client?.id_number}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                          <Cpu className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-mono text-slate-200 font-semibold">{order.engine?.serial_number}</p>
                          <p className="text-[10px] text-slate-400">
                            {order.engine?.manufacturer} {order.engine?.model}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-300">
                      {order.assigned_technician ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          {order.assigned_technician}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">POR ASIGNAR</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/25 transition-all"
                      >
                        <span>ABRIR FICHA</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
