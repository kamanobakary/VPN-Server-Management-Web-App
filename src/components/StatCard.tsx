import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; up: boolean };
  subtitle?: string;
}

export default function StatCard({ label, value, icon: Icon, iconColor = 'text-emerald-400', iconBg = 'bg-emerald-400/10', trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend.up ? '▲' : '▼'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
