import React, { useEffect } from 'react';
import { Bell, RefreshCw, Wifi } from 'lucide-react';
import { timeAgo } from '../lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  lastUpdated?: string;
  alertCount?: number;
  onAlertClick?: () => void;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  lastUpdated,
  alertCount = 0,
  onAlertClick,
}: HeaderProps) {

  // Mise à jour automatique toutes les 5 secondes
  useEffect(() => {
    if (!onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">

        {/* Server status indicator */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          <Wifi className="w-3 h-3" />
          <span className="font-medium">
            Server Online
          </span>
        </div>

        {/* Last update */}
        {lastUpdated && (
          <span className="text-xs text-gray-500 hidden sm:block">
            Updated {timeAgo(lastUpdated)}
          </span>
        )}

        {/* Refresh button - manuel + automatique */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Alerts */}
        <button
          type="button"
          onClick={onAlertClick}
          className="relative p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />

          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}
