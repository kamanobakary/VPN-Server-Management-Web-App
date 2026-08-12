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
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'vpn',
    label: 'VPN Management',
    icon: Network
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }
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

  /*
   * Sur ordinateur :
   * collapsed = true  → sidebar 64px
   * collapsed = false → sidebar 240px
   *
   * Sur téléphone :
   * mobileOpen = true  → sidebar visible
   * mobileOpen = false → sidebar cachée
   */
  const isExpanded = !collapsed || mobileOpen;

  // Navigation
  const handleNavigation = (id: string) => {
    onTabChange(id);

    // Fermer uniquement le menu mobile
    setMobileOpen(false);
  };

  return (
    <>
      {/* =====================================================
          BOUTON MENU ☰ - TELEPHONE
          ===================================================== */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="
          fixed
          left-4
          top-4
          z-[10000]

          w-10
          h-10

          flex
          items-center
          justify-center

          bg-gray-900
          border
          border-gray-700
          rounded-lg

          text-gray-300

          hover:text-white
          hover:border-emerald-500

          transition-colors

          md:hidden
        "
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* =====================================================
          OVERLAY - TELEPHONE
          ===================================================== */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-[9998]

            bg-black/60

            md:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside
        className={`
          fixed
          left-0
          top-0

          z-[9999]

          flex
          flex-col

          h-screen

          bg-gray-950
          border-r
          border-gray-800

          transition-all
          duration-300
          ease-in-out

          w-60

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }

          md:relative
          md:translate-x-0
          md:h-full
          md:z-10

          ${collapsed ? 'md:w-16' : 'md:w-60'}
        `}
      >

        {/* =====================================================
            HEADER / LOGO
            ===================================================== */}
        <div
          className={`
            flex
            items-center
            gap-3

            px-4
            py-5

            border-b
            border-gray-800

            ${
              isExpanded
                ? 'justify-start'
                : 'justify-center px-2'
            }
          `}
        >
          {/* Shield */}
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
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>

          {/* SecureVPN Manager */}
          {isExpanded && (
            <div className="min-w-0">
              <div
                className="
                  text-base
                  font-semibold
                  text-white
                  tracking-wide
                  whitespace-nowrap
                "
              >
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

          {/* =================================================
              BOUTON X - TELEPHONE
              ================================================= */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="
              ml-auto

              w-8
              h-8

              flex
              items-center
              justify-center

              text-gray-400

              hover:text-white

              transition-colors

              md:hidden
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
            ===================================================== */}
        <nav
          className="
            flex-1
            py-4

            overflow-y-auto
            overflow-x-hidden
          "
        >
          {navItems.map(
            ({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;

              const showBadge =
                id === 'monitoring' &&
                alertCount > 0;

              return (
                <button
                  type="button"
                  key={id}
                  onClick={() =>
                    handleNavigation(id)
                  }
                  className={`
                    w-full

                    flex
                    items-center

                    gap-3

                    px-4
                    py-3

                    mb-0.5

                    relative

                    transition-all
                    duration-150

                    text-sm
                    font-medium

                    ${
                      isExpanded
                        ? 'justify-start'
                        : 'justify-center px-2'
                    }

                    ${
                      isActive
                        ? `
                          bg-emerald-500/10
                          text-emerald-400
                          border-r-2
                          border-emerald-400
                        `
                        : `
                          text-gray-400
                          hover:bg-gray-800/50
                          hover:text-gray-200
                        `
                    }
                  `}
                  title={
                    !isExpanded
                      ? label
                      : undefined
                  }
                >
                  {/* Icon */}
                  <div
                    className="
                      relative
                      flex-shrink-0
                    "
                  >
                    <Icon className="w-5 h-5" />

                    {/* Badge quand sidebar réduite */}
                    {showBadge &&
                      !isExpanded && (
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

                  {/* Label */}
                  {isExpanded && (
                    <>
                      <span className="whitespace-nowrap">
                        {label}
                      </span>

                      {/* Alert count */}
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
            }
          )}
        </nav>

        {/* =====================================================
            USER / SIGN OUT
            ===================================================== */}
        <div
          className={`
            border-t
            border-gray-800

            p-3

            ${
              isExpanded
                ? ''
                : 'flex justify-center'
            }
          `}
        >
          {/* User information */}
          {isExpanded && (
            <div
              className="
                flex
                items-center
                gap-2

                px-1
                mb-2
              "
            >
              {/* Avatar */}
              <div
                className="
                  w-8
                  h-8

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

              {/* Email */}
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

                <div
                  className="
                    text-[10px]
                    text-gray-500
                  "
                >
                  Administrator
                </div>
              </div>
            </div>
          )}

          {/* Sign out */}
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
                isExpanded
                  ? 'justify-start'
                  : 'justify-center'
              }
            `}
            title={
              !isExpanded
                ? 'Sign out'
                : undefined
            }
          >
            <LogOut
              className="
                w-4
                h-4

                flex-shrink-0
              "
            />

            {isExpanded && (
              <span>Sign out</span>
            )}
          </button>
        </div>

        {/* =====================================================
            COLLAPSE BUTTON - ORDINATEUR SEULEMENT
            ===================================================== */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="
            absolute

            -right-3
            top-1/2

            -translate-y-1/2

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

            z-20

            max-md:hidden
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
