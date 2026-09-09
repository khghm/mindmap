import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import { MindNode } from '../types';

export default function QuickActions() {
  const { state, addNode, deleteNode, duplicateNode, updateNode, pushHistory } = useMindMap();
  const { selectedNodeId, nodes, theme, rootId } = state;
  const isDark = theme === 'dark';

  if (!selectedNodeId || selectedNodeId === rootId) return null;

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl ${
          isDark
            ? 'glass-dark'
            : 'glass-light'
        }`}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddChild}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isDark
              ? 'hover:bg-white/10 text-gray-300'
              : 'hover:bg-black/5 text-gray-600'
          }`}
          title="افزودن زیرنود"
        >
          <span className="text-base">➕</span>
          <span className="hidden sm:inline">زیرنود</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDuplicate}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isDark
              ? 'hover:bg-white/10 text-gray-300'
              : 'hover:bg-black/5 text-gray-600'
          }`}
          title="تکرار نود"
        >
          <span className="text-base">📋</span>
          <span className="hidden sm:inline">تکرار</span>
        </motion.button>

        <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

        <div className="flex items-center gap-1">
          {quickColors.map(color => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleChangeColor(color)}
              className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg transition-transform"
              style={{ backgroundColor: color }}
              title="تغییر رنگ"
            />
          ))}
        </div>

        <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isDark
              ? 'hover:bg-red-900/30 text-red-400'
              : 'hover:bg-red-50 text-red-500'
          }`}
          title="حذف نود"
        >
          <span className="text-base">🗑️</span>
          <span className="hidden sm:inline">حذف</span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
