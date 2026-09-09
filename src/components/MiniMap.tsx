import React from 'react';
import { motion } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function MiniMap() {
  const { state } = useMindMap();
  const { nodes, zoom, panX, panY, theme, showMiniMap } = state;
  const isDark = theme === 'dark';

  if (!showMiniMap) return null;

  const nodeArray = Object.values(nodes);
  if (nodeArray.length === 0) return null;

  // Calculate bounds
  const minX = Math.min(...nodeArray.map(n => n.x)) - 50;
  const maxX = Math.max(...nodeArray.map(n => n.x + n.width)) + 50;
  const minY = Math.min(...nodeArray.map(n => n.y)) - 50;
  const maxY = Math.max(...nodeArray.map(n => n.y + n.height)) + 50;

  const mapWidth = maxX - minX;
  const mapHeight = maxY - minY;
  const scale = Math.min(150 / mapWidth, 100 / mapHeight);

  // Viewport rectangle
  const viewWidth = (window.innerWidth / zoom) * scale;
  const viewHeight = (window.innerHeight / zoom) * scale;
  const viewX = (-panX / zoom - minX) * scale;
  const viewY = (-panY / zoom - minY) * scale;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute bottom-20 right-4 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ${
        isDark ? 'glass-dark' : 'glass-light'
      }`}
    >
      <div className={`px-4 py-2 text-xs font-medium border-b ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-200/50 text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <span>🗺️</span>
          <span>نقشه کلی</span>
        </div>
      </div>
      <svg width="160" height="110" className="block">
        {/* Connections */}
        {nodeArray.map(node => {
          if (!node.parentId || !nodes[node.parentId]) return null;
          const parent = nodes[node.parentId];
          return (
            <line
              key={`line-${node.id}`}
              x1={(parent.x + parent.width / 2 - minX) * scale}
              y1={(parent.y + parent.height / 2 - minY) * scale}
              x2={(node.x + node.width / 2 - minX) * scale}
              y2={(node.y + node.height / 2 - minY) * scale}
              stroke={node.color}
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}
        {/* Nodes */}
        {nodeArray.map(node => (
          <rect
            key={node.id}
            x={(node.x - minX) * scale}
            y={(node.y - minY) * scale}
            width={Math.max(node.width * scale, 4)}
            height={Math.max(node.height * scale, 3)}
            rx="2"
            fill={node.color}
            opacity="0.8"
          />
        ))}
        {/* Viewport */}
        <rect
          x={viewX}
          y={viewY}
          width={viewWidth}
          height={viewHeight}
          fill="none"
          stroke={isDark ? '#ffffff44' : '#00000044'}
          strokeWidth="1.5"
          strokeDasharray="4,4"
          rx="2"
        />
      </svg>
    </motion.div>
  );
}
