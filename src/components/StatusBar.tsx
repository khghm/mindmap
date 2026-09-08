import React from 'react';
import { useMindMap } from '../MindMapContext';

export default function StatusBar() {
  const { state, canUndo, canRedo, undo, redo } = useMindMap();
  const { nodes, theme, zoom, layout, selectedNodeId } = state;
  const isDark = theme === 'dark';
  const nodeCount = Object.keys(nodes).length;

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  const layoutLabels: Record<string, string> = {
    'organic': 'ارگانیک',
    'radial': 'شعاعی',
    'tree-right': 'درختی راست',
    'tree-down': 'درختی پایین',
    'tree-left': 'درختی چپ',
  };

  return (
    <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs backdrop-blur-sm ${
      isDark ? 'bg-gray-900/80 text-gray-400 border border-gray-700/50' : 'bg-white/80 text-gray-500 border border-gray-200/50'
    }`}>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {nodeCount} نود
      </span>
      <span className={`w-px h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <span>{layoutLabels[layout] || layout}</span>
      {selectedNode && (
        <>
          <span className={`w-px h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color }} />
            <span className="max-w-[100px] truncate">{selectedNode.text}</span>
          </span>
        </>
      )}
      <span className={`w-px h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            canUndo
              ? isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="بازگشت (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            canRedo
              ? isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="جلو (Ctrl+Shift+Z)"
        >
          ↪️
        </button>
      </div>
    </div>
  );
}
