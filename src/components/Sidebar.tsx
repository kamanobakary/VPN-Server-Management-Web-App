import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Network,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vpn', label: 'VPN Management', icon: Network },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  alertCount
}: SidebarProps) {
  const { signOut, user } = useAuth();

  // État du menu sur téléphone
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sur ordinateur : collapsed
  // Sur téléphone : mobileOpen
  const isExpanded = !collapsed || mobileOpen;

  // Navigation
  const handleNavigation = (id: string) => {
    onTabChange(id);

    // Sur téléphone, fermer le menu après sélection
    setMobileOpen(false);
  };

  return (
    <>
      {/* ==============================
          BOUTON 3 TRAITS - TELEPHONE
          ============================== */}
      <button
        onClick={() => setMobileOpen(true)}
        className="
          hidden max-md:flex
          fixed top-4 left-4
          z-[60]
          w-10 h-10
          items-center justify-center
          bg-gray-900
          border border-gray-700
          rounded-lg
          text-gray-300
          hover:text-white
          hover:border-emerald-500
          transition-colors
        "
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ==============================
          FOND SOMBRE TELEPHONE
          ============================== */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            hidden max-md:block
            fixed inset-0
            bg-black/60
            z-40
          "
        />
      )}

      {/* ==============================
          SIDEBAR
          ============================== */}
      <aside
        className={`
          relative
          flex
          flex-col
          h-full
          bg-gray-950
          border-r
          border-gray-800
          transition-all
          duration-300
          ease-in-out

          ${collapsed ? 'w-16' : 'w-60'}

          /* TELEPHONE */
          max-md:fixed
          max-md:left-0
          max-md:top-0
          max-md:h-screen
          max-md:w-60
          max-md:z-50

          ${
            mobileOpen
              ? 'max-md:translate-x-0'
              : 'max-md:-translate-x-full'
          }
        `}
      >

        {/* ==============================
            LOGO
            ============================== */}
        <div
          className={`
            flex
            items-center
            gap-3
            px-4
            py-5
            border-b
            border-gray-800

            ${isExpanded ? '' : 'justify-center px-2'}
          `}
        >
          <div
            className="
              flex-shrink-0
              w-8
              h-8
              bg-emerald-500/10
              border
              border-emerald-500/30
              rounded-lg
              flex
              items-center
              justify-center
            "
          >
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>

          {/* SecureVPN Manager */}
          {isExpanded && (
            <div>
              <div className="text-sm font-semibold text-white tracking-wide">
                SecureVPN
              </div>

              <div
                className="
                  text-[10px]
                  text-emerald-400/70
                  font-mono
                  uppercase
                  tracking-widest
                "
              >
                Manager
              </div>
            </div>
          )}

          {/* X sur téléphone */}
          <button
            onClick={() => setMobileOpen(false)}
            className="
              hidden
              max-md:flex
              ml-auto
              w-8
              h-8
              items-center
              justify-center
              text-gray-400
              hover:text-white
            "
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==============================
            NAVIGATION
            ============================== */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const showBadge =
              id === 'monitoring' && alertCount > 0;

            return (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  mb-0.5
                  relative
                  transition-all
                  duration-150
                  text-sm
                  font-medium

                  ${isExpanded ? '' : 'justify-center px-2'}

                  ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }
                `}
                title={!isExpanded ? label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-4 h-4" />

                  {showBadge && !isExpanded && (
                    <span
                      className="
                        absolute
                        -top-1
                        -right-1
                        w-2
                        h-2
                        bg-red-500
                        rounded-full
                      "
                    />
                  )}
                </div>

                {/* Texte visible quand le menu est ouvert */}
                {isExpanded && (
                  <>
                    <span>{label}</span>

                    {showBadge && (
                      <span
                        className="
                          ml-auto
                          bg-red-500/20
                          text-red-400
                          text-[10px]
                          font-bold
                          px-1.5
                          py-0.5
                          rounded-full
                          border
                          border-red-500/30
                        "
                      >
                        {alertCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* ==============================
            USER / SIGN OUT
            ============================== */}
        <div
          className={`
            border-t
            border-gray-800
            p-3

            ${isExpanded ? '' : 'flex justify-center'}
          `}
        >
          {isExpanded && (
            <div className="flex items-center gap-2 px-1 mb-2">
              <div
                className="
                  w-7
                  h-7
                  rounded-full
                  bg-emerald-500/20
                  border
                  border-emerald-500/30
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                "
              >
                <span
                  className="
                    text-xs
                    text-emerald-400
                    font-bold
                    uppercase
                  "
                >
                  {user?.email?.[0] ?? 'A'}
                </span>
              </div>

              <div className="min-w-0">
                <div
                  className="
                    text-xs
                    text-gray-300
                    font-medium
                    truncate
                  "
                >
                  {user?.email ?? 'Admin'}
                </div>

                <div className="text-[10px] text-gray-500">
                  Administrator
                </div>
              </div>
            </div>
          )}

          <button
            onClick={signOut}
            className={`
              w-full
              flex
              items-center
              gap-2
              px-2
              py-1.5
              rounded-md
              text-xs
              text-gray-400
              hover:bg-red-500/10
              hover:text-red-400
              transition-colors

              ${isExpanded ? '' : 'justify-center'}
            `}
            title={!isExpanded ? 'Sign out' : undefined}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />

            {isExpanded && <span>Sign out</span>}
          </button>
        </div>

        {/* ==============================
            BOUTON REDUIRE - ORDINATEUR
            ============================== */}
        <button
          onClick={onToggleCollapse}
          className="
            absolute
            -right-3
            top-1/2
            -translate-y-1/2

            max-md:hidden

            w-6
            h-6
            bg-gray-800
            border
            border-gray-700
            rounded-full
            flex
            items-center
            justify-center
            text-gray-400
            hover:text-white
            hover:border-gray-600
            transition-colors
            z-10
          "
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

      </aside>
    </>
  );
}
