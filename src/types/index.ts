export type Protocol = 'WireGuard' | 'OpenVPN' | 'IKEv2';
export type SessionStatus = 'active' | 'disconnected' | 'expired';
export type Severity = 'info' | 'warning' | 'error' | 'critical';
export type AlertType = 'security' | 'performance' | 'system';

export interface VpnUser {
  id: string;
  username: string;
  email: string | null;
  is_enabled: boolean;
  expires_at: string | null;
  max_connections: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VpnProfile {
  id: string;
  vpn_user_id: string | null;
  name: string;
  protocol: Protocol;
  config_data: string | null;
  public_key: string | null;
  private_key: string | null;
  ip_address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface VpnSession {
  id: string;
  vpn_user_id: string | null;
  profile_id: string | null;
  started_at: string;
  ended_at: string | null;
  client_ip: string | null;
  country: string | null;
  bytes_in: number;
  bytes_out: number;
  status: SessionStatus;
}

export interface ConnectionLog {
  id: string;
  vpn_user_id: string | null;
  event_type: string;
  client_ip: string | null;
  message: string | null;
  severity: Severity;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  client_ip: string | null;
  created_at: string;
}

export interface TrafficStat {
  id: string;
  hour: string;
  bytes_in: number;
  bytes_out: number;
  active_connections: number;
  cpu_usage: number | null;
  ram_usage: number | null;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string | null;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}
