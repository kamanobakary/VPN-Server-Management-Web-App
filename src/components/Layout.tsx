import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
  alertCount,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden font-sans">

      {/* Mobile menu button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center text-xl"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          transition-transform duration-300
          ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          collapsed={false}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          alertCount={alertCount}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </div>
  );
}
