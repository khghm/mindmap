import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindMapProvider, useMindMap } from './MindMapContext';
import MindMapCanvas from './components/MindMapCanvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import SearchBar from './components/SearchBar';
import StatusBar from './components/StatusBar';
import TemplatesPanel from './components/TemplatesPanel';
import QuickActions from './components/QuickActions';
import NodeCounter from './components/NodeCounter';

function MindMapApp() {
  const { state, addNode, updateNode, pushHistory, autoLayout, importJSON, dispatch } = useMindMap();
  const demoCreated = useRef(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Load from localStorage or create demo
  useEffect(() => {
    const saved = localStorage.getItem('mindmap-pro-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && Object.keys(parsed.nodes).length > 0) {
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              ...parsed,
              history: [],
              historyIndex: -1,
              presentationMode: false,
            },
          });
          setShowWelcome(false);
          return;
        }
      } catch (e) {}
    }

    if (!demoCreated.current) {
      demoCreated.current = true;
      createDemoMap();
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(state.nodes).length > 0) {
        const toSave = {
          nodes: state.nodes,
          connections: state.connections,
          rootId: state.rootId,
          theme: state.theme,
          layout: state.layout,
        };
        localStorage.setItem('mindmap-pro-state', JSON.stringify(toSave));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [state.nodes, state.connections, state.rootId, state.theme, state.layout]);

  const createDemoMap = () => {
    // Create root
    const rootId = addNode(null, '🧠 مدیریت پروژه', 500, 350);
    
    setTimeout(() => {
      updateNode(rootId, {
        color: '#6366f1',
        shape: 'pill',
        fontSize: 20,
        fontWeight: 'bold',
        width: 240,
        height: 65,
      });

      // Main branches
      const planId = addNode(rootId, '📋 برنامه‌ریزی', 780, 120);
      const devId = addNode(rootId, '💻 توسعه', 780, 280);
      const designId = addNode(rootId, '🎨 طراحی', 780, 440);
      const testId = addNode(rootId, '🧪 تست', 780, 600);
      const deployId = addNode(rootId, '🚀 استقرار', 200, 200);
      const reportId = addNode(rootId, '📊 گزارش', 200, 400);

      setTimeout(() => {
        updateNode(planId, { color: '#3b82f6', shape: 'rounded', width: 180, height: 50 });
        updateNode(devId, { color: '#22c55e', shape: 'rounded', width: 180, height: 50 });
        updateNode(designId, { color: '#f59e0b', shape: 'rounded', width: 180, height: 50 });
        updateNode(testId, { color: '#ef4444', shape: 'rounded', width: 180, height: 50 });
        updateNode(deployId, { color: '#8b5cf6', shape: 'rounded', width: 180, height: 50 });
        updateNode(reportId, { color: '#06b6d4', shape: 'rounded', width: 180, height: 50 });

        // Sub-nodes
        const p1 = addNode(planId, 'تعریف اهداف', 1050, 60);
        const p2 = addNode(planId, 'زمان‌بندی', 1050, 130);
        const p3 = addNode(planId, 'تخصیص منابع', 1050, 200);

        const d1 = addNode(devId, 'فرانت‌اند', 1050, 250);
        const d2 = addNode(devId, 'بک‌اند', 1050, 320);
        const d3 = addNode(devId, 'دیتابیس', 1050, 390);

        const ds1 = addNode(designId, 'UI/UX', 1050, 420);
        const ds2 = addNode(designId, 'پروتوتایپ', 1050, 490);

        setTimeout(() => {
          updateNode(p1, { color: '#60a5fa', width: 150, height: 42, priority: 'high' });
          updateNode(p2, { color: '#60a5fa', width: 150, height: 42, progress: 75 });
          updateNode(p3, { color: '#60a5fa', width: 150, height: 42 });
          updateNode(d1, { color: '#4ade80', width: 150, height: 42, progress: 50 });
          updateNode(d2, { color: '#4ade80', width: 150, height: 42, progress: 30 });
          updateNode(d3, { color: '#4ade80', width: 150, height: 42 });
          updateNode(ds1, { color: '#fbbf24', width: 150, height: 42, emoji: '🎨' });
          updateNode(ds2, { color: '#fbbf24', width: 150, height: 42 });

          autoLayout();
          setShowWelcome(false);
        }, 300);
      }, 200);
    }, 100);
  };

  const isDark = state.theme === 'dark';

  return (
    <div className={`w-full h-screen overflow-hidden relative ${isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50'}`}>
      {/* Background mesh gradient */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-mesh' : 'bg-gradient-mesh-light'}`} />
      
      {/* Grid pattern */}
      <div className={`absolute inset-0 ${isDark ? 'grid-pattern' : 'grid-pattern-light'}`} />

      {/* Canvas */}
      <MindMapCanvas />

      {/* Toolbar */}
      <Toolbar />

      {/* Search Bar */}
      <SearchBar />

      {/* Status Bar */}
      <StatusBar />

      {/* Templates Panel */}
      <TemplatesPanel />

      {/* Properties Panel */}
      <PropertiesPanel />

      {/* Quick Actions */}
      <QuickActions />

      {/* Node Counter */}
      <NodeCounter />

      {/* Properties toggle button */}
      {state.selectedNodeId && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={() => dispatch({ type: 'TOGGLE_PROPERTIES' })}
          className={`absolute top-20 left-4 z-30 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl transition-all flex items-center gap-2 ${
            isDark
              ? 'glass-dark text-gray-300 hover:bg-white/10'
              : 'glass-light text-gray-600 hover:bg-white/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">ویژگی‌ها</span>
        </motion.button>
      )}

      {/* Keyboard shortcuts hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 px-6 py-3 rounded-2xl text-xs backdrop-blur-xl ${
          isDark ? 'glass-dark text-gray-400' : 'glass-light text-gray-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🖱️</span>
          <span>درگ: جابجایی</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">⚙️</span>
          <span>راست‌کلیک: منو</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">🔍</span>
          <span>اسکرول: زوم</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">⌨️</span>
          <span>Ctrl+Z: بازگشت</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">🗑️</span>
          <span>Delete: حذف</span>
        </div>
      </motion.div>

      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 max-w-md mx-4 shadow-glow text-center text-white overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl mb-6"
                >
                  🧠
                </motion.div>
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  MindFlow Pro
                </h1>
                <p className="text-white/90 mb-8 text-sm leading-relaxed font-light">
                  نقشه ذهنی حرفه‌ای با امکانات پیشرفته
                  <br />
                  برای سازماندهی ایده‌ها و پروژه‌ها
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="font-medium">طراحی زیبا</div>
                    <div className="text-white/60 text-xs mt-1">UI/UX مدرن</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="font-medium">سریع و روان</div>
                    <div className="text-white/60 text-xs mt-1">انیمیشن‌های حرفه‌ای</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-3xl mb-2">📑</div>
                    <div className="font-medium">قالب‌های آماده</div>
                    <div className="text-white/60 text-xs mt-1">شروع سریع</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-3xl mb-2">💾</div>
                    <div className="font-medium">ذخیره خودکار</div>
                    <div className="text-white/60 text-xs mt-1">بدون نگرانی</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-medium text-sm border border-white/30 transition-all"
                >
                  شروع کنید ✨
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <MindMapProvider>
      <MindMapApp />
    </MindMapProvider>
  );
}
