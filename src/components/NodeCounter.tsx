import React from 'react';
import { motion } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function NodeCounter() {
  const { state } = useMindMap();
  const { nodes, theme, zoom } = state;
  const isDark = theme === 'dark';
  const nodeCount = Object.keys(nodes).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className={`absolute bottom-4 left-4 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-xl text-xs ${
        isDark
          ? 'glass-dark text-gray-400'
          : 'glass-light text-gray-500'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">📊</span>
        <span className="font-bold text-sm">{nodeCount}</span>
        <span>نود</span>
      </div>
    </motion.div>
  );
}
