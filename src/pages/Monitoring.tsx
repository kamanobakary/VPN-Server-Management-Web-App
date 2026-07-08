import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, AlertTriangle, CheckCircle, Download, RefreshCw,
  Search, X, Filter, Shield, Clock, ChevronDown
} from 'lucide-react';
import Header from '../components/Header';
import Badge from '../components/Badge';
import { supabase } from '../lib/supabase';
import { timeAgo } from '../lib/utils';
import type { ConnectionLog, AuditLog, Alert, Severity } from '../types';

type LogTab = 'connections' | 'audit' | 'alerts';

const SEVERITY_COLORS: Record<Severity, string> = {
  info:     'text-blue-400',
  warning:  'text-yellow-400',
  error:    'text-red-400',
  critical: 'text-red-300',
};

const SEVERITY_DOT: Record<Severity, string> = {
  info:     'bg-blue-400',
  warning:  'bg-yellow-400',
  error:    'bg-red-400',
  critical: 'bg-red-300',
};

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  connect:          { label: 'CONNECT',    color: 'text-emerald-400' },
  disconnect:       { label: 'DISCONNECT', color: 'text-gray-400' },
  auth_fail:        { label: 'AUTH FAIL',  color: 'text-red-400' },
  config_download:  { label: 'CFG DL',     color: 'text-blue-400' },
};

export default function Monitoring() {
  const [tab, setTab] = useState<LogTab>('connections');
  const [connLogs, setConnLogs] = useState<ConnectionLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  const load = useCallback(async () => {
    setLoading(true);
    const [connRes, auditRes, alertRes] = await Promise.all([
      supabase.from('connection_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('alerts').select('*').order('created_at', { ascending: false }),
    ]);
    if (connRes.data) setConnLogs(connRes.data as ConnectionLog[]);
    if (auditRes.data) setAuditLogs(auditRes.data as AuditLog[]);
    if (alertRes.data) setAlerts(alertRes.data as Alert[]);
    setLastUpdated(new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolveAlert = async (id: string) => {
    await supabase.from('alerts').update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const exportLogs = () => {
    const rows: string[] = ['timestamp,type,severity,ip,message'];
    connLogs.forEach((l) => {
      rows.push(`${l.created_at},${l.event_type},${l.severity},"${l.client_ip ?? ''}","${l.message ?? ''}"`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpn-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredConn = connLogs.filter((l) => {
    const matchSev = severityFilter === 'all' || l.severity === severityFilter;
    const matchSearch =
      !search ||
      (l.client_ip ?? '').includes(search) ||
      (l.message ?? '').toLowerCase().includes(search.toLowerCase()) ||
      l.event_type.includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  const filteredAudit = auditLogs.filter((l) => {
    return !search ||
      l.action.includes(search.toLowerCase()) ||
      (l.resource_type ?? '').includes(search.toLowerCase()) ||
      JSON.stringify(l.details ?? '').toLowerCase().includes(search.toLowerCase());
  });

  const activeAlerts = alerts.filter((a) => !a.is_resolved);
  const resolvedAlerts = alerts.filter((a) => a.is_resolved);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Monitoring"
        subtitle="Connection logs, audit trail, and system alerts"
        onRefresh={load}
        lastUpdated={lastUpdated}
        alertCount={activeAlerts.length}
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* System status bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]" />
            <div>
              <p className="text-xs text-gray-500">VPN Service</p>
              <p className="text-sm font-semibold text-emerald-400">Operational</p>
            </div>
          </div>
          <div className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-3 ${activeAlerts.length > 0 ? 'border-red-500/30' : 'border-gray-800'}`}>
            <AlertTriangle className={`w-5 h-5 ${activeAlerts.length > 0 ? 'text-red-400' : 'text-gray-600'}`} />
            <div>
              <p className="text-xs text-gray-500">Active Alerts</p>
              <p className={`text-sm font-semibold ${activeAlerts.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {activeAlerts.length} unresolved
              </p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-500">Log Entries (24h)</p>
              <p className="text-sm font-semibold text-white">{connLogs.length} events</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
          {([
            { id: 'connections', label: 'Connection Logs', count: connLogs.length },
            { id: 'audit',       label: 'Audit Trail',     count: auditLogs.length },
            { id: 'alerts',      label: 'Alerts',          count: activeAlerts.length },
          ] as const).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === id ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter / search row */}
        {(tab === 'connections' || tab === 'audit') && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === 'connections' ? 'Search IP, message…' : 'Search action…'}
                className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {tab === 'connections' && (
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/60 [color-scheme:dark]"
              >
                <option value="all">All severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            )}

            {tab === 'connections' && (
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Connection Logs */}
            {tab === 'connections' && (
              <>
                <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{filteredConn.length} entries</span>
                </div>
                {filteredConn.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 text-sm">No log entries match your filter</div>
                ) : (
                  <div className="divide-y divide-gray-800/50 max-h-[500px] overflow-y-auto">
                    {filteredConn.map((l) => {
                      const ev = EVENT_LABELS[l.event_type] ?? { label: l.event_type.toUpperCase(), color: 'text-gray-400' };
                      return (
                        <div key={l.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${SEVERITY_DOT[l.severity as Severity] ?? 'bg-gray-600'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`text-[10px] font-mono font-bold ${ev.color}`}>{ev.label}</span>
                              <span className="text-xs text-gray-300">{l.message ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {l.client_ip && <span className="text-[10px] font-mono text-gray-600">{l.client_ip}</span>}
                              <span className="text-[10px] text-gray-700">{timeAgo(l.created_at)}</span>
                            </div>
                          </div>
                          <Badge label={l.severity} variant={l.severity as Severity} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Audit logs */}
            {tab === 'audit' && (
              <>
                <div className="px-5 py-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500">{filteredAudit.length} entries</span>
                </div>
                {filteredAudit.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 text-sm">No audit entries</div>
                ) : (
                  <div className="divide-y divide-gray-800/50 max-h-[500px] overflow-y-auto">
                    {filteredAudit.map((l) => (
                      <div key={l.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors">
                        <Shield className="w-4 h-4 text-emerald-400/60 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-white uppercase">{l.action.replace(/_/g, ' ')}</span>
                            {l.resource_type && (
                              <Badge label={l.resource_type} variant="neutral" />
                            )}
                          </div>
                          {l.details && (
                            <pre className="text-[10px] text-gray-500 mt-0.5 font-mono">
                              {JSON.stringify(l.details, null, 0)}
                            </pre>
                          )}
                          <div className="flex items-center gap-3 mt-0.5">
                            {l.client_ip && <span className="text-[10px] font-mono text-gray-600">{l.client_ip}</span>}
                            <span className="text-[10px] text-gray-700">{timeAgo(l.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Alerts */}
            {tab === 'alerts' && (
              <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-2">
                    <CheckCircle className="w-10 h-10 text-emerald-400/50" />
                    <p className="text-sm text-gray-600">No alerts recorded</p>
                  </div>
                ) : (
                  alerts.map((a) => (
                    <div key={a.id} className={`px-5 py-4 hover:bg-gray-800/30 transition-colors ${a.is_resolved ? 'opacity-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          a.severity === 'error' || a.severity === 'critical' ? 'text-red-400'
                          : a.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{a.title}</span>
                            <Badge label={a.severity} variant={a.severity as Severity} />
                            <Badge label={a.type} variant="neutral" />
                            {a.is_resolved && <Badge label="resolved" variant="active" />}
                          </div>
                          {a.message && (
                            <p className="text-xs text-gray-500 mt-1">{a.message}</p>
                          )}
                          <p className="text-[10px] text-gray-700 mt-1">{timeAgo(a.created_at)}</p>
                        </div>
                        {!a.is_resolved && (
                          <button
                            onClick={() => resolveAlert(a.id)}
                            className="flex-shrink-0 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
