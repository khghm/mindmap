import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import { MindNode } from '../types';

export default function PropertiesPanel() {
  const { state, dispatch, updateNode, pushHistory } = useMindMap();
  const { selectedNodeId, nodes, theme, showProperties } = state;
  const isDark = theme === 'dark';

  if (!selectedNodeId || !showProperties) return null;

  const node = nodes[selectedNodeId];
  if (!node) return null;

  const colors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
    '#84cc16', '#a855f7', '#eab308', '#0ea5e9', '#d946ef',
  ];

  const shapes: { value: MindNode['shape']; label: string; icon: string }[] = [
    { value: 'rounded', label: 'گرد', icon: '▢' },
    { value: 'pill', label: 'کپسول', icon: '⬭' },
    { value: 'rectangle', label: 'مستطیل', icon: '▭' },
    { value: 'diamond', label: 'لوزی', icon: '◇' },
    { value: 'hexagon', label: 'شش‌ضلعی', icon: '⬡' },
    { value: 'cloud', label: 'ابر', icon: '☁' },
  ];

  const priorities: { value: MindNode['priority']; label: string; color: string }[] = [
    { value: 'low', label: 'کم', color: '#22c55e' },
    { value: 'medium', label: 'متوسط', color: '#f59e0b' },
    { value: 'high', label: 'بالا', color: '#ef4444' },
    { value: 'critical', label: 'بحرانی', color: '#dc2626' },
  ];

  const handleUpdate = (updates: Partial<MindNode>) => {
    pushHistory('ویرایش ویژگی‌ها');
    updateNode(selectedNodeId, updates);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-20 right-4 z-40 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl shadow-2xl backdrop-blur-xl ${
          isDark
            ? 'bg-slate-900/95 border border-white/10'
            : 'bg-white/95 border border-gray-200/50'
        }`}
        dir="rtl"
      >
        <div className={`sticky top-0 px-6 py-4 border-b backdrop-blur-xl ${
          isDark ? 'border-white/10 bg-slate-900/80' : 'border-gray-200/50 bg-white/80'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              ✨ ویژگی‌های نود
            </h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_PROPERTIES' })}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              ✕
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Text */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              📝 متن نود
            </label>
            <input
              type="text"
              value={node.text}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-all outline-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-500/50'
              }`}
              dir="rtl"
            />
          </div>

          {/* Colors */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              🎨 رنگ
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map(color => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleUpdate({ color })}
                  className={`w-full aspect-square rounded-xl transition-all ${
                    node.color === color ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                  } ${isDark ? 'ring-offset-slate-900' : 'ring-offset-white'}`}
                  style={{
                    background: color,
                    boxShadow: node.color === color ? `0 0 20px ${color}66` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Shapes */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              🔷 شکل
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shapes.map(shape => (
                <motion.button
                  key={shape.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUpdate({ shape: shape.value })}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                    node.shape === shape.value
                      ? isDark
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                        : 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : isDark
                      ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{shape.icon}</span>
                  <span className="text-xs font-medium">{shape.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              🔤 اندازه فونت: {node.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="32"
              value={node.fontSize}
              onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${node.color} 0%, ${node.color} ${((node.fontSize - 10) / 22) * 100}%, ${isDark ? '#374151' : '#e5e7eb'} ${((node.fontSize - 10) / 22) * 100}%, ${isDark ? '#374151' : '#e5e7eb'} 100%)`,
              }}
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              💪 وزن فونت
            </label>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpdate({ fontWeight: 'normal' })}
                className={`px-4 py-3 rounded-2xl border-2 transition-all ${
                  node.fontWeight === 'normal'
                    ? isDark
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                      : 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : isDark
                    ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-normal">معمولی</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpdate({ fontWeight: 'bold' })}
                className={`px-4 py-3 rounded-2xl border-2 transition-all ${
                  node.fontWeight === 'bold'
                    ? isDark
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                      : 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : isDark
                    ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-bold">ضخیم</span>
              </motion.button>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              🎯 اولویت
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map(priority => (
                <motion.button
                  key={priority.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUpdate({ priority: priority.value })}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                    node.priority === priority.value
                      ? 'border-current'
                      : isDark
                      ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    borderColor: node.priority === priority.value ? priority.color : undefined,
                    backgroundColor: node.priority === priority.value ? `${priority.color}20` : undefined,
                    color: node.priority === priority.value ? priority.color : undefined,
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priority.color }} />
                  <span className="text-sm font-medium">{priority.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              📊 پیشرفت: {node.progress ?? 0}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={node.progress ?? 0}
              onChange={(e) => handleUpdate({ progress: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${node.color} 0%, ${node.color} ${node.progress ?? 0}%, ${isDark ? '#374151' : '#e5e7eb'} ${node.progress ?? 0}%, ${isDark ? '#374151' : '#e5e7eb'} 100%)`,
              }}
            />
          </div>

          {/* Note */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              📌 یادداشت
            </label>
            <textarea
              value={node.note || ''}
              onChange={(e) => handleUpdate({ note: e.target.value })}
              placeholder="یادداشت خود را اینجا بنویسید..."
              rows={3}
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-all outline-none resize-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50 placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-500/50 placeholder-gray-400'
              }`}
              dir="rtl"
            />
          </div>

          {/* Link */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              🔗 لینک
            </label>
            <input
              type="url"
              value={node.link || ''}
              onChange={(e) => handleUpdate({ link: e.target.value })}
              placeholder="https://example.com"
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-all outline-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50 placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-500/50 placeholder-gray-400'
              }`}
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
