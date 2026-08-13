import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Activity, TrendingUp, Server, Cpu, MemoryStick,
  Shield, Clock, AlertTriangle, Globe, ArrowUpDown, Zap
} from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TrafficChart from '../components/TrafficChart';
import Badge from '../components/Badge';
import { supabase } from '../lib/supabase';
import { formatBytes, timeAgo } from '../lib/utils';
import type { TrafficStat, VpnSession, Alert } from '../types';

const FLAGS: Record<string, string> = { US: '🇺🇸', DE: '🇩🇪', GB: '🇬🇧', JP: '🇯🇵', CA: '🇨🇦', AU: '🇦🇺', FR: '🇫🇷', SG: '🇸🇬' };

export default function Dashboard({ onTabChange }: { onTabChange: (t: string) => void }) {
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0, expired: 0 });
  const [traffic, setTraffic] = useState<TrafficStat[]>([]);
  const [sessions, setSessions] = useState<VpnSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [uptime] = useState(() => {
    const days = Math.floor(Math.random() * 30 + 10);
    const hours = Math.floor(Math.random() * 24);
    return `${days}d ${hours}h`;
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const [usersRes, trafficRes, sessionsRes, alertsRes] = await Promise.all([
      supabase.from('vpn_users').select('id, is_enabled, expires_at'),
      supabase.from('traffic_stats').select('*').order('hour', { ascending: true }),
      supabase.from('vpn_sessions').select('*').order('started_at', { ascending: false }).limit(8),
      supabase.from('alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
    ]);

    if (usersRes.data) {
      const now = new Date();
      const total = usersRes.data.length;
      const active = usersRes.data.filter((u) => u.is_enabled && (!u.expires_at || new Date(u.expires_at) > now)).length;
      const disabled = usersRes.data.filter((u) => !u.is_enabled).length;
      const expired = usersRes.data.filter((u) => u.expires_at && new Date(u.expires_at) <= now).length;
      setStats({ total, active, disabled, expired });
    }
    if (trafficRes.data) setTraffic(trafficRes.data as TrafficStat[]);
    if (sessionsRes.data) setSessions(sessionsRes.data as VpnSession[]);
    if (alertsRes.data) setAlerts(alertsRes.data as Alert[]);

    setLastUpdated(new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => {
  load();

  const interval = setInterval(() => {
    load();
  }, 10000);

  return () => {
    clearInterval(interval);
  };
}, [load]);

  const latestStat = traffic[traffic.length - 1];
  const totalBytesIn = traffic.reduce((s, t) => s + t.bytes_in, 0);
  const totalBytesOut = traffic.reduce((s, t) => s + t.bytes_out, 0);
  const activeSessions = sessions.filter((s) => s.status === 'active').length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Real-time overview of your VPN infrastructure"
        onRefresh={load}
        lastUpdated={lastUpdated}
        alertCount={alerts.length}
        onAlertClick={() => onTabChange('monitoring')}
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Active Sessions"
                value={activeSessions}
                icon={Activity}
                iconColor="text-emerald-400"
                iconBg="bg-emerald-400/10"
                subtitle={`of ${sessions.length} total sessions`}
                trend={{ value: `${stats.active} users online`, up: true }}
              />
              <StatCard
                label="VPN Users"
                value={stats.total}
                icon={Users}
                iconColor="text-blue-400"
                iconBg="bg-blue-400/10"
                subtitle={`${stats.active} active · ${stats.disabled} disabled`}
              />
              <StatCard
                label="Traffic In (24h)"
                value={formatBytes(totalBytesIn)}
                icon={TrendingUp}
                iconColor="text-emerald-400"
                iconBg="bg-emerald-400/10"
                subtitle="Inbound bandwidth"
              />
              <StatCard
                label="Traffic Out (24h)"
                value={formatBytes(totalBytesOut)}
                icon={ArrowUpDown}
                iconColor="text-purple-400"
                iconBg="bg-purple-400/10"
                subtitle="Outbound bandwidth"
              />
            </div>

            {/* Second row: uptime + system */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Server Uptime"
                value={uptime}
                icon={Clock}
                iconColor="text-cyan-400"
                iconBg="bg-cyan-400/10"
                subtitle="No restarts"
              />
              <StatCard
                label="CPU Usage"
                value={`${latestStat?.cpu_usage?.toFixed(1) ?? '–'}%`}
                icon={Cpu}
                iconColor={latestStat && latestStat.cpu_usage! > 70 ? 'text-yellow-400' : 'text-emerald-400'}
                iconBg={latestStat && latestStat.cpu_usage! > 70 ? 'bg-yellow-400/10' : 'bg-emerald-400/10'}
                subtitle="Current utilisation"
              />
              <StatCard
                label="RAM Usage"
                value={`${latestStat?.ram_usage?.toFixed(1) ?? '–'}%`}
                icon={Server}
                iconColor={latestStat && latestStat.ram_usage! > 80 ? 'text-orange-400' : 'text-emerald-400'}
                iconBg={latestStat && latestStat.ram_usage! > 80 ? 'bg-orange-400/10' : 'bg-emerald-400/10'}
                subtitle="Memory utilisation"
              />
              <StatCard
                label="Active Alerts"
                value={alerts.length}
                icon={AlertTriangle}
                iconColor={alerts.length > 0 ? 'text-red-400' : 'text-emerald-400'}
                iconBg={alerts.length > 0 ? 'bg-red-400/10' : 'bg-emerald-400/10'}
                subtitle={alerts.length > 0 ? 'Requires attention' : 'All clear'}
              />
            </div>

            {/* Traffic Chart + Active Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Network Traffic (24h)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Hourly bandwidth usage</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />
                      Inbound
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />
                      Outbound
                    </span>
                  </div>
                </div>
                <TrafficChart data={traffic} height={140} />
              </div>

              {/* Active connections */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Active Connections</h3>
                <p className="text-xs text-gray-500 mb-4">{activeSessions} of {sessions.length} sessions live</p>
                <div className="space-y-2.5">
                  {sessions.filter((s) => s.status === 'active').slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-300 font-mono truncate">{s.client_ip ?? '—'}</div>
                        <div className="text-[10px] text-gray-600">{formatBytes(s.bytes_in + s.bytes_out)} transferred</div>
                      </div>
                      <div className="text-lg flex-shrink-0">{FLAGS[s.country ?? ''] ?? '🌐'}</div>
                    </div>
                  ))}
                  {activeSessions === 0 && (
                    <p className="text-xs text-gray-600 py-4 text-center">No active sessions</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts + Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Alerts */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Active Alerts</h3>
                  <button
                    onClick={() => onTabChange('monitoring')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View all →
                  </button>
                </div>
                {alerts.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm py-4">
                    <Shield className="w-4 h-4" />
                    <span>All systems operational</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map((a) => (
                      <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                        a.severity === 'error' || a.severity === 'critical'
                          ? 'bg-red-500/5 border-red-500/20'
                          : a.severity === 'warning'
                          ? 'bg-yellow-500/5 border-yellow-500/20'
                          : 'bg-blue-500/5 border-blue-500/20'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          a.severity === 'error' || a.severity === 'critical' ? 'text-red-400'
                          : a.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-white">{a.title}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 truncate">{a.message}</div>
                          <div className="text-[10px] text-gray-600 mt-0.5">{timeAgo(a.created_at)}</div>
                        </div>
                        <Badge
                          label={a.severity}
                          variant={a.severity as 'error' | 'warning' | 'info'}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Add User', icon: Users, tab: 'users', color: 'text-blue-400', bg: 'bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/20' },
                    { label: 'Generate Config', icon: Zap, tab: 'vpn', color: 'text-emerald-400', bg: 'bg-emerald-400/10 hover:bg-emerald-400/20 border-emerald-400/20' },
                    { label: 'View Logs', icon: Activity, tab: 'monitoring', color: 'text-purple-400', bg: 'bg-purple-400/10 hover:bg-purple-400/20 border-purple-400/20' },
                    { label: 'Server Status', icon: Globe, tab: 'monitoring', color: 'text-cyan-400', bg: 'bg-cyan-400/10 hover:bg-cyan-400/20 border-cyan-400/20' },
                  ].map(({ label, icon: Icon, tab, color, bg }) => (
                    <button
                      key={label}
                      onClick={() => onTabChange(tab)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${bg} transition-all duration-150 group`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
