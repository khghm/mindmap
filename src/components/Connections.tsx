import React from 'react';
import { useMindMap } from '../MindMapContext';

export default function Connections() {
  const { state } = useMindMap();
  const { nodes, connections, connectionStyle, zoom, panX, panY } = state;

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
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
        </linearGradient>
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
          const midX = (x1 + x2) / 2;
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
          const dy = y2 - y1;
          const cx1 = x1 + dx * 0.4;
          const cy1 = y1;
          const cx2 = x2 - dx * 0.4;
          const cy2 = y2;
          pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
        }

        return (
          <g key={`conn-${node.id}`}>
            <path
              d={pathData}
              stroke={node.color}
              strokeWidth={2.5}
              fill="none"
              opacity={0.6}
              filter="url(#glow)"
            />
            <path
              d={pathData}
              stroke={node.color}
              strokeWidth={1.5}
              fill="none"
              opacity={0.9}
            />
            {/* Animated dot */}
            <circle r="3" fill={node.color} opacity={0.8}>
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
