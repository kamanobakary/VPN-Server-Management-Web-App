import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Download, Trash2, Power, PowerOff, RefreshCw,
  QrCode, Copy, Check, Network, FileText, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import Header from '../components/Header';
import Badge from '../components/Badge';
import QRCode from '../components/QRCode';
import { supabase } from '../lib/supabase';
import { generateKey, generateTunnelIP, generateWireGuardConfig, generateOpenVPNConfig, timeAgo } from '../lib/utils';
import type { VpnProfile, VpnUser, Protocol } from '../types';

interface ProfileWithUser extends VpnProfile {
  vpn_users?: { username: string } | null;
}

export default function VPNManagement() {
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [users, setUsers] = useState<VpnUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [qrProfile, setQrProfile] = useState<ProfileWithUser | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ vpn_user_id: '', name: '', protocol: 'WireGuard' as Protocol });
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [profilesRes, usersRes] = await Promise.all([
      supabase.from('vpn_profiles').select('*, vpn_users(username)').order('created_at', { ascending: false }),
      supabase.from('vpn_users').select('*').eq('is_enabled', true),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data as ProfileWithUser[]);
    if (usersRes.data) setUsers(usersRes.data as VpnUser[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createProfile = async () => {
    if (!form.vpn_user_id) { setFormError('Select a user.'); return; }
    if (!form.name.trim()) { setFormError('Enter a profile name.'); return; }
    setFormError('');
    const privateKey = generateKey();
    const publicKey = generateKey();
    const idx = profiles.length;
    const ip = generateTunnelIP(idx);
    const config =
      form.protocol === 'WireGuard'
        ? generateWireGuardConfig(form.name, privateKey, publicKey, ip)
        : generateOpenVPNConfig(form.name, privateKey, ip);
    const { error } = await supabase.from('vpn_profiles').insert({
      vpn_user_id: form.vpn_user_id,
      name: form.name.trim(),
      protocol: form.protocol,
      config_data: btoa(config),
      public_key: publicKey,
      private_key: privateKey,
      ip_address: ip,
      is_active: true,
    });
    if (!error) {
      setCreating(false);
      setForm({ vpn_user_id: '', name: '', protocol: 'WireGuard' });
      load();
    }
  };

  const toggleActive = async (p: ProfileWithUser) => {
    await supabase.from('vpn_profiles').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Revoke and delete this profile? The user will lose access immediately.')) return;
    await supabase.from('vpn_profiles').delete().eq('id', id);
    load();
  };

  const downloadConfig = (p: ProfileWithUser) => {
    if (!p.config_data) return;
    const config = atob(p.config_data);
    const ext = p.protocol === 'WireGuard' ? 'conf' : 'ovpn';
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyConfig = async (p: ProfileWithUser) => {
    if (!p.config_data) return;
    await navigator.clipboard.writeText(atob(p.config_data));
    setCopied(p.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="VPN Management"
        subtitle="Manage VPN profiles and client configurations"
        onRefresh={load}
        lastUpdated={new Date().toISOString()}
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Create Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <button
            onClick={() => setCreating((c) => !c)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Generate New VPN Profile</span>
            </div>
            {creating ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>

          {creating && (
            <div className="px-5 pb-5 border-t border-gray-800">
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2 mt-4">{formError}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">Assign to User</label>
                  <select
                    value={form.vpn_user_id}
                    onChange={(e) => setForm((f) => ({ ...f, vpn_user_id: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="">Select user…</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">Profile Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. alice-phone"
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">Protocol</label>
                  <select
                    value={form.protocol}
                    onChange={(e) => setForm((f) => ({ ...f, protocol: e.target.value as Protocol }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option>WireGuard</option>
                    <option>OpenVPN</option>
                    <option>IKEv2</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={createProfile}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Generate Profile
                </button>
                <button
                  onClick={() => { setCreating(false); setFormError(''); }}
                  className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">VPN Profiles ({profiles.length})</h3>
            <button onClick={load} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-16">
              <Network className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No VPN profiles yet</p>
              <p className="text-xs text-gray-700 mt-1">Create a profile above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {profiles.map((p) => (
                <div key={p.id}>
                  {/* Profile row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.is_active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <Badge
                          label={p.protocol}
                          variant={p.is_active ? 'active' : 'inactive'}
                        />
                        {!p.is_active && <Badge label="Revoked" variant="error" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 font-mono">{p.ip_address ?? '—'}</span>
                        {p.vpn_users && (
                          <span className="text-xs text-gray-600">· {(p.vpn_users as { username: string }).username}</span>
                        )}
                        <span className="text-xs text-gray-700">· {timeAgo(p.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyConfig(p)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        title="Copy config"
                      >
                        {copied === p.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => downloadConfig(p)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        title="Download config"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setQrProfile(qrProfile?.id === p.id ? null : p)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        title="QR code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        title="View config"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        className={`p-1.5 rounded-md transition-colors ${
                          p.is_active
                            ? 'text-yellow-400/70 hover:text-yellow-300 hover:bg-yellow-500/10'
                            : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10'
                        }`}
                        title={p.is_active ? 'Revoke' : 'Re-enable'}
                      >
                        {p.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteProfile(p.id)}
                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Config preview */}
                  {expandedId === p.id && p.config_data && (
                    <div className="px-5 pb-4 border-t border-gray-800/50">
                      <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-[10px] font-mono text-emerald-400/80 overflow-x-auto max-h-48 leading-relaxed">
                        {atob(p.config_data)}
                      </pre>
                    </div>
                  )}

                  {/* QR code */}
                  {qrProfile?.id === p.id && (
                    <div className="px-5 pb-5 border-t border-gray-800/50 flex items-center gap-6">
                      <QRCode value={p.config_data ?? ''} size={160} />
                      <div>
                        <p className="text-sm font-medium text-white mb-1">Mobile Setup</p>
                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                          Scan this QR code with your VPN client app (WireGuard or OpenVPN Connect) to import the profile on mobile.
                        </p>
                        <button
                          onClick={() => downloadConfig(p)}
                          className="mt-3 text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                        >
                          Download config file instead
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
