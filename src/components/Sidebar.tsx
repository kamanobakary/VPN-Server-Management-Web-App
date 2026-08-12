import React from 'react';
import {
  Shield, LayoutDashboard, Users, Network, Activity,
  Settings, LogOut, ChevronLeft, ChevronRight, Bell, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  alertCount: number;
}

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'vpn',         label: 'VPN Management',  icon: Network },
  { id: 'users',       label: 'User Management', icon: Users },
  { id: 'monitoring',  label: 'Monitoring',       icon: Activity },
  { id: 'settings',    label: 'Settings',         icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse, alertCount }: SidebarProps) {
  const { signOut, user } = useAuth();

  return (
    <aside
  className={`
    relative flex flex-col h-full bg-gray-950 border-r border-gray-800
    transition-all duration-300 ease-in-out
    ${collapsed ? 'w-16' : 'w-60'}
    max-md:w-16
  `}
>
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-emerald-400" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-semibold text-white tracking-wide">SecureVPN</div>
            <div className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-widest">Manager</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'monitoring' && alertCount > 0;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 mb-0.5 relative
                transition-all duration-150 text-sm font-medium
                ${collapsed ? 'justify-center px-2' : ''}
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }
              `}
              title={collapsed ? label : undefined}
            >
              <div className="relative flex-shrink-0">
                <Icon className="w-4 h-4" />
                {showBadge && collapsed && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              {!collapsed && (
                <>
                  <span>{label}</span>
                  {showBadge && (
                    <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-500/30">
                      {alertCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Sign out */}
      <div className={`border-t border-gray-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-1 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-emerald-400 font-bold uppercase">
                {user?.email?.[0] ?? 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-300 font-medium truncate">{user?.email ?? 'Admin'}</div>
              <div className="text-[10px] text-gray-500">Administrator</div>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className={`
            w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-400
            hover:bg-red-500/10 hover:text-red-400 transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
