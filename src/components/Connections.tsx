import React from 'react';
import { useMindMap } from '../MindMapContext';

export default function Connections() {
  const { state } = useMindMap();
  const { nodes, connections, connectionStyle, zoom, panX, panY, theme } = state;
  const isDark = theme === 'dark';

  const nodeArray = Object.values(nodes);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {nodeArray.map(node => {
        if (!node.parentId || !nodes[node.parentId]) return null;
        const parent = nodes[node.parentId];

        const x1 = parent.x + parent.width / 2;
        const y1 = parent.y + parent.height / 2;
        const x2 = node.x + node.width / 2;
        const y2 = node.y + node.height / 2;

        let pathData = '';

        if (connectionStyle === 'bezier') {
          const controlX1 = x1 + (x2 - x1) * 0.3;
          const controlX2 = x1 + (x2 - x1) * 0.7;
          pathData = `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;
        } else if (connectionStyle === 'straight') {
          pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (connectionStyle === 'step') {
          const midX = (x1 + x2) / 2;
          pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else if (connectionStyle === 'smooth') {
          const dx = x2 - x1;
          const cx1 = x1 + dx * 0.4;
          const cx2 = x2 - dx * 0.4;
          pathData = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
        }

        return (
          <g key={`conn-${node.id}`}>
            {/* Glow effect */}
            <path
              d={pathData}
              stroke={node.color}
              strokeWidth={4}
              fill="none"
              opacity={0.2}
              filter="url(#glow)"
            />
            {/* Main line */}
            <path
              d={pathData}
              stroke={node.color}
              strokeWidth={2}
              fill="none"
              opacity={0.7}
              strokeLinecap="round"
            />
            {/* Animated dot */}
            <circle r="3" fill={node.color} opacity={0.9}>
              <animateMotion
                dur="3s"
                repeatCount="infinite"
                path={pathData}
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
