import React from 'react';

const LEAF = 'M0 0 C 18 -15, 48 -19, 74 -8 C 54 9, 24 13, 0 0Z';
const VEIN = 'M2 0 L 64 -6';

const LEAVES = [
  { x: 144, y: 328, r: -28, s: 1.25, flip: false },
  { x: 144, y: 296, r: -24, s: 1.1, flip: true },
  { x: 144, y: 254, r: -30, s: 1.15, flip: false },
  { x: 146, y: 218, r: -26, s: 1.0, flip: true },
  { x: 148, y: 180, r: -32, s: 0.95, flip: false },
  { x: 152, y: 142, r: -28, s: 0.85, flip: true },
  { x: 156, y: 106, r: -34, s: 0.75, flip: false },
  { x: 161, y: 72, r: -30, s: 0.62, flip: true },
  { x: 166, y: 49, r: -78, s: 0.5, flip: false },
];

// 細線條的植物小枝。顏色由外面用 text-色彩 或 style={{ color }} 決定。
export default function Sprig({ className = '', style }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 420"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M150 410 Q 130 220 170 30" vectorEffect="non-scaling-stroke" />
      {LEAVES.map((leaf, index) => (
        <g
          key={index}
          transform={`translate(${leaf.x} ${leaf.y}) ${
            leaf.flip ? 'scale(-1 1) ' : ''
          }rotate(${leaf.r}) scale(${leaf.s})`}
        >
          <path d={LEAF} vectorEffect="non-scaling-stroke" />
          <path d={VEIN} vectorEffect="non-scaling-stroke" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
}
