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
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        alertCount={alertCount}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 w-full overflow-hidden">
        <div className="h-full w-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
