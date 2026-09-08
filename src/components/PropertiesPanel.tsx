import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import { MindNode } from '../types';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
];

const SHAPES: { id: MindNode['shape']; label: string; icon: string }[] = [
  { id: 'pill', label: 'کپسول', icon: '💊' },
  { id: 'rounded', label: 'گرد', icon: '⬜' },
  { id: 'rectangle', label: 'مستطیل', icon: '▬' },
  { id: 'diamond', label: 'لوزی', icon: '◆' },
  { id: 'hexagon', label: 'شش‌ضلعی', icon: '⬡' },
  { id: 'cloud', label: 'ابر', icon: '☁️' },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32];

export default function PropertiesPanel() {
  const { state, dispatch, updateNode, pushHistory } = useMindMap();
  const { selectedNodeId, nodes, theme, showProperties } = state;
  const isDark = theme === 'dark';
  const node = selectedNodeId ? nodes[selectedNodeId] : null;

  if (!node) return null;

  return (
    <AnimatePresence>
      {showProperties && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`absolute top-20 right-4 z-30 w-72 rounded-2xl shadow-2xl overflow-hidden border ${
            isDark ? 'bg-gray-900/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
          } backdrop-blur-xl`}
          dir="rtl"
        >
          {/* Header */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ✨ ویژگی‌های نود
              </h3>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PROPERTIES' })}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Text */}
            <Section title="متن" isDark={isDark}>
              <input
                type="text"
                value={node.text}
                onChange={(e) => updateNode(node.id, { text: e.target.value })}
                onBlur={() => pushHistory('ویرایش متن')}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                dir="rtl"
              />
            </Section>

            {/* Emoji */}
            <Section title="ایموجی" isDark={isDark}>
              <div className="flex flex-wrap gap-1">
                {['💡', '🎯', '📌', '⭐', '🔥', '💎', '🚀', '🎨', '📊', '🔧', '✅', '❌', '⚡', '🌟', '🧠', '💪'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => updateNode(node.id, { emoji: node.emoji === emoji ? undefined : emoji })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                      node.emoji === emoji
                        ? 'bg-indigo-500/20 ring-2 ring-indigo-500 scale-110'
                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </Section>

            {/* Color */}
            <Section title="رنگ" isDark={isDark}>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => { updateNode(node.id, { color }); pushHistory('تغییر رنگ'); }}
                    className={`w-9 h-9 rounded-lg transition-all ${
                      node.color === color ? 'ring-2 ring-white ring-offset-2 scale-110' : 'hover:scale-105'
                    } ${isDark ? 'ring-offset-gray-900' : 'ring-offset-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Section>

            {/* Shape */}
            <Section title="شکل" isDark={isDark}>
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => { updateNode(node.id, { shape: shape.id }); pushHistory('تغییر شکل'); }}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs transition-all ${
                      node.shape === shape.id
                        ? isDark ? 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{shape.icon}</span>
                    <span>{shape.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Font Size */}
            <Section title="اندازه فونت" isDark={isDark}>
              <div className="flex flex-wrap gap-1">
                {FONT_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => updateNode(node.id, { fontSize: size })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                      node.fontSize === size
                        ? 'bg-indigo-500 text-white'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </Section>

            {/* Priority */}
            <Section title="اولویت" isDark={isDark}>
              <div className="flex gap-2">
                {[
                  { id: 'low' as const, label: 'کم', color: '#22c55e' },
                  { id: 'medium' as const, label: 'متوسط', color: '#f59e0b' },
                  { id: 'high' as const, label: 'بالا', color: '#ef4444' },
                  { id: 'critical' as const, label: 'بحرانی', color: '#dc2626' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => updateNode(node.id, { priority: node.priority === p.id ? undefined : p.id })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      node.priority === p.id
                        ? 'text-white shadow-lg scale-105'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                    style={node.priority === p.id ? { backgroundColor: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Progress */}
            <Section title="پیشرفت" isDark={isDark}>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={node.progress || 0}
                  onChange={(e) => updateNode(node.id, { progress: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6366f1 ${node.progress || 0}%, ${isDark ? '#374151' : '#e5e7eb'} ${node.progress || 0}%)`,
                  }}
                />
                <div className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {node.progress || 0}%
                </div>
              </div>
            </Section>

            {/* Note */}
            <Section title="یادداشت" isDark={isDark}>
              <textarea
                value={node.note || ''}
                onChange={(e) => updateNode(node.id, { note: e.target.value })}
                onBlur={() => pushHistory('ویرایش یادداشت')}
                placeholder="یادداشت خود را بنویسید..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg text-sm border resize-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                dir="rtl"
              />
            </Section>

            {/* Size */}
            <Section title="اندازه" isDark={isDark}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>عرض</label>
                  <input
                    type="number"
                    value={node.width}
                    onChange={(e) => updateNode(node.id, { width: parseInt(e.target.value) || 100 })}
                    className={`w-full px-2 py-1.5 rounded-lg text-sm border ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    } outline-none`}
                  />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ارتفاع</label>
                  <input
                    type="number"
                    value={node.height}
                    onChange={(e) => updateNode(node.id, { height: parseInt(e.target.value) || 40 })}
                    className={`w-full px-2 py-1.5 rounded-lg text-sm border ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    } outline-none`}
                  />
                </div>
              </div>
            </Section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </label>
      {children}
    </div>
  );
}
