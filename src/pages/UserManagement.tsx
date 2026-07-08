import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Trash2, Power, PowerOff, Download, RefreshCw,
  Calendar, Users, AlertCircle, Search, X, ChevronDown
} from 'lucide-react';
import Header from '../components/Header';
import Badge from '../components/Badge';
import { supabase } from '../lib/supabase';
import { formatDate, isExpired, timeAgo } from '../lib/utils';
import type { VpnUser } from '../types';

const EMPTY_FORM = {
  username: '',
  email: '',
  max_connections: 1,
  notes: '',
  expires_at: '',
};

export default function UserManagement() {
  const [users, setUsers] = useState<VpnUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled' | 'expired'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('vpn_users').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as VpnUser[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createUser = async () => {
    if (!form.username.trim()) { setFormError('Username is required.'); return; }
    if (!/^[a-zA-Z0-9._-]+$/.test(form.username)) { setFormError('Username may only contain letters, numbers, dots, hyphens, underscores.'); return; }
    setFormError('');
    setSaving(true);
    const { error } = await supabase.from('vpn_users').insert({
      username: form.username.trim().toLowerCase(),
      email: form.email.trim() || null,
      max_connections: form.max_connections,
      notes: form.notes.trim() || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_enabled: true,
    });
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    setShowForm(false);
    setForm(EMPTY_FORM);
    load();
  };

  const toggleUser = async (u: VpnUser) => {
    await supabase.from('vpn_users').update({ is_enabled: !u.is_enabled }).eq('id', u.id);
    load();
  };

  const deleteUser = async (u: VpnUser) => {
    if (!confirm(`Delete user "${u.username}"? All their VPN profiles will be revoked.`)) return;
    await supabase.from('vpn_users').delete().eq('id', u.id);
    load();
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase());
    const now = new Date();
    const expired = u.expires_at && new Date(u.expires_at) <= now;
    if (filter === 'active') return matchSearch && u.is_enabled && !expired;
    if (filter === 'disabled') return matchSearch && !u.is_enabled;
    if (filter === 'expired') return matchSearch && expired;
    return matchSearch;
  });

  const counts = {
    total: users.length,
    active: users.filter((u) => u.is_enabled && (!u.expires_at || new Date(u.expires_at) > new Date())).length,
    disabled: users.filter((u) => !u.is_enabled).length,
    expired: users.filter((u) => u.expires_at && new Date(u.expires_at) <= new Date()).length,
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="User Management"
        subtitle="Add, manage, and revoke VPN user accounts"
        onRefresh={load}
        lastUpdated={new Date().toISOString()}
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: counts.total, color: 'text-gray-300' },
            { label: 'Active', value: counts.active, color: 'text-emerald-400' },
            { label: 'Disabled', value: counts.disabled, color: 'text-yellow-400' },
            { label: 'Expired', value: counts.expired, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold ${color} mt-1 tabular-nums`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(['all', 'active', 'disabled', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors capitalize ${
                filter === f
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="ml-auto bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Add user form */}
        {showForm && (
          <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">New VPN User</h3>
              <button onClick={() => { setShowForm(false); setFormError(''); setForm(EMPTY_FORM); }} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {formError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-lg p-3 mb-4 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Username <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="jane.doe"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Max Connections</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.max_connections}
                  onChange={(e) => setForm((f) => ({ ...f, max_connections: Number(e.target.value) }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Expires At</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 [color-scheme:dark]"
                />
                <p className="text-[10px] text-gray-600 mt-1">Leave blank for no expiry</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional admin note…"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={createUser}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving && <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                <UserPlus className="w-4 h-4" />
                Create User
              </button>
              <button
                onClick={() => { setShowForm(false); setFormError(''); setForm(EMPTY_FORM); }}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            </h3>
            <button onClick={load} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-[10px] text-gray-600 uppercase tracking-wider border-b border-gray-800/50">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 hidden sm:block">Expires</div>
                <div className="col-span-2 hidden md:block">Max Conn.</div>
                <div className="col-span-2 hidden lg:block">Created</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-gray-800/50">
                {filtered.map((u) => {
                  const expired = isExpired(u.expires_at);
                  const status = !u.is_enabled ? 'disabled' : expired ? 'expired' : 'active';
                  return (
                    <div key={u.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-gray-800/30 transition-colors">
                      <div className="col-span-3 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{u.username}</div>
                        {u.email && <div className="text-[10px] text-gray-500 truncate">{u.email}</div>}
                        {u.notes && <div className="text-[10px] text-gray-600 truncate">{u.notes}</div>}
                      </div>
                      <div className="col-span-2">
                        <Badge
                          label={status}
                          variant={status === 'active' ? 'active' : status === 'disabled' ? 'inactive' : 'error'}
                        />
                      </div>
                      <div className="col-span-2 hidden sm:flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        <span className={`text-xs ${expired ? 'text-red-400' : 'text-gray-400'}`}>
                          {formatDate(u.expires_at)}
                        </span>
                      </div>
                      <div className="col-span-2 hidden md:block text-xs text-gray-400">
                        {u.max_connections}
                      </div>
                      <div className="col-span-2 hidden lg:block text-xs text-gray-600">
                        {timeAgo(u.created_at)}
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleUser(u)}
                          className={`p-1.5 rounded-md transition-colors ${
                            u.is_enabled
                              ? 'text-yellow-400/70 hover:text-yellow-300 hover:bg-yellow-500/10'
                              : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10'
                          }`}
                          title={u.is_enabled ? 'Disable' : 'Enable'}
                        >
                          {u.is_enabled ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
