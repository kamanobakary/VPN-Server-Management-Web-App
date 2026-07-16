import React from 'react';
import type { TrafficStat } from '../types';
import { formatBytes } from '../lib/utils';

interface TrafficChartProps {
  data: TrafficStat[];
  height?: number;
}

export default function TrafficChart({ data, height = 120 }: TrafficChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-sm">
        No traffic data
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime());
  const maxIn = Math.max(...sorted.map((d) => d.bytes_in), 1);
  const maxOut = Math.max(...sorted.map((d) => d.bytes_out), 1);
  const maxVal = Math.max(maxIn, maxOut);

  const W = 600;
  const H = height;
  const PAD = { top: 10, right: 10, bottom: 24, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = sorted.length;

  const xPos = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const yPos = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const linePath = (values: number[]) =>
    values
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`)
      .join(' ');

  const areaPath = (values: number[]) =>
    `${linePath(values)} L${xPos(n - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  const inValues = sorted.map((d) => d.bytes_in);
  const outValues = sorted.map((d) => d.bytes_out);

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: yPos(f * maxVal),
    label: formatBytes(f * maxVal),
  }));

  // X-axis labels (every 6 hours)
  const xLabels = sorted
    .map((d, i) => ({ i, label: new Date(d.hour).getHours() + ':00' }))
    .filter((_, i) => i % 6 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(({ y }, i) => (
        <line
          key={i}
          x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
          stroke="#1f2937" strokeWidth="1"
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map(({ y, label }, i) => (
        <text key={i} x={PAD.left - 6} y={y} textAnchor="end" dominantBaseline="middle"
          className="fill-gray-600" style={{ fontSize: 9, fontFamily: 'monospace' }}>
          {label}
        </text>
      ))}

      {/* X axis labels */}
      {xLabels.map(({ i, label }) => (
        <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle"
          className="fill-gray-600" style={{ fontSize: 9, fontFamily: 'monospace' }}>
          {label}
        </text>
      ))}

      {/* Area fills */}
      <path d={areaPath(inValues)} fill="url(#gradIn)" />
      <path d={areaPath(outValues)} fill="url(#gradOut)" />

      {/* Lines */}
      <path d={linePath(inValues)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath(outValues)} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
