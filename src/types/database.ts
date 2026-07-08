export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      vpn_users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          is_enabled: boolean;
          expires_at: string | null;
          max_connections: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vpn_users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vpn_users']['Insert']>;
      };
      vpn_profiles: {
        Row: {
          id: string;
          vpn_user_id: string | null;
          name: string;
          protocol: string;
          config_data: string | null;
          public_key: string | null;
          private_key: string | null;
          ip_address: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vpn_profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vpn_profiles']['Insert']>;
      };
      vpn_sessions: {
        Row: {
          id: string;
          vpn_user_id: string | null;
          profile_id: string | null;
          started_at: string;
          ended_at: string | null;
          client_ip: string | null;
          country: string | null;
          bytes_in: number;
          bytes_out: number;
          status: string;
        };
        Insert: Omit<Database['public']['Tables']['vpn_sessions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['vpn_sessions']['Insert']>;
      };
      connection_logs: {
        Row: {
          id: string;
          vpn_user_id: string | null;
          event_type: string;
          client_ip: string | null;
          message: string | null;
          severity: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['connection_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['connection_logs']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          details: Json | null;
          client_ip: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      traffic_stats: {
        Row: {
          id: string;
          hour: string;
          bytes_in: number;
          bytes_out: number;
          active_connections: number;
          cpu_usage: number | null;
          ram_usage: number | null;
        };
        Insert: Omit<Database['public']['Tables']['traffic_stats']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['traffic_stats']['Insert']>;
      };
      alerts: {
        Row: {
          id: string;
          type: string;
          severity: string;
          title: string;
          message: string | null;
          is_resolved: boolean;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
      };
    };
  };
}
