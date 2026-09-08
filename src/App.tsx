import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MindMapProvider, useMindMap } from './MindMapContext';
import MindMapCanvas from './components/MindMapCanvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import SplashScreen from './components/SplashScreen';

function MindMapApp() {
  const { state, addNode, updateNode, loadFromStorage, deleteNode } = useMindMap();
  const demoCreated = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('mindmap-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && Object.keys(parsed.nodes).length > 0) {
          loadFromStorage();
          return;
        }
      } catch (e) {}
    }
    
    if (!demoCreated.current && Object.keys(state.nodes).length === 0) {
      demoCreated.current = true;
      createDemoMap();
    }
  }, []);

  const createDemoMap = () => {
    // Root
    addNode(null, '🧠 مدیریت پروژه', 450, 350);
  };

  // Build demo sub-branches when nodes are added
  const nodesCount = Object.keys(state.nodes).length;
  const hasBuiltDemo = useRef(false);

  useEffect(() => {
    if (hasBuiltDemo.current) return;
    
    const nodes = Object.values(state.nodes);
    if (nodes.length === 1 && state.rootId) {
      const root = nodes[0];
      updateNode(root.id, { 
        text: '🧠 مدیریت پروژه', 
        color: '#6366f1', 
        fontSize: 20,
        width: 220,
        height: 60,
      });

      setTimeout(() => {
        addNode(root.id, '📋 برنامه‌ریزی', 750, 150);
        addNode(root.id, '💻 توسعه', 750, 300);
        addNode(root.id, '🎨 طراحی', 750, 450);
        addNode(root.id, '🧪 تست', 750, 600);
        addNode(root.id, '🚀 استقرار', 150, 200);
        addNode(root.id, '📊 گزارش‌دهی', 150, 400);
        
        setTimeout(() => {
          const allNodes = Object.values(state.nodes);
          const planning = allNodes.find(n => n.text.includes('برنامه‌ریزی'));
          const dev = allNodes.find(n => n.text.includes('توسعه'));
          const design = allNodes.find(n => n.text.includes('طراحی'));
          
          if (planning) {
            updateNode(planning.id, { color: '#3b82f6' });
            addNode(planning.id, 'تعریف اهداف', 1050, 80);
            addNode(planning.id, 'زمان‌بندی', 1050, 160);
            addNode(planning.id, 'تخصیص منابع', 1050, 240);
          }
          if (dev) {
            updateNode(dev.id, { color: '#22c55e' });
            addNode(dev.id, 'فرانت‌اند', 1050, 300);
            addNode(dev.id, 'بک‌اند', 1050, 380);
            addNode(dev.id, 'دیتابیس', 1050, 460);
          }
          if (design) {
            updateNode(design.id, { color: '#ec4899' });
            addNode(design.id, 'UI/UX', 1050, 520);
            addNode(design.id, 'پروتوتایپ', 1050, 600);
          }
          
          hasBuiltDemo.current = true;
        }, 300);
      }, 200);
    }
  }, [nodesCount]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === 'Tab' && state.selectedNodeId) {
      e.preventDefault();
      addNode(state.selectedNodeId, 'زیرموضوع');
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedNodeId && state.selectedNodeId !== state.rootId) {
      e.preventDefault();
      deleteNode(state.selectedNodeId);
    }
  }, [state.selectedNodeId, state.rootId, addNode, deleteNode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isDark = state.theme === 'dark';

  return (
    <div className={`w-full h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <MindMapCanvas />
      <Toolbar />
      <PropertiesPanel />
      
      {/* Welcome overlay for empty state */}
      {Object.keys(state.nodes).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="text-center pointer-events-auto">
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <i className="fas fa-brain text-white text-4xl"></i>
            </motion.div>
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              به MindFlow Pro خوش آمدید
            </h2>
            <p className={`text-sm mb-8 max-w-md mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              نقشه‌های ذهنی حرفه‌ای بسازید، ایده‌هایتان را سازماندهی کنید و خلاقیت خود را آزاد کنید
            </p>
            <button
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => addNode(null, '🧠 ایده اصلی', 400, 350)}
            >
              <i className="fas fa-plus ml-2"></i>
              ایجاد نقشه ذهنی جدید
            </button>
            <div className={`mt-8 flex flex-wrap justify-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span className="flex items-center gap-1.5">
                <kbd className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>Tab</kbd>
                افزودن زیرموضوع
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>DblClick</kbd>
                ویرایش
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>Right Click</kbd>
                منوی زمینه
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>Scroll</kbd>
                بزرگنمایی
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <MindMapProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <MindMapApp />
    </MindMapProvider>
  );
}
