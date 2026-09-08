import React from 'react';
import { motion } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function StatusBar() {
  const { state } = useMindMap();
  const { theme, zoom, layout } = state;
  const isDark = theme === 'dark';

  const layoutLabels: Record<string, string> = {
    'organic': '🌳 ارگانیک',
    'tree-right': '→ درختی راست',
    'tree-left': '← درختی چپ',
    'tree-down': '⬇️ درختی پایین',
    'radial': '🎯 شعاعی',
    'logic': '📊 منطقی',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`absolute bottom-4 right-4 z-20 flex items-center gap-4 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-xl text-xs ${
        isDark
          ? 'glass-dark text-gray-400'
          : 'glass-light text-gray-500'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">🔍</span>
        <span className="font-medium">{Math.round(zoom * 100)}%</span>
      </div>
      <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
      <div className="flex items-center gap-2">
        <span>{layoutLabels[layout] || layout}</span>
      </div>
    </motion.div>
  );
}
