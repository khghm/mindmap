import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

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
  const { state, dispatch, addNode, updateNode, autoLayout, pushHistory } = useMindMap();
  const { theme } = state;
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const applyTemplate = (templateId: string) => {
    pushHistory('اعمال قالب');
    
    // Clear existing nodes using BATCH_UPDATE
    dispatch({
      type: 'BATCH_UPDATE',
      payload: { nodes: {}, connections: [] },
    });
    dispatch({ type: 'SET_STATE', payload: { rootId: null, selectedNodeId: null } });

    setTimeout(() => {
      switch (templateId) {
        case 'brainstorm':
          createBrainstormTemplate();
          break;
        case 'project':
          createProjectTemplate();
          break;
        case 'study':
          createStudyTemplate();
          break;
        case 'decision':
          createDecisionTemplate();
          break;
        case 'meeting':
          createMeetingTemplate();
          break;
        case 'goals':
          createGoalsTemplate();
          break;
      }
      setIsOpen(false);
    }, 200);
  };

  const createBrainstormTemplate = () => {
    const root = addNode(null, '🧠 طوفان فکری', 500, 350);
    updateNode(root, { color: '#6366f1', shape: 'pill', fontSize: 20, fontWeight: 'bold', width: 220, height: 60 });
    
    setTimeout(() => {
      const branches = [
        { text: '💡 ایده‌های نو', color: '#f59e0b', x: 800, y: 150 },
        { text: '🎨 خلاقیت', color: '#ec4899', x: 800, y: 300 },
        { text: '🔧 راه‌حل‌ها', color: '#22c55e', x: 800, y: 450 },
        { text: '⚡ نوآوری', color: '#3b82f6', x: 200, y: 200 },
        { text: '🌟 الهام', color: '#8b5cf6', x: 200, y: 400 },
      ];
      
      branches.forEach(b => {
        const id = addNode(root, b.text, b.x, b.y);
        updateNode(id, { color: b.color, shape: 'rounded', width: 170, height: 48 });
      });
      
      setTimeout(() => autoLayout(), 200);
    }, 100);
  };

  const createProjectTemplate = () => {
    const root = addNode(null, '📋 مدیریت پروژه', 500, 350);
    updateNode(root, { color: '#6366f1', shape: 'pill', fontSize: 20, fontWeight: 'bold', width: 240, height: 65 });
    
    setTimeout(() => {
      const phases = [
        { text: '📝 برنامه‌ریزی', color: '#3b82f6', x: 800, y: 100 },
        { text: '💻 توسعه', color: '#22c55e', x: 800, y: 250 },
        { text: '🧪 تست', color: '#ef4444', x: 800, y: 400 },
        { text: '🚀 استقرار', color: '#8b5cf6', x: 200, y: 200 },
        { text: '📊 گزارش', color: '#06b6d4', x: 200, y: 400 },
      ];
      
      phases.forEach(p => {
        const id = addNode(root, p.text, p.x, p.y);
        updateNode(id, { color: p.color, shape: 'rounded', width: 180, height: 50 });
      });
      
      setTimeout(() => autoLayout(), 200);
    }, 100);
  };

  const createStudyTemplate = () => {
    const root = addNode(null, '📚 مطالعه و یادگیری', 500, 350);
    updateNode(root, { color: '#22c55e', shape: 'pill', fontSize: 20, fontWeight: 'bold', width: 250, height: 60 });
    
    setTimeout(() => {
      const topics = [
        { text: '📖 مفاهیم کلیدی', color: '#3b82f6', x: 800, y: 150 },
        { text: '📝 یادداشت‌ها', color: '#f59e0b', x: 800, y: 300 },
        { text: '❓ سوالات', color: '#ef4444', x: 800, y: 450 },
        { text: '🔗 ارتباطات', color: '#8b5cf6', x: 200, y: 200 },
        { text: '✅ مرور', color: '#06b6d4', x: 200, y: 400 },
      ];
      
      topics.forEach(t => {
        const id = addNode(root, t.text, t.x, t.y);
        updateNode(id, { color: t.color, shape: 'rounded', width: 180, height: 48 });
      });
      
      setTimeout(() => autoLayout(), 200);
    }, 100);
  };

  const createDecisionTemplate = () => {
    const root = addNode(null, '⚖️ تصمیم‌گیری', 500, 350);
    updateNode(root, { color: '#f59e0b', shape: 'pill', fontSize: 20, fontWeight: 'bold', width: 220, height: 60 });
    
    setTimeout(() => {
      const options = [
        { text: '🅰️ گزینه A', color: '#3b82f6', x: 800, y: 150 },
        { text: '🅱️ گزینه B', color: '#22c55e', x: 800, y: 300 },
        { text: '🅲 گزینه C', color: '#ef4444', x: 800, y: 450 },
        { text: '📊 معیارها', color: '#8b5cf6', x: 200, y: 200 },
        { text: '⚡ نتایج', color: '#06b6d4', x: 200, y: 400 },
      ];
      
      options.forEach(o => {
        const id = addNode(root, o.text, o.x, o.y);
        updateNode(id, { color: o.color, shape: 'rounded', width: 170, height: 48 });
      });
      
      setTimeout(() => autoLayout(), 200);
    }, 100);
  };

  const createMeetingTemplate = () => {
    const root = addNode(null, '🤝 جلسه', 500, 350);
    updateNode(root, { color: '#ec4899', shape: 'pill', fontSize: 20, fontWeight: 'bold', width: 200, height: 60 });
    
    setTimeout(() => {
      const items = [
        { text: '📋 دستور جلسه', color: '#3b82f6', x: 800, y: 150 },
        { text: '💬 بحث‌ها', color: '#22c55e', x: 800, y: 300 },
        { text: '✅ مصوبات', color: '#f59e0b', x: 800, y: 450 },
        { text: '📅 اقدامات بعدی', color: '#8b5cf6', x: 200, y: 200 },
        { text: '👥 شرکت‌کنندگان', color: '#06b6d4', x: 200, y: 400 },
      ];
      
      items.forEach(item => {
        const id = addNode(root, item.text, item.x, item.y);
        updateNode(id, { color: item.color, shape: 'rounded', width: 180, height: 48 });
      });
      
      setTimeout(() => autoLayout(), 200);
    }, 100);
  };

  const createGoalsTemplate = () => {
    const root = addNode(null, '🎯 اهداف سالانه', 500, 350);
    updateNode(root, { color: '#ef4444', shape: 'pill', fontSize: 20, fontWeight: 'bold', width: 230, height: 60 });
    
    setTimeout(() => {
      const quarters = [
        { text: '🌸 فصل ۱', color: '#22c55e', x: 800, y: 150 },
        { text: '☀️ فصل ۲', color: '#f59e0b', x: 800, y: 300 },
        { text: '🍂 فصل ۳', color: '#ef4444', x: 800, y: 450 },
        { text: '❄️ فصل ۴', color: '#3b82f6', x: 200, y: 200 },
        { text: '📊 ارزیابی', color: '#8b5cf6', x: 200, y: 400 },
      ];
      
      quarters.forEach(q => {
        const id = addNode(root, q.text, q.x, q.y);
        updateNode(id, { color: q.color, shape: 'rounded', width: 170, height: 48 });
      });
      
      setTimeout(() => autoLayout(), 200);
    }, 100);
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
