import React from 'react';
import { useMindMap } from '../MindMapContext';

export default function Connections() {
  const { state } = useMindMap();
  const { nodes } = state;

  const connections: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color: string;
    id: string;
  }> = [];

  Object.values(nodes).forEach(node => {
    if (node.parentId && nodes[node.parentId]) {
      const parent = nodes[node.parentId];
      if (parent.collapsed) return;
      
      connections.push({
        fromX: parent.x + parent.width / 2,
        fromY: parent.y + parent.height / 2,
        toX: node.x + node.width / 2,
        toY: node.y + node.height / 2,
        color: node.color,
        id: `${parent.id}-${node.id}`,
      });
    }
  });

  const isDark = state.theme === 'dark';

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {connections.map(conn => {
        const dx = conn.toX - conn.fromX;
        const dy = conn.toY - conn.fromY;
        const cx1 = conn.fromX + dx * 0.4;
        const cy1 = conn.fromY;
        const cx2 = conn.toX - dx * 0.4;
        const cy2 = conn.toY;
        
        const path = `M ${conn.fromX} ${conn.fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${conn.toX} ${conn.toY}`;
        
        return (
          <g key={conn.id}>
            {/* Glow effect */}
            <path
              d={path}
              fill="none"
              stroke={conn.color}
              strokeWidth="4"
              opacity="0.15"
              filter="url(#glow)"
            />
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={conn.color}
              strokeWidth="2.5"
              opacity="0.7"
              strokeLinecap="round"
            />
            {/* Animated dot */}
            <circle r="3" fill={conn.color} opacity="0.8">
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path={path}
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
