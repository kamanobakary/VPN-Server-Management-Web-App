import React from 'react';
import type { Severity } from '../types';

interface BadgeProps {
  label: string;
  variant?: Severity | 'active' | 'inactive' | 'neutral';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  info:     'bg-blue-500/15 text-blue-400 border-blue-500/25',
  warning:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  error:    'bg-red-500/15 text-red-400 border-red-500/25',
  critical: 'bg-red-600/20 text-red-300 border-red-600/30',
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  neutral:  'bg-gray-700/50 text-gray-400 border-gray-700',
};

const sizes = { sm: 'text-[10px] px-1.5 py-0.5', md: 'text-xs px-2 py-0.5' };

export default function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant] ?? variants.neutral} ${sizes[size]}`}>
      {label}
    </span>
  );
}
