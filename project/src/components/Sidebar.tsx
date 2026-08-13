import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Network,
  Activity,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Menu,
  X,
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
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  alertCount,
}: SidebarProps) {
  const { signOut, user } = useAuth();

  const [settingsOpen, setSettingsOpen] = useState(false);

  // État de la sidebar sur téléphone
  const [mobileOpen, setMobileOpen] = useState(false);

  const openSettings = () => {
    setSettingsOpen(true);
    onTabChange('settings');
    setMobileOpen(false);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    onTabChange('dashboard');
    setMobileOpen(false);
  };

  const handleTabChange = (id: string) => {
    if (id === 'settings') {
      openSettings();
    } else {
      onTabChange(id);

      // Fermer automatiquement la sidebar sur téléphone
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* =========================================
          BOUTON 3 TRAITS - TÉLÉPHONE UNIQUEMENT
      ========================================= */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          md:hidden
          fixed
          top-4
          left-4
          z-[1100]
          w-11
          h-11
          flex
          items-center
          justify-center
          rounded-lg
          bg-gray-900
          border
          border-gray-700
          text-gray-300
          hover:text-emerald-400
          hover:border-emerald-500/40
          transition-colors
        "
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* =========================================
          OVERLAY - TÉLÉPHONE
      ========================================= */}
      {mobileOpen && (
        <div
          className="
            md:hidden
            fixed
            inset-0
            z-[900]
            bg-black/60
          "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`
          flex
          flex-col
          h-full
          bg-gray-950

          transition-all
          duration-300
          ease-in-out

          /* DESKTOP */
          md:relative
          md:translate-x-0
          md:z-auto

          ${collapsed ? 'md:w-16' : 'md:w-60'}

          /* MOBILE */
          fixed
          top-0
          left-0
          z-[1000]
          w-72
          h-screen

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* =========================================
            LOGO
        ========================================= */}
        <div
          className={`
            flex
            items-center
            gap-3
            px-4
            py-5

            ${collapsed ? 'md:justify-center md:px-2' : ''}
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

          <div className="md:block">
            <div className="text-sm font-semibold text-white tracking-wide">
              SecureVPN
            </div>

            <div className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-widest">
              Manager
            </div>
          </div>
        </div>

        {/* =========================================
            NAVIGATION
        ========================================= */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {!settingsOpen ? (
            <>
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;

                const showBadge =
                  id === 'monitoring' && alertCount > 0;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTabChange(id)}
                    className={`
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      mb-0.5

                      transition-all
                      duration-150

                      text-sm
                      font-medium

                      ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                      }

                      ${
                        collapsed
                          ? 'md:justify-center md:px-2'
                          : ''
                      }
                    `}
                    title={collapsed ? label : undefined}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className="w-5 h-5" />

                      {showBadge && collapsed && (
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

                    {/* Texte caché uniquement quand
                        la sidebar est COLLAPSED sur PC */}
                    <span
                      className={`
                        ${
                          collapsed
                            ? 'md:hidden'
                            : 'block'
                        }
                      `}
                    >
                      {label}
                    </span>

                    {showBadge && (
                      <span
                        className={`
                          ml-auto
                          bg-red-500/20
                          text-red-400
                          text-[10px]
                          font-bold
                          px-1.5
                          py-0.5
                          rounded-full

                          ${
                            collapsed
                              ? 'md:hidden'
                              : ''
                          }
                        `}
                      >
                        {alertCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {/* Back button */}
              <button
                type="button"
                onClick={closeSettings}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3

                  transition-all
                  duration-150

                  text-sm
                  font-medium

                  text-gray-400
                  hover:bg-gray-800/50
                  hover:text-gray-200

                  ${
                    collapsed
                      ? 'md:justify-center md:px-2'
                      : ''
                  }
                `}
                title={collapsed ? 'Back' : undefined}
              >
                <ArrowLeft className="w-5 h-5 flex-shrink-0" />

                <span
                  className={`
                    ${
                      collapsed
                        ? 'md:hidden'
                        : 'block'
                    }
                  `}
                >
                  Back
                </span>
              </button>
            </>
          )}
        </nav>

        {/* =========================================
            USER / SIGN OUT
        ========================================= */}
        <div
          className={`
            p-3
            ${
              collapsed
                ? 'md:flex md:justify-center'
                : ''
            }
          `}
        >
          <div
            className={`
              flex
              items-center
              gap-2
              px-1
              mb-2

              ${
                collapsed
                  ? 'md:hidden'
                  : 'flex'
              }
            `}
          >
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

          <button
            type="button"
            onClick={signOut}
            className={`
              w-full
              flex
              items-center
              gap-2
              px-2
              py-2
              rounded-md

              text-xs
              text-gray-400

              hover:bg-red-500/10
              hover:text-red-400

              transition-colors

              ${
                collapsed
                  ? 'md:justify-center'
                  : ''
              }
            `}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />

            <span
              className={`
                ${
                  collapsed
                    ? 'md:hidden'
                    : 'block'
                }
              `}
            >
              Sign out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
