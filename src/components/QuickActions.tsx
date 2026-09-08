import React from 'react';
import { motion } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function QuickActions() {
  const { state, addNode, deleteNode, duplicateNode, updateNode, pushHistory } = useMindMap();
  const { selectedNodeId, nodes, theme } = state;
  const isDark = theme === 'dark';

  if (!selectedNodeId || selectedNodeId === state.rootId) return null;

  const node = nodes[selectedNodeId];
  if (!node) return null;

  const quickColors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  const handleAddChild = () => {
    pushHistory('افزودن زیرنود');
    addNode(selectedNodeId, 'زیرنود جدید', node.x + 200, node.y);
  };

  const handleDelete = () => {
    pushHistory('حذف نود');
    deleteNode(selectedNodeId);
  };

  const handleDuplicate = () => {
    pushHistory('تکرار نود');
    duplicateNode(selectedNodeId);
  };

  const handleChangeColor = (color: string) => {
    pushHistory('تغییر رنگ');
    updateNode(selectedNodeId, { color });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl backdrop-blur-sm ${
        isDark
          ? 'bg-gray-800/90 border border-gray-700/50'
          : 'bg-white/90 border border-gray-200/50'
      }`}
    >
      <button
        onClick={handleAddChild}
        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
          isDark
            ? 'hover:bg-gray-700/50 text-gray-300'
            : 'hover:bg-gray-100/50 text-gray-600'
        }`}
        title="افزودن زیرنود"
      >
        <span>➕</span>
        <span className="hidden sm:inline">زیرنود</span>
      </button>

      <button
        onClick={handleDuplicate}
        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
          isDark
            ? 'hover:bg-gray-700/50 text-gray-300'
            : 'hover:bg-gray-100/50 text-gray-600'
        }`}
        title="تکرار نود"
      >
        <span>📋</span>
        <span className="hidden sm:inline">تکرار</span>
      </button>

      <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

      <div className="flex items-center gap-1">
        {quickColors.map(color => (
          <button
            key={color}
            onClick={() => handleChangeColor(color)}
            className="w-6 h-6 rounded-full border-2 border-white/30 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={`تغییر رنگ`}
          />
        ))}
      </div>

      <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

      <button
        onClick={handleDelete}
        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
          isDark
            ? 'hover:bg-red-900/30 text-red-400'
            : 'hover:bg-red-50 text-red-500'
        }`}
        title="حذف نود"
      >
        <span>🗑️</span>
        <span className="hidden sm:inline">حذف</span>
      </button>
    </motion.div>
  );
}
