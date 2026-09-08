import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindMapProvider, useMindMap } from './MindMapContext';
import MindMapCanvas from './components/MindMapCanvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import SearchBar from './components/SearchBar';
import StatusBar from './components/StatusBar';
import TemplatesPanel from './components/TemplatesPanel';

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
    // Create all nodes at once using dispatch
    const rootId = 'demo-root';
    const planId = 'demo-plan';
    const devId = 'demo-dev';
    const designId = 'demo-design';
    const testId = 'demo-test';
    const deployId = 'demo-deploy';
    const reportId = 'demo-report';
    
    dispatch({
      type: 'BATCH_UPDATE',
      payload: {
        nodes: {
          [rootId]: {
            id: rootId, parentId: null, text: '🧠 مدیریت پروژه',
            color: '#6366f1', shape: 'pill', fontSize: 20, fontWeight: 'bold',
            x: 500, y: 350, width: 240, height: 65, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          [planId]: {
            id: planId, parentId: rootId, text: '📋 برنامه‌ریزی',
            color: '#3b82f6', shape: 'rounded', fontSize: 14,
            x: 780, y: 120, width: 180, height: 50, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          [devId]: {
            id: devId, parentId: rootId, text: '💻 توسعه',
            color: '#22c55e', shape: 'rounded', fontSize: 14,
            x: 780, y: 280, width: 180, height: 50, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          [designId]: {
            id: designId, parentId: rootId, text: '🎨 طراحی',
            color: '#f59e0b', shape: 'rounded', fontSize: 14,
            x: 780, y: 440, width: 180, height: 50, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          [testId]: {
            id: testId, parentId: rootId, text: '🧪 تست',
            color: '#ef4444', shape: 'rounded', fontSize: 14,
            x: 780, y: 600, width: 180, height: 50, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          [deployId]: {
            id: deployId, parentId: rootId, text: '🚀 استقرار',
            color: '#8b5cf6', shape: 'rounded', fontSize: 14,
            x: 200, y: 200, width: 180, height: 50, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          [reportId]: {
            id: reportId, parentId: rootId, text: '📊 گزارش‌دهی',
            color: '#06b6d4', shape: 'rounded', fontSize: 14,
            x: 200, y: 400, width: 180, height: 50, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-p1': {
            id: 'demo-p1', parentId: planId, text: 'تعریف اهداف',
            color: '#60a5fa', shape: 'rounded', fontSize: 13,
            x: 1050, y: 60, width: 150, height: 42, collapsed: false,
            priority: 'high',
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-p2': {
            id: 'demo-p2', parentId: planId, text: 'زمان‌بندی',
            color: '#60a5fa', shape: 'rounded', fontSize: 13,
            x: 1050, y: 130, width: 150, height: 42, collapsed: false,
            progress: 75,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-p3': {
            id: 'demo-p3', parentId: planId, text: 'تخصیص منابع',
            color: '#60a5fa', shape: 'rounded', fontSize: 13,
            x: 1050, y: 200, width: 150, height: 42, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-d1': {
            id: 'demo-d1', parentId: devId, text: 'فرانت‌اند',
            color: '#4ade80', shape: 'rounded', fontSize: 13,
            x: 1050, y: 250, width: 150, height: 42, collapsed: false,
            progress: 50,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-d2': {
            id: 'demo-d2', parentId: devId, text: 'بک‌اند',
            color: '#4ade80', shape: 'rounded', fontSize: 13,
            x: 1050, y: 320, width: 150, height: 42, collapsed: false,
            progress: 30,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-d3': {
            id: 'demo-d3', parentId: devId, text: 'دیتابیس',
            color: '#4ade80', shape: 'rounded', fontSize: 13,
            x: 1050, y: 390, width: 150, height: 42, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-ds1': {
            id: 'demo-ds1', parentId: designId, text: '🎨 UI/UX',
            color: '#fbbf24', shape: 'rounded', fontSize: 13,
            x: 1050, y: 420, width: 150, height: 42, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
          'demo-ds2': {
            id: 'demo-ds2', parentId: designId, text: 'پروتوتایپ',
            color: '#fbbf24', shape: 'rounded', fontSize: 13,
            x: 1050, y: 490, width: 150, height: 42, collapsed: false,
            createdAt: Date.now(), updatedAt: Date.now(),
          },
        },
        connections: [],
      },
    });
    dispatch({ type: 'SET_STATE', payload: { rootId } });
    
    setTimeout(() => {
      autoLayout();
      setShowWelcome(false);
    }, 500);
  };

  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <div className={`w-full h-screen overflow-hidden relative ${state.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
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

      {/* Properties toggle button */}
      {state.selectedNodeId && (
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PROPERTIES' })}
          className={`absolute top-20 left-4 z-30 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm transition-all ${
            state.theme === 'dark'
              ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700/50'
              : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200/50'
          }`}
        >
          ⚙️ ویژگی‌ها
        </button>
      )}

      {/* Keyboard shortcuts hint */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-4 py-2 rounded-xl text-xs backdrop-blur-sm ${
        state.theme === 'dark' ? 'bg-gray-900/70 text-gray-400' : 'bg-white/70 text-gray-500'
      }`}>
        <span>🖱️ درگ: جابجایی</span>
        <span>⚙️ راست‌کلیک: منو</span>
        <span>🔍 اسکرول: زوم</span>
        <span>⌨️ Ctrl+Z: بازگشت</span>
        <span>🗑️ Delete: حذف</span>
      </div>

      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 max-w-md mx-4 shadow-2xl text-center text-white"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🧠
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">MindFlow Pro</h1>
              <p className="text-white/80 mb-6 text-sm leading-relaxed">
                نقشه ذهنی حرفه‌ای با امکانات پیشرفته
                <br />
                برای سازماندهی ایده‌ها و پروژه‌ها
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl mb-1">🎨</div>
                  <div>شکل‌ها و رنگ‌های متنوع</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl mb-1">📐</div>
                  <div>چیدمان‌های هوشمند</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl mb-1">💾</div>
                  <div>ذخیره و بازیابی</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl mb-1">⚡</div>
                  <div>میانبرهای صفحه‌کلید</div>
                </div>
              </div>
              <button
                onClick={handleDismissWelcome}
                className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
              >
                شروع کنید ✨
              </button>
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
