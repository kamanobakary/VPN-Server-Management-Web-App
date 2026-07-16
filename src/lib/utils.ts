/** Format bytes to a human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Format a duration in seconds to HH:MM:SS */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/** Format a timestamp relative to now (e.g. "5m ago") */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Check if an expiry date is past */
export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/** Format a date for display */
export function formatDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Generate a pseudo-random WireGuard-style key (for demo) */
export function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '=';
}

/** Generate a tunnel IP from an index */
export function generateTunnelIP(index: number): string {
  return `10.8.0.${10 + index}`;
}

/** Generate an OpenVPN config */
export function generateOpenVPNConfig(username: string, privateKey: string, ip: string): string {
  return `# OpenVPN Client Config — ${username}
# Generated: ${new Date().toISOString()}

client
dev tun
proto udp
remote vpn.example.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth SHA256
cipher AES-256-GCM
tls-version-min 1.2
verb 3

# Assigned tunnel IP
# ${ip}

<ca>
-----BEGIN CERTIFICATE-----
MIIBqTCCAU+gAwIBAgIUXXXXXXXXXXXXXXXXXXXXXXX=
-----END CERTIFICATE-----
</ca>

<cert>
-----BEGIN CERTIFICATE-----
MIIBzTCCAXOgAwIBAgIRAXXXXXXXXXXXXXXXXXXXXXX=
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
${privateKey.slice(0, 64)}
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
-----END PRIVATE KEY-----
</key>

<tls-auth>
-----BEGIN OpenVPN Static key V1-----
${Array.from({ length: 16 }, () => Math.random().toString(16).slice(2, 10)).join('\n')}
-----END OpenVPN Static key V1-----
</tls-auth>
key-direction 1`;
}

/** Generate a WireGuard config */
export function generateWireGuardConfig(username: string, privateKey: string, publicKey: string, ip: string): string {
  return `# WireGuard Client Config — ${username}
# Generated: ${new Date().toISOString()}

[Interface]
PrivateKey = ${privateKey}
Address = ${ip}/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${publicKey}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = vpn.example.com:51820
PersistentKeepalive = 25`;
}

/** Simple QR-like pattern generator (returns grid data for SVG rendering) */
export function generateQRPattern(size = 25): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      // Corner patterns (finder patterns)
      const topLeft = (r < 7 && c < 7);
      const topRight = (r < 7 && c >= size - 7);
      const bottomLeft = (r >= size - 7 && c < 7);
      if (topLeft || topRight || bottomLeft) {
        const localR = topLeft ? r : topRight ? r : r - (size - 7);
        const localC = topLeft ? c : topRight ? c - (size - 7) : c;
        grid[r][c] = !(localR === 1 || localR === 5) && !(localC === 1 || localC === 5)
          ? (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) || localR === 0 || localR === 6 || localC === 0 || localC === 6
          : false;
      } else {
        grid[r][c] = Math.random() > 0.5;
      }
    }
  }
  return grid;
}
