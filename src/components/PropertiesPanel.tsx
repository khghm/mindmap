import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function PropertiesPanel() {
  const { state, updateNode, selectNode } = useMindMap();
  const isDark = state.theme === 'dark';
  const selectedNode = state.selectedNodeId ? state.nodes[state.selectedNodeId] : null;

  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#1d4ed8', '#7c3aed', '#c026d3',
  ];

  const shapes: Array<{ key: 'rounded' | 'rectangle' | 'ellipse' | 'diamond'; label: string; icon: string }> = [
    { key: 'rounded', label: 'گرد', icon: '⬜' },
    { key: 'rectangle', label: 'مستطیل', icon: '▬' },
    { key: 'ellipse', label: 'بیضی', icon: '⬭' },
    { key: 'diamond', label: 'لوزی', icon: '◆' },
  ];

  if (!selectedNode) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`absolute top-20 right-4 z-40 w-72 rounded-2xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-gray-800/95 border-gray-700 backdrop-blur-md' : 'bg-white/95 border-gray-200 backdrop-blur-md'
        }`}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <i className="fas fa-sliders-h ml-2 text-indigo-500"></i>
            ویژگی‌ها
          </h3>
          <button
            onClick={() => selectNode(null)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Text */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              متن نود
            </label>
            <input
              type="text"
              value={selectedNode.text}
              onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
              dir="rtl"
            />
          </div>

          {/* Font Size */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              اندازه فونت: {selectedNode.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="32"
              value={selectedNode.fontSize}
              onChange={(e) => updateNode(selectedNode.id, { fontSize: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Color */}
          <div>
            <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              رنگ
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-9 h-9 rounded-lg transition-transform hover:scale-110 ${
                    selectedNode.color === color ? 'ring-2 ring-offset-2 scale-110' : ''
                  } ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                  style={{ background: color }}
                  onClick={() => updateNode(selectedNode.id, { color })}
                />
              ))}
            </div>
          </div>

          {/* Shape */}
          <div>
            <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              شکل
            </label>
            <div className="grid grid-cols-4 gap-2">
              {shapes.map(shape => (
                <button
                  key={shape.key}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedNode.shape === shape.key
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => updateNode(selectedNode.id, { shape: shape.key })}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              یادداشت
            </label>
            <textarea
              value={selectedNode.note || ''}
              onChange={(e) => updateNode(selectedNode.id, { note: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg text-sm border resize-none h-20 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
              placeholder="یادداشت خود را بنویسید..."
              dir="rtl"
            />
          </div>

          {/* Info */}
          <div className={`pt-3 border-t space-y-1 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <i className="fas fa-hashtag ml-1"></i>
              فرزند: {selectedNode.children.length}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <i className="fas fa-link ml-1"></i>
              والد: {selectedNode.parentId ? 'دارد' : 'ریشه'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <i className="fas fa-ruler-combined ml-1"></i>
              موقعیت: ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
