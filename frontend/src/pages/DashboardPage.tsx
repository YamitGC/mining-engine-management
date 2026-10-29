import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Cog, 
  ArrowRight,
  TrendingUp,
  Inbox
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
          businessApi.get('/repair-orders?limit=5')
        ]);
        setStats(statsRes.data || {});
        setRecentOrders(ordersRes.data || []);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError('No se pudo cargar la información del Dashboard.');
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

  const statusCards: { label: RepairStatus; count: number; color: string; icon: any }[] = [
    { label: 'Recibido', count: stats['Recibido'] || 0, color: 'border-blue-500/40 text-blue-400 bg-blue-500/10', icon: Inbox },
    { label: 'En diagnóstico', count: stats['En diagnóstico'] || 0, color: 'border-purple-500/40 text-purple-400 bg-purple-500/10', icon: Clock },
    { label: 'Esperando aprobación', count: stats['Esperando aprobación'] || 0, color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', icon: AlertTriangle },
    { label: 'En reparación', count: stats['En reparación'] || 0, color: 'border-orange-500/40 text-orange-400 bg-orange-500/10', icon: Wrench },
    { label: 'En pruebas', count: stats['En pruebas'] || 0, color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10', icon: TrendingUp },
    { label: 'Finalizado', count: stats['Finalizado'] || 0, color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tablero de Control</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitoreo en tiempo real del taller de reparación de motores mineros.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span>Gestionar Órdenes</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Top High-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Histórico</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-2">{totalOrders}</h3>
            <p className="text-xs text-slate-500 mt-1">Órdenes registradas</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl text-amber-500">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">En Operación Activa</p>
            <h3 className="text-3xl font-bold text-amber-400 mt-2">{activeOrders}</h3>
            <p className="text-xs text-slate-500 mt-1">Motores actualmente en taller</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Completados / Entregados</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-2">{deliveredOrders}</h3>
            <p className="text-xs text-slate-500 mt-1">Reparaciones con éxito</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown by Status Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Resumen por Estado del Proceso
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusCards.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.label}
                className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg border ${sc.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-100">{sc.count}</span>
                </div>
                <p className="text-xs font-medium text-slate-300 leading-snug">{sc.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Órdenes Recientes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Últimos motores que ingresaron o cambiaron de estado</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Ver todas las órdenes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Orden</th>
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-6">Motor</th>
                <th className="py-3.5 px-6">Técnico</th>
                <th className="py-3.5 px-6">Estado</th>
                <th className="py-3.5 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No hay órdenes de reparación registradas aún.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-100">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-6 text-slate-300">
                      {order.client?.name || `Cliente #${order.client_id}`}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 text-amber-500" />
                        <span>{order.engine?.serial_number || `Motor #${order.engine_id}`}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      {order.assigned_technician || 'Sin asignar'}
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Ver Detalle →
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
