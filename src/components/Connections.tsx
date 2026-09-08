import React, { useMemo } from 'react';
import { useMindMap } from '../MindMapContext';

export default function Connections() {
  const { state, getVisibleNodes } = useMindMap();
  const { nodes, zoom, panX, panY, connectionStyle, theme } = state;
  const isDark = theme === 'dark';
  const visibleNodes = getVisibleNodes();
  const visibleIds = new Set(visibleNodes.map(n => n.id));

  const paths = useMemo(() => {
    return visibleNodes
      .filter(node => node.parentId && visibleIds.has(node.parentId))
      .map(node => {
        const parent = nodes[node.parentId!];
        if (!parent) return null;

        const sx = parent.x + parent.width / 2;
        const sy = parent.y + parent.height / 2;
        const tx = node.x + node.width / 2;
        const ty = node.y + node.height / 2;

        let d = '';
        const dx = tx - sx;
        const dy = ty - sy;

        switch (connectionStyle) {
          case 'bezier': {
            const cx1 = sx + dx * 0.4;
            const cy1 = sy;
            const cx2 = tx - dx * 0.4;
            const cy2 = ty;
            d = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
            break;
          }
          case 'straight':
            d = `M ${sx} ${sy} L ${tx} ${ty}`;
            break;
          case 'step': {
            const midX = sx + dx / 2;
            d = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
            break;
          }
          case 'smooth': {
            const cp1x = sx + dx * 0.5;
            const cp1y = sy + dy * 0.1;
            const cp2x = tx - dx * 0.5;
            const cp2y = ty - dy * 0.1;
            d = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;
            break;
          }
        }

        return {
          id: `${parent.id}-${node.id}`,
          d,
          color: node.color || parent.color || '#6366f1',
          sx, sy, tx, ty,
        };
      })
      .filter(Boolean);
  }, [visibleNodes, nodes, connectionStyle, visibleIds]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {paths.map((p) => p && (
        <g key={p.id}>
          {/* Shadow/glow */}
          <path
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="4"
            opacity="0.15"
            filter="url(#glow)"
          />
          {/* Main line */}
          <path
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
            className="connection-path"
          />
          {/* Animated dot */}
          <circle r="3" fill={p.color} opacity="0.9">
            <animateMotion dur="3s" repeatCount="indefinite" path={p.d} />
          </circle>
        </g>
      ))}
    </svg>
  );
}
