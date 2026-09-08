import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import { MindNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
  const { theme } = state;
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
        nodes['tpl-1'] = createNode('tpl-1', rootId, '💡 ایده‌های نو', 800, 150, '#f59e0b', 'rounded', 170, 48);
        nodes['tpl-2'] = createNode('tpl-2', rootId, '🎨 خلاقیت', 800, 300, '#ec4899', 'rounded', 170, 48);
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🔧 راه‌حل‌ها', 800, 450, '#22c55e', 'rounded', 170, 48);
        nodes['tpl-4'] = createNode('tpl-4', rootId, '⚡ نوآوری', 200, 200, '#3b82f6', 'rounded', 170, 48);
        nodes['tpl-5'] = createNode('tpl-5', rootId, '🌟 الهام', 200, 400, '#8b5cf6', 'rounded', 170, 48);
        break;
      }
      case 'project': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '📋 مدیریت پروژه', 500, 350, '#6366f1', 'pill', 240, 65, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '📝 برنامه‌ریزی', 800, 100, '#3b82f6', 'rounded', 180, 50);
        nodes['tpl-2'] = createNode('tpl-2', rootId, '💻 توسعه', 800, 250, '#22c55e', 'rounded', 180, 50);
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🧪 تست', 800, 400, '#ef4444', 'rounded', 180, 50);
        nodes['tpl-4'] = createNode('tpl-4', rootId, '🚀 استقرار', 200, 200, '#8b5cf6', 'rounded', 180, 50);
        nodes['tpl-5'] = createNode('tpl-5', rootId, '📊 گزارش', 200, 400, '#06b6d4', 'rounded', 180, 50);
        nodes['tpl-1-1'] = createNode('tpl-1-1', 'tpl-1', 'تعریف اهداف', 1050, 60, '#60a5fa', 'rounded', 150, 42, { priority: 'high' });
        nodes['tpl-1-2'] = createNode('tpl-1-2', 'tpl-1', 'زمان‌بندی', 1050, 130, '#60a5fa', 'rounded', 150, 42, { progress: 75 });
        nodes['tpl-1-3'] = createNode('tpl-1-3', 'tpl-1', 'تخصیص منابع', 1050, 200, '#60a5fa', 'rounded', 150, 42);
        nodes['tpl-2-1'] = createNode('tpl-2-1', 'tpl-2', 'فرانت‌اند', 1050, 250, '#4ade80', 'rounded', 150, 42, { progress: 50 });
        nodes['tpl-2-2'] = createNode('tpl-2-2', 'tpl-2', 'بک‌اند', 1050, 320, '#4ade80', 'rounded', 150, 42, { progress: 30 });
        nodes['tpl-2-3'] = createNode('tpl-2-3', 'tpl-2', 'دیتابیس', 1050, 390, '#4ade80', 'rounded', 150, 42);
        break;
      }
      case 'study': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '📚 مطالعه و یادگیری', 500, 350, '#22c55e', 'pill', 250, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '📖 مفاهیم کلیدی', 800, 150, '#3b82f6', 'rounded', 180, 48);
        nodes['tpl-2'] = createNode('tpl-2', rootId, '📝 یادداشت‌ها', 800, 300, '#f59e0b', 'rounded', 180, 48);
        nodes['tpl-3'] = createNode('tpl-3', rootId, '❓ سوالات', 800, 450, '#ef4444', 'rounded', 180, 48);
        nodes['tpl-4'] = createNode('tpl-4', rootId, '🔗 ارتباطات', 200, 200, '#8b5cf6', 'rounded', 180, 48);
        nodes['tpl-5'] = createNode('tpl-5', rootId, '✅ مرور', 200, 400, '#06b6d4', 'rounded', 180, 48);
        break;
      }
      case 'decision': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '⚖️ تصمیم‌گیری', 500, 350, '#f59e0b', 'pill', 220, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '🅰️ گزینه A', 800, 150, '#3b82f6', 'rounded', 170, 48);
        nodes['tpl-2'] = createNode('tpl-2', rootId, '🅱️ گزینه B', 800, 300, '#22c55e', 'rounded', 170, 48);
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🅲 گزینه C', 800, 450, '#ef4444', 'rounded', 170, 48);
        nodes['tpl-4'] = createNode('tpl-4', rootId, '📊 معیارها', 200, 200, '#8b5cf6', 'rounded', 170, 48);
        nodes['tpl-5'] = createNode('tpl-5', rootId, '⚡ نتایج', 200, 400, '#06b6d4', 'rounded', 170, 48);
        break;
      }
      case 'meeting': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '🤝 جلسه', 500, 350, '#ec4899', 'pill', 200, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '📋 دستور جلسه', 800, 150, '#3b82f6', 'rounded', 180, 48);
        nodes['tpl-2'] = createNode('tpl-2', rootId, '💬 بحث‌ها', 800, 300, '#22c55e', 'rounded', 180, 48);
        nodes['tpl-3'] = createNode('tpl-3', rootId, '✅ مصوبات', 800, 450, '#f59e0b', 'rounded', 180, 48);
        nodes['tpl-4'] = createNode('tpl-4', rootId, '📅 اقدامات بعدی', 200, 200, '#8b5cf6', 'rounded', 180, 48);
        nodes['tpl-5'] = createNode('tpl-5', rootId, '👥 شرکت‌کنندگان', 200, 400, '#06b6d4', 'rounded', 180, 48);
        break;
      }
      case 'goals': {
        rootId = 'tpl-root';
        nodes[rootId] = createNode(rootId, null, '🎯 اهداف سالانه', 500, 350, '#ef4444', 'pill', 230, 60, { fontSize: 20, fontWeight: 'bold' });
        nodes['tpl-1'] = createNode('tpl-1', rootId, '🌸 فصل ۱', 800, 150, '#22c55e', 'rounded', 170, 48);
        nodes['tpl-2'] = createNode('tpl-2', rootId, '☀️ فصل ۲', 800, 300, '#f59e0b', 'rounded', 170, 48);
        nodes['tpl-3'] = createNode('tpl-3', rootId, '🍂 فصل ۳', 800, 450, '#ef4444', 'rounded', 170, 48);
        nodes['tpl-4'] = createNode('tpl-4', rootId, '❄️ فصل ۴', 200, 200, '#3b82f6', 'rounded', 170, 48);
        nodes['tpl-5'] = createNode('tpl-5', rootId, '📊 ارزیابی', 200, 400, '#8b5cf6', 'rounded', 170, 48);
        break;
      }
      default:
        return;
    }

    dispatch({
      type: 'BATCH_UPDATE',
      payload: { nodes, connections: [] },
    });
    dispatch({ type: 'SET_STATE', payload: { rootId, selectedNodeId: null } });
    
    setTimeout(() => {
      autoLayout();
    }, 100);
    
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 left-60 z-30 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm transition-all flex items-center gap-2 ${
          isDark
            ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700/50'
            : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200/50'
        }`}
      >
        <span>📑</span>
        <span className="text-xs hidden sm:inline">قالب‌ها</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              dir="rtl"
            >
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  📑 قالب‌های آماده
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  یک قالب انتخاب کنید تا نقشه ذهنی شما شروع شود
                </p>
              </div>
              
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {TEMPLATES.map(template => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyTemplate(template.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-right ${
                      isDark
                        ? 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <div className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {template.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {template.description}
                    </div>
                    <div
                      className="w-full h-1 rounded-full mt-3"
                      style={{ backgroundColor: template.color }}
                    />
                  </motion.button>
                ))}
              </div>
              
              <div className={`px-6 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
