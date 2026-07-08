import React from 'react';
import { generateQRPattern } from '../lib/utils';

interface QRCodeProps {
  value: string;
  size?: number;
}

export default function QRCode({ value: _value, size = 160 }: QRCodeProps) {
  // Generate a stable-looking pattern based on the value (deterministic look)
  const grid = React.useMemo(() => generateQRPattern(25), [_value]);
  const cellSize = size / 25;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg"
      style={{ background: 'white' }}
    >
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#000"
            />
          ) : null
        )
      )}
    </svg>
  );
}
