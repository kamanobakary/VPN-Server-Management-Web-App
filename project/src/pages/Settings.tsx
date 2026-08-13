import React, { useState } from 'react';
import {
  Shield, Server, Bell, Key, Lock, Globe, Save,
  RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle,
  Wifi, Clock, Database
} from 'lucide-react';
import Header from '../components/Header';

type SettingSection = 'server' | 'security' | 'notifications' | 'api';

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingSection>('server');
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [serverConfig, setServerConfig] = useState({
    hostname: 'vpn.example.com',
    port: '51820',
    protocol: 'WireGuard',
    subnet: '10.8.0.0/24',
    dns1: '1.1.1.1',
    dns2: '8.8.8.8',
    mtu: '1420',
    keepalive: '25',
  });

  const [securityConfig, setSecurityConfig] = useState({
    sessionTimeout: '480',
    maxAuthAttempts: '5',
    lockoutDuration: '30',
    mfaEnabled: false,
    auditLogEnabled: true,
    ipWhitelist: '',
  });

  const [notifConfig, setNotifConfig] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    alertEmail: '',
    notifyConnect: true,
    notifyAuthFail: true,
    notifyExpiry: true,
  });

  const [apiConfig, setApiConfig] = useState({
    apiKey: 'sk_prod_' + '•'.repeat(32),
    rateLimitReqs: '100',
    rateLimitWindow: '60',
    corsOrigin: '*',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'server' as const,        label: 'Server',        icon: Server },
    { id: 'security' as const,      label: 'Security',      icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'api' as const,           label: 'API & Access',  icon: Key },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Configure your VPN server and application settings" />

      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Settings nav */}
        <div className="w-44 bg-gray-950 p-3 flex-shrink-0">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                activeSection === id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-6">
          {saved && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm rounded-lg px-4 py-3 mb-5">
              <CheckCircle className="w-4 h-4" />
              Settings saved successfully
            </div>
          )}

          {/* Server settings */}
          {activeSection === 'server' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Server Configuration</h2>
                <p className="text-xs text-gray-500">Core VPN server settings and network parameters</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Server Hostname" icon={Globe}>
                    <input
                      value={serverConfig.hostname}
                      onChange={(e) => setServerConfig((c) => ({ ...c, hostname: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Listen Port" icon={Wifi}>
                    <input
                      value={serverConfig.port}
                      onChange={(e) => setServerConfig((c) => ({ ...c, port: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Protocol">
                    <select
                      value={serverConfig.protocol}
                      onChange={(e) => setServerConfig((c) => ({ ...c, protocol: e.target.value }))}
                      className={selectClass}
                    >
                      <option>WireGuard</option>
                      <option>OpenVPN</option>
                      <option>IKEv2</option>
                    </select>
                  </Field>
                  <Field label="VPN Subnet">
                    <input
                      value={serverConfig.subnet}
                      onChange={(e) => setServerConfig((c) => ({ ...c, subnet: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Primary DNS">
                    <input
                      value={serverConfig.dns1}
                      onChange={(e) => setServerConfig((c) => ({ ...c, dns1: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Secondary DNS">
                    <input
                      value={serverConfig.dns2}
                      onChange={(e) => setServerConfig((c) => ({ ...c, dns2: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="MTU">
                    <input
                      value={serverConfig.mtu}
                      onChange={(e) => setServerConfig((c) => ({ ...c, mtu: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Keepalive (s)">
                    <input
                      value={serverConfig.keepalive}
                      onChange={(e) => setServerConfig((c) => ({ ...c, keepalive: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <InfoBox icon={AlertCircle} color="yellow">
                Changes to server hostname or port require restarting the VPN daemon and redistributing client configs.
              </InfoBox>
            </div>
          )}

          {/* Security settings */}
          {activeSection === 'security' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Security Configuration</h2>
                <p className="text-xs text-gray-500">Authentication, sessions, and access control</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Session Timeout (min)" icon={Clock}>
                    <input
                      type="number"
                      value={securityConfig.sessionTimeout}
                      onChange={(e) => setSecurityConfig((c) => ({ ...c, sessionTimeout: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Max Auth Attempts">
                    <input
                      type="number"
                      value={securityConfig.maxAuthAttempts}
                      onChange={(e) => setSecurityConfig((c) => ({ ...c, maxAuthAttempts: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Lockout Duration (min)">
                    <input
                      type="number"
                      value={securityConfig.lockoutDuration}
                      onChange={(e) => setSecurityConfig((c) => ({ ...c, lockoutDuration: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="IP Whitelist (comma-separated)">
                    <input
                      value={securityConfig.ipWhitelist}
                      onChange={(e) => setSecurityConfig((c) => ({ ...c, ipWhitelist: e.target.value }))}
                      placeholder="Leave blank to allow all"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="pt-2 space-y-3 border-t border-gray-800">
                  <Toggle
                    label="Multi-Factor Authentication"
                    description="Require TOTP for admin logins"
                    checked={securityConfig.mfaEnabled}
                    onChange={(v) => setSecurityConfig((c) => ({ ...c, mfaEnabled: v }))}
                  />
                  <Toggle
                    label="Audit Logging"
                    description="Log all admin actions to the audit trail"
                    checked={securityConfig.auditLogEnabled}
                    onChange={(v) => setSecurityConfig((c) => ({ ...c, auditLogEnabled: v }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Email Notifications</h2>
                <p className="text-xs text-gray-500">Configure SMTP and alert email triggers</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="SMTP Host">
                    <input
                      value={notifConfig.smtpHost}
                      onChange={(e) => setNotifConfig((c) => ({ ...c, smtpHost: e.target.value }))}
                      placeholder="smtp.example.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="SMTP Port">
                    <input
                      value={notifConfig.smtpPort}
                      onChange={(e) => setNotifConfig((c) => ({ ...c, smtpPort: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="SMTP Username">
                    <input
                      value={notifConfig.smtpUser}
                      onChange={(e) => setNotifConfig((c) => ({ ...c, smtpUser: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="SMTP Password">
                    <input
                      type="password"
                      value={notifConfig.smtpPass}
                      onChange={(e) => setNotifConfig((c) => ({ ...c, smtpPass: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="From Email">
                    <input
                      value={notifConfig.fromEmail}
                      onChange={(e) => setNotifConfig((c) => ({ ...c, fromEmail: e.target.value }))}
                      placeholder="vpn@example.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Alert Recipient Email">
                    <input
                      value={notifConfig.alertEmail}
                      onChange={(e) => setNotifConfig((c) => ({ ...c, alertEmail: e.target.value }))}
                      placeholder="admin@example.com"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="pt-2 space-y-3 border-t border-gray-800">
                  <Toggle label="Notify on user connect" description="Email alert when a user connects" checked={notifConfig.notifyConnect} onChange={(v) => setNotifConfig((c) => ({ ...c, notifyConnect: v }))} />
                  <Toggle label="Notify on auth failures" description="Alert on repeated failed logins" checked={notifConfig.notifyAuthFail} onChange={(v) => setNotifConfig((c) => ({ ...c, notifyAuthFail: v }))} />
                  <Toggle label="Notify on expiry" description="Alert 7 days before certificate expiry" checked={notifConfig.notifyExpiry} onChange={(v) => setNotifConfig((c) => ({ ...c, notifyExpiry: v }))} />
                </div>
              </div>
            </div>
          )}

          {/* API settings */}
          {activeSection === 'api' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">API Configuration</h2>
                <p className="text-xs text-gray-500">REST API access, rate limiting, and CORS</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <Field label="API Key">
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={apiConfig.apiKey}
                      readOnly
                      className={`${inputClass} pr-10 font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Rate Limit (req/window)">
                    <input
                      type="number"
                      value={apiConfig.rateLimitReqs}
                      onChange={(e) => setApiConfig((c) => ({ ...c, rateLimitReqs: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Rate Limit Window (s)">
                    <input
                      type="number"
                      value={apiConfig.rateLimitWindow}
                      onChange={(e) => setApiConfig((c) => ({ ...c, rateLimitWindow: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="CORS Allowed Origins" className="sm:col-span-2">
                    <input
                      value={apiConfig.corsOrigin}
                      onChange={(e) => setApiConfig((c) => ({ ...c, corsOrigin: e.target.value }))}
                      placeholder="* or https://example.com"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-3 font-semibold">Available Endpoints</p>
                  {[
                    { method: 'POST',   path: '/auth/login',           desc: 'Authenticate admin' },
                    { method: 'GET',    path: '/users',                desc: 'List VPN users' },
                    { method: 'POST',   path: '/users/create',         desc: 'Create a VPN user' },
                    { method: 'DELETE', path: '/users/:id',            desc: 'Delete a VPN user' },
                    { method: 'GET',    path: '/vpn/status',           desc: 'Server status' },
                    { method: 'POST',   path: '/vpn/generate-config',  desc: 'Generate client config' },
                    { method: 'GET',    path: '/logs',                 desc: 'Retrieve connection logs' },
                  ].map(({ method, path, desc }) => (
                    <div key={path} className="flex items-center gap-3 py-1.5 border-b border-gray-800/40 last:border-0">
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        method === 'GET' ? 'bg-blue-500/15 text-blue-400'
                        : method === 'POST' ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                      }`}>{method}</span>
                      <code className="text-xs font-mono text-gray-300">{path}</code>
                      <span className="text-xs text-gray-600 ml-auto">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30';
const selectClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 [color-scheme:dark]';

function Field({ label, icon: Icon, children, className = '' }: { label: string; icon?: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-400 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-200">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-gray-700'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

function InfoBox({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-2.5 bg-${color}-500/5 border border-${color}-500/20 rounded-lg p-3`}>
      <Icon className={`w-4 h-4 text-${color}-400 flex-shrink-0 mt-0.5`} />
      <p className={`text-xs text-${color}-400/80`}>{children}</p>
    </div>
  );
}
