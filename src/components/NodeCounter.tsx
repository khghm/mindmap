import React from 'react';
import { useMindMap } from '../MindMapContext';

export default function NodeCounter() {
  const { state } = useMindMap();
  const { nodes, theme, zoom } = state;
  const isDark = theme === 'dark';
  const nodeCount = Object.keys(nodes).length;

  return (
    <div
      className={`absolute bottom-6 right-6 z-20 px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 text-xs ${
        isDark
          ? 'bg-gray-800/80 text-gray-400 border border-gray-700/50'
          : 'bg-white/80 text-gray-600 border border-gray-200/50'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span>📊</span>
        <span className="font-medium">{nodeCount}</span>
        <span>نود</span>
      </div>
      <div className={`w-px h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className="flex items-center gap-1.5">
        <span>🔍</span>
        <span className="font-medium">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
