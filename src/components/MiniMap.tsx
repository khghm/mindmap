import React, { useMemo } from 'react';
import { useMindMap } from '../MindMapContext';

export default function MiniMap() {
  const { state, dispatch } = useMindMap();
  const { nodes, zoom, panX, panY, theme } = state;
  const isDark = theme === 'dark';
  const nodeArray = Object.values(nodes);

  const bounds = useMemo(() => {
    if (nodeArray.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 800 };
    const minX = Math.min(...nodeArray.map(n => n.x)) - 100;
    const maxX = Math.max(...nodeArray.map(n => n.x + n.width)) + 100;
    const minY = Math.min(...nodeArray.map(n => n.y)) - 100;
    const maxY = Math.max(...nodeArray.map(n => n.y + n.height)) + 100;
    return { minX, maxX, minY, maxY };
  }, [nodeArray]);

  const mapWidth = 180;
  const mapHeight = 120;
  const worldWidth = bounds.maxX - bounds.minX;
  const worldHeight = bounds.maxY - bounds.minY;
  const scale = Math.min(mapWidth / worldWidth, mapHeight / worldHeight) * 0.9;

  // Viewport
  const viewW = (window.innerWidth / zoom) * scale;
  const viewH = (window.innerHeight / zoom) * scale;
  const viewX = (-panX / zoom - bounds.minX) * scale + (mapWidth - worldWidth * scale) / 2;
  const viewY = (-panY / zoom - bounds.minY) * scale + (mapHeight - worldHeight * scale) / 2;

  const offsetX = (mapWidth - worldWidth * scale) / 2;
  const offsetY = (mapHeight - worldHeight * scale) / 2;

  return (
    <div className={`absolute bottom-6 right-6 rounded-xl overflow-hidden shadow-xl border ${
      isDark ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'
    } backdrop-blur-sm`}>
      <div className={`px-2.5 py-1 text-[10px] font-medium border-b ${
        isDark ? 'border-gray-700/50 text-gray-400' : 'border-gray-200/50 text-gray-500'
      }`}>
        🗺️ نمای کلی
      </div>
      <svg width={mapWidth} height={mapHeight} className="block">
        {/* Connections */}
        {nodeArray.map(node => {
          if (!node.parentId || !nodes[node.parentId]) return null;
          const parent = nodes[node.parentId];
          const x1 = (parent.x + parent.width / 2 - bounds.minX) * scale + offsetX;
          const y1 = (parent.y + parent.height / 2 - bounds.minY) * scale + offsetY;
          const x2 = (node.x + node.width / 2 - bounds.minX) * scale + offsetX;
          const y2 = (node.y + node.height / 2 - bounds.minY) * scale + offsetY;
          return (
            <line
              key={`l-${node.id}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={node.color}
              strokeWidth="0.5"
              opacity="0.4"
            />
          );
        })}
        {/* Nodes */}
        {nodeArray.map(node => {
          const x = (node.x - bounds.minX) * scale + offsetX;
          const y = (node.y - bounds.minY) * scale + offsetY;
          const w = Math.max(node.width * scale, 3);
          const h = Math.max(node.height * scale, 2);
          return (
            <rect
              key={node.id}
              x={x} y={y} width={w} height={h}
              rx="1"
              fill={node.color}
              opacity="0.8"
            />
          );
        })}
        {/* Viewport */}
        <rect
          x={viewX} y={viewY} width={viewW} height={viewH}
          fill="none"
          stroke={isDark ? '#ffffff44' : '#00000044'}
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    </div>
  );
}
