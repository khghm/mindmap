import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import { MindNode } from '../types';

interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const TEMPLATES: Template[] = [
  { id: 'brainstorm', name: 'طوفان فکری', icon: '🧠', description: 'برای ایده‌پردازی و خلاقیت', color: '#6366f1' },
  { id: 'project', name: 'مدیریت پروژه', icon: '📋', description: 'برنامه‌ریزی و سازماندهی', color: '#3b82f6' },
  { id: 'study', name: 'مطالعه و یادگیری', icon: '📚', description: 'خلاصه‌نویسی و مرور', color: '#22c55e' },
  { id: 'decision', name: 'تصمیم‌گیری', icon: '⚖️', description: 'مقایسه گزینه‌ها', color: '#f59e0b' },
  { id: 'meeting', name: 'جلسه', icon: '🤝', description: 'سازماندهی نکات جلسه', color: '#ec4899' },
  { id: 'goals', name: 'اهداف سالانه', icon: '🎯', description: 'برنامه‌ریزی اهداف', color: '#ef4444' },
];

export default function TemplatesPanel() {
  const { state, dispatch, pushHistory, autoLayout } = useMindMap();
  const { theme, layout, connectionStyle, showGrid, gridSize, showMiniMap, showProperties, searchQuery, clipboard } = state;
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const createNode = (id: string, parentId: string | null, text: string, x: number, y: number, color: string, shape: MindNode['shape'] = 'rounded', width = 160, height = 48, extra: Partial<MindNode> = {}): MindNode => {
    return {
      id,
      parentId,
      text,
      color,
      shape,
      fontSize: 14,
      x,
      y,
      width,
      height,
      collapsed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...extra,
    };
  };

  const applyTemplate = (templateId: string) => {
    pushHistory('اعمال قالب');
    
    let nodes: Record<string, MindNode> = {};
    let rootId: string;

    switch (templateId) {
      case 'brainstorm': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '🧠 طوفان فکری', 500, 350, '#6366f1', 'pill', 220, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '💡 ایده‌های نو', 800, 150, '#f59e0b');
        nodes['tpl-2'] = createNode('tpl-2', rootId, '🎨 خلاقیت', 800, 300, '#ec4899');
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🔧 راه‌حل‌ها', 800, 450, '#22c55e');
        nodes['tpl-4'] = createNode('tpl-4', rootId, '⚡ نوآوری', 200, 200, '#3b82f6');
        nodes['tpl-5'] = createNode('tpl-5', rootId, '🌟 الهام', 200, 400, '#8b5cf6');
        break;
      }
      case 'project': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '📋 مدیریت پروژه', 500, 350, '#6366f1', 'pill', 240, 65, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '📝 برنامه‌ریزی', 800, 100, '#3b82f6');
        nodes['tpl-2'] = createNode('tpl-2', rootId, '💻 توسعه', 800, 250, '#22c55e');
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🧪 تست', 800, 400, '#ef4444');
        nodes['tpl-4'] = createNode('tpl-4', rootId, '🚀 استقرار', 200, 200, '#8b5cf6');
        nodes['tpl-5'] = createNode('tpl-5', rootId, '📊 گزارش', 200, 400, '#06b6d4');
        nodes['tpl-1-1'] = createNode('tpl-1-1', 'tpl-1', 'تعریف اهداف', 1050, 60, '#60a5fa', 'rounded', 150, 42, { priority: 'high' });
        nodes['tpl-1-2'] = createNode('tpl-1-2', 'tpl-1', 'زمان‌بندی', 1050, 130, '#60a5fa', 'rounded', 150, 42, { progress: 75 });
        nodes['tpl-1-3'] = createNode('tpl-1-3', 'tpl-1', 'تخصیص منابع', 1050, 200, '#60a5fa');
        nodes['tpl-2-1'] = createNode('tpl-2-1', 'tpl-2', 'فرانت‌اند', 1050, 250, '#4ade80', 'rounded', 150, 42, { progress: 50 });
        nodes['tpl-2-2'] = createNode('tpl-2-2', 'tpl-2', 'بک‌اند', 1050, 320, '#4ade80', 'rounded', 150, 42, { progress: 30 });
        nodes['tpl-2-3'] = createNode('tpl-2-3', 'tpl-2', 'دیتابیس', 1050, 390, '#4ade80');
        break;
      }
      case 'study': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '📚 مطالعه و یادگیری', 500, 350, '#22c55e', 'pill', 250, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '📖 مفاهیم کلیدی', 800, 150, '#3b82f6');
        nodes['tpl-2'] = createNode('tpl-2', rootId, '📝 یادداشت‌ها', 800, 300, '#f59e0b');
        nodes['tpl-3'] = createNode('tpl-3', rootId, '❓ سوالات', 800, 450, '#ef4444');
        nodes['tpl-4'] = createNode('tpl-4', rootId, '🔗 ارتباطات', 200, 200, '#8b5cf6');
        nodes['tpl-5'] = createNode('tpl-5', rootId, '✅ مرور', 200, 400, '#06b6d4');
        break;
      }
      case 'decision': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '⚖️ تصمیم‌گیری', 500, 350, '#f59e0b', 'pill', 220, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '🅰️ گزینه A', 800, 150, '#3b82f6');
        nodes['tpl-2'] = createNode('tpl-2', rootId, '🅱️ گزینه B', 800, 300, '#22c55e');
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🅲 گزینه C', 800, 450, '#ef4444');
        nodes['tpl-4'] = createNode('tpl-4', rootId, '📊 معیارها', 200, 200, '#8b5cf6');
        nodes['tpl-5'] = createNode('tpl-5', rootId, '⚡ نتایج', 200, 400, '#06b6d4');
        break;
      }
      case 'meeting': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '🤝 جلسه', 500, 350, '#ec4899', 'pill', 200, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '📋 دستور جلسه', 800, 150, '#3b82f6');
        nodes['tpl-2'] = createNode('tpl-2', rootId, '💬 بحث‌ها', 800, 300, '#22c55e');
        nodes['tpl-3'] = createNode('tpl-3', rootId, '✅ مصوبات', 800, 450, '#f59e0b');
        nodes['tpl-4'] = createNode('tpl-4', rootId, '📅 اقدامات بعدی', 200, 200, '#8b5cf6');
        nodes['tpl-5'] = createNode('tpl-5', rootId, '👥 شرکت‌کنندگان', 200, 400, '#06b6d4');
        break;
      }
      case 'goals': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '🎯 اهداف سالانه', 500, 350, '#ef4444', 'pill', 230, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '🌸 فصل ۱', 800, 150, '#22c55e');
        nodes['tpl-2'] = createNode('tpl-2', rootId, '☀️ فصل ۲', 800, 300, '#f59e0b');
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🍂 فصل ۳', 800, 450, '#ef4444');
        nodes['tpl-4'] = createNode('tpl-4', rootId, '❄️ فصل ۴', 200, 200, '#3b82f6');
        nodes['tpl-5'] = createNode('tpl-5', rootId, '📊 ارزیابی', 200, 400, '#8b5cf6');
        break;
      }
      default:
        return;
    }

    // Set flag to prevent loading from localStorage on next render
    sessionStorage.setItem('template-just-applied', 'true');
    
    // Apply template with all necessary state updates
    const newState = {
      nodes,
      connections: [],
      rootId,
      selectedNodeId: null,
      multiSelectedIds: [],
      zoom: 1,
      panX: 0,
      panY: 0,
      theme,
      layout,
      connectionStyle,
      showGrid,
      gridSize,
      showMiniMap,
      showProperties,
      searchQuery,
      clipboard,
      history: [],
      historyIndex: -1,
      presentationMode: false,
      presentationIndex: 0,
    };
    
    dispatch({
      type: 'LOAD_STATE',
      payload: newState,
    });
    
    // Save new state to localStorage immediately
    const toSave = {
      nodes: newState.nodes,
      connections: newState.connections,
      rootId: newState.rootId,
      theme: newState.theme,
      layout: newState.layout,
    };
    localStorage.setItem('mindmap-pro-state', JSON.stringify(toSave));
    
    setTimeout(() => {
      autoLayout();
    }, 100);
    
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 left-60 z-30 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl transition-all flex items-center gap-2 ${
          isDark
            ? 'glass-dark text-gray-300 hover:bg-white/10'
            : 'glass-light text-gray-600 hover:bg-white/80'
        }`}
      >
        <span className="text-base">📑</span>
        <span className="text-sm font-medium hidden sm:inline">قالب‌ها</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-slate-900/95 backdrop-blur-xl border border-white/10' : 'bg-white/95 backdrop-blur-xl border border-gray-200/50'
              }`}
              dir="rtl"
            >
              <div className={`px-8 py-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  📑 قالب‌های آماده
                </h2>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  یک قالب انتخاب کنید تا نقشه ذهنی شما شروع شود
                </p>
              </div>
              
              <div className="p-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {TEMPLATES.map(template => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyTemplate(template.id)}
                    className={`p-6 rounded-3xl border-2 transition-all text-right group ${
                      isDark
                        ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <motion.div
                      className="text-4xl mb-3"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {template.icon}
                    </motion.div>
                    <div className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {template.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {template.description}
                    </div>
                    <motion.div
                      className="w-full h-1.5 rounded-full mt-4"
                      style={{ backgroundColor: template.color }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                ))}
              </div>
              
              <div className={`px-8 py-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  className={`w-full py-3 rounded-2xl text-sm font-medium transition-colors ${
                    isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  انصراف
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
