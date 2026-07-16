/*
# SecureVPN Manager — Initial Schema

## Overview
Creates all tables needed for the VPN server management application.
All tables are protected by RLS and accessible only to authenticated admin users.

## New Tables

### vpn_users
Stores VPN client accounts managed by the admin.
- id: UUID primary key
- username: Unique display name / login identifier
- email: Optional contact email
- is_enabled: Whether this user can connect
- expires_at: Optional expiry timestamp (null = never expires)
- max_connections: Simultaneous connection limit
- notes: Admin notes
- created_at / updated_at: Timestamps

### vpn_profiles
WireGuard / OpenVPN configuration profiles linked to a vpn_user.
- id, vpn_user_id (FK → vpn_users)
- name, protocol (OpenVPN | WireGuard | IKEv2)
- config_data: Base64-encoded config file content
- public_key / private_key: Crypto keys for the profile
- ip_address: Assigned tunnel IP
- is_active: Whether the profile is usable
- created_at

### vpn_sessions
Historical + active connection records.
- vpn_user_id / profile_id (FKs)
- started_at / ended_at
- client_ip, country
- bytes_in / bytes_out
- status: active | disconnected | expired

### connection_logs
Fine-grained event log (connect, disconnect, auth_fail, config_download).
- vpn_user_id (FK)
- event_type, ip_address, message
- severity: info | warning | error | critical
- created_at

### audit_logs
Admin action trail.
- admin_id (FK → auth.users)
- action, resource_type, resource_id
- details (JSONB), ip_address
- created_at

### traffic_stats
Hourly aggregated bandwidth + system metrics.
- hour (unique timestamptz bucket)
- bytes_in, bytes_out
- active_connections
- cpu_usage, ram_usage

### alerts
System alerts raised automatically or manually.
- type: security | performance | system
- severity: info | warning | error | critical
- title, message
- is_resolved, created_at, resolved_at

## Security
- RLS enabled on all tables.
- All policies restrict to the `authenticated` role (admin only).
- No anon access.

## Seed Data
Inserts realistic sample data so the dashboard is populated on first load.
*/

-- ─── vpn_users ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vpn_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text,
  is_enabled boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  max_connections int NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vpn_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_vpn_users" ON vpn_users;
CREATE POLICY "admin_select_vpn_users" ON vpn_users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_vpn_users" ON vpn_users;
CREATE POLICY "admin_insert_vpn_users" ON vpn_users FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_vpn_users" ON vpn_users;
CREATE POLICY "admin_update_vpn_users" ON vpn_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_vpn_users" ON vpn_users;
CREATE POLICY "admin_delete_vpn_users" ON vpn_users FOR DELETE TO authenticated USING (true);

-- ─── vpn_profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vpn_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vpn_user_id uuid REFERENCES vpn_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  protocol text NOT NULL DEFAULT 'WireGuard',
  config_data text,
  public_key text,
  private_key text,
  ip_address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vpn_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_vpn_profiles" ON vpn_profiles;
CREATE POLICY "admin_select_vpn_profiles" ON vpn_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_vpn_profiles" ON vpn_profiles;
CREATE POLICY "admin_insert_vpn_profiles" ON vpn_profiles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_vpn_profiles" ON vpn_profiles;
CREATE POLICY "admin_update_vpn_profiles" ON vpn_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_vpn_profiles" ON vpn_profiles;
CREATE POLICY "admin_delete_vpn_profiles" ON vpn_profiles FOR DELETE TO authenticated USING (true);

-- ─── vpn_sessions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vpn_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vpn_user_id uuid REFERENCES vpn_users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES vpn_profiles(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  client_ip text,
  country text,
  bytes_in bigint NOT NULL DEFAULT 0,
  bytes_out bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active'
);

ALTER TABLE vpn_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_vpn_sessions" ON vpn_sessions;
CREATE POLICY "admin_select_vpn_sessions" ON vpn_sessions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_vpn_sessions" ON vpn_sessions;
CREATE POLICY "admin_insert_vpn_sessions" ON vpn_sessions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_vpn_sessions" ON vpn_sessions;
CREATE POLICY "admin_update_vpn_sessions" ON vpn_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_vpn_sessions" ON vpn_sessions;
CREATE POLICY "admin_delete_vpn_sessions" ON vpn_sessions FOR DELETE TO authenticated USING (true);

-- ─── connection_logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vpn_user_id uuid REFERENCES vpn_users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  client_ip text,
  message text,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connection_logs_created_at ON connection_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connection_logs_severity ON connection_logs(severity);

ALTER TABLE connection_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_connection_logs" ON connection_logs;
CREATE POLICY "admin_select_connection_logs" ON connection_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_connection_logs" ON connection_logs;
CREATE POLICY "admin_insert_connection_logs" ON connection_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_connection_logs" ON connection_logs;
CREATE POLICY "admin_update_connection_logs" ON connection_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_connection_logs" ON connection_logs;
CREATE POLICY "admin_delete_connection_logs" ON connection_logs FOR DELETE TO authenticated USING (true);

-- ─── audit_logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb,
  client_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_audit_logs" ON audit_logs;
CREATE POLICY "admin_select_audit_logs" ON audit_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_audit_logs" ON audit_logs;
CREATE POLICY "admin_update_audit_logs" ON audit_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_audit_logs" ON audit_logs;
CREATE POLICY "admin_delete_audit_logs" ON audit_logs FOR DELETE TO authenticated USING (true);

-- ─── traffic_stats ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS traffic_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hour timestamptz NOT NULL UNIQUE,
  bytes_in bigint NOT NULL DEFAULT 0,
  bytes_out bigint NOT NULL DEFAULT 0,
  active_connections int NOT NULL DEFAULT 0,
  cpu_usage numeric,
  ram_usage numeric
);

ALTER TABLE traffic_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_traffic_stats" ON traffic_stats;
CREATE POLICY "admin_select_traffic_stats" ON traffic_stats FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_traffic_stats" ON traffic_stats;
CREATE POLICY "admin_insert_traffic_stats" ON traffic_stats FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_traffic_stats" ON traffic_stats;
CREATE POLICY "admin_update_traffic_stats" ON traffic_stats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_traffic_stats" ON traffic_stats;
CREATE POLICY "admin_delete_traffic_stats" ON traffic_stats FOR DELETE TO authenticated USING (true);

-- ─── alerts ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'system',
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_alerts" ON alerts;
CREATE POLICY "admin_select_alerts" ON alerts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_alerts" ON alerts;
CREATE POLICY "admin_insert_alerts" ON alerts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_alerts" ON alerts;
CREATE POLICY "admin_update_alerts" ON alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_alerts" ON alerts;
CREATE POLICY "admin_delete_alerts" ON alerts FOR DELETE TO authenticated USING (true);

-- ─── Seed Data ────────────────────────────────────────────────────────────────
INSERT INTO vpn_users (username, email, is_enabled, expires_at, max_connections, notes) VALUES
  ('alice.chen', 'alice@example.com', true, now() + interval '180 days', 2, 'Senior developer'),
  ('bob.smith', 'bob@example.com', true, now() + interval '90 days', 1, 'Remote contractor'),
  ('carol.white', 'carol@example.com', true, NULL, 3, 'DevOps lead - no expiry'),
  ('dave.johnson', 'dave@example.com', false, now() - interval '5 days', 1, 'Offboarded'),
  ('eve.martinez', 'eve@example.com', true, now() + interval '365 days', 1, 'Security team'),
  ('frank.lee', 'frank@example.com', true, now() + interval '30 days', 2, 'Trial user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO vpn_sessions (vpn_user_id, started_at, ended_at, client_ip, country, bytes_in, bytes_out, status)
SELECT
  u.id,
  now() - (floor(random() * 120) || ' minutes')::interval,
  CASE WHEN random() > 0.4 THEN now() - (floor(random() * 30) || ' minutes')::interval ELSE NULL END,
  ('185.' || floor(random()*255)::int || '.' || floor(random()*255)::int || '.' || floor(random()*255)::int),
  (ARRAY['US','DE','GB','JP','CA','AU','FR','SG'])[floor(random()*8+1)::int],
  (random() * 500000000)::bigint,
  (random() * 100000000)::bigint,
  CASE WHEN random() > 0.4 THEN 'active' ELSE 'disconnected' END
FROM vpn_users u
WHERE u.is_enabled = true
LIMIT 8;

INSERT INTO connection_logs (vpn_user_id, event_type, client_ip, message, severity, created_at)
SELECT
  u.id,
  evt,
  ('192.168.' || floor(random()*255)::int || '.' || floor(random()*255)::int),
  msg,
  sev,
  now() - (seq || ' minutes')::interval
FROM vpn_users u,
  (VALUES
    ('connect',    'Client connected successfully',         'info',     2),
    ('connect',    'Client connected successfully',         'info',     8),
    ('disconnect', 'Client disconnected cleanly',           'info',    15),
    ('auth_fail',  'Authentication failure — invalid cert', 'warning', 22),
    ('connect',    'Client connected successfully',         'info',    31),
    ('disconnect', 'Session timeout after 3600s',           'info',    45),
    ('auth_fail',  'Repeated auth failures from same IP',   'error',   52),
    ('connect',    'Client connected successfully',         'info',    60),
    ('disconnect', 'Client disconnected cleanly',           'info',    75),
    ('connect',    'Client connected successfully',         'info',    90)
  ) AS events(evt, msg, sev, seq)
LIMIT 40;

INSERT INTO audit_logs (action, resource_type, resource_id, details, client_ip, created_at) VALUES
  ('user_created',    'vpn_user',  'system', '{"username":"frank.lee"}'::jsonb,    '10.0.0.1', now() - interval '1 hour'),
  ('config_generated','vpn_profile','system','{"protocol":"WireGuard"}'::jsonb,    '10.0.0.1', now() - interval '2 hours'),
  ('user_disabled',   'vpn_user',  'system', '{"username":"dave.johnson"}'::jsonb, '10.0.0.1', now() - interval '5 days'),
  ('config_revoked',  'vpn_profile','system','{"username":"dave.johnson"}'::jsonb, '10.0.0.1', now() - interval '5 days'),
  ('admin_login',     'auth',       'system', '{"method":"password"}'::jsonb,      '10.0.0.1', now() - interval '3 hours')
ON CONFLICT DO NOTHING;

INSERT INTO traffic_stats (hour, bytes_in, bytes_out, active_connections, cpu_usage, ram_usage)
SELECT
  date_trunc('hour', now()) - (s.h || ' hours')::interval,
  (200000000 + random() * 300000000)::bigint,
  (50000000  + random() * 100000000)::bigint,
  (2 + floor(random() * 8))::int,
  (15 + random() * 45)::numeric(5,2),
  (40 + random() * 30)::numeric(5,2)
FROM generate_series(0, 23) AS s(h)
ON CONFLICT (hour) DO NOTHING;

INSERT INTO alerts (type, severity, title, message, is_resolved, created_at) VALUES
  ('security',    'error',   'Multiple Auth Failures',        '7 failed authentication attempts from IP 203.0.113.42 in the last hour.',   false, now() - interval '20 minutes'),
  ('performance', 'warning', 'High CPU Usage',                'CPU utilization exceeded 85% for 5 consecutive minutes.',                   false, now() - interval '1 hour'),
  ('system',      'info',    'Certificate Renewal Due',       'Server TLS certificate expires in 14 days. Renewal recommended.',           false, now() - interval '2 hours'),
  ('security',    'warning', 'Unusual Traffic Pattern',       'User carol.white transferred >2GB in 10 minutes — possible data exfil.',   true,  now() - interval '1 day'),
  ('system',      'info',    'Backup Completed Successfully',  'Automated configuration backup completed at 02:00 UTC.',                   true,  now() - interval '22 hours')
ON CONFLICT DO NOTHING;
