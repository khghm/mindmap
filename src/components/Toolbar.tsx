import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function Toolbar() {
  const {
    state,
    dispatch,
    addNode,
    deleteNode,
    undo,
    redo,
    autoLayout,
    toggleTheme,
    exportJSON,
    importJSON,
    pushHistory,
  } = useMindMap();

  const { theme, layout, showGrid, showMiniMap, historyIndex, history } = state;
  const isDark = theme === 'dark';
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(null);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importJSON(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setShowMenu(null);
  };

  const handleAddRootNode = () => {
    pushHistory('افزودن نود ریشه');
    addNode(null, 'نود جدید', window.innerWidth / 2, window.innerHeight / 2);
  };

  interface MenuItem {
    icon: string;
    label: string;
    action: () => void;
    disabled?: boolean;
    active?: boolean;
  }

  const menuItems: { id: string; icon: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'file',
      icon: '📁',
      label: 'فایل',
      items: [
        { icon: '📄', label: 'نقشه جدید', action: handleAddRootNode },
        { icon: '📥', label: 'وارد کردن', action: handleImport },
        { icon: '📤', label: 'خروجی JSON', action: handleExport },
      ],
    },
    {
      id: 'edit',
      icon: '✏️',
      label: 'ویرایش',
      items: [
        { icon: '↩️', label: 'بازگشت (Ctrl+Z)', action: undo, disabled: !canUndo },
        { icon: '↪️', label: 'جلو (Ctrl+Y)', action: redo, disabled: !canRedo },
        { icon: '🗑️', label: 'حذف (Delete)', action: () => {
          if (state.selectedNodeId && state.selectedNodeId !== state.rootId) {
            deleteNode(state.selectedNodeId);
          }
        }, disabled: !state.selectedNodeId || state.selectedNodeId === state.rootId },
      ],
    },
    {
      id: 'view',
      icon: '👁️',
      label: 'نما',
      items: [
        { icon: isDark ? '☀️' : '🌙', label: isDark ? 'حالت روشن' : 'حالت تاریک', action: toggleTheme },
        { icon: showGrid ? '✅' : '⬜', label: showGrid ? 'مخفی کردن شبکه' : 'نمایش شبکه', action: () => dispatch({ type: 'TOGGLE_GRID' }) },
        { icon: showMiniMap ? '✅' : '⬜', label: showMiniMap ? 'مخفی کردن نقشه' : 'نمایش نقشه', action: () => dispatch({ type: 'TOGGLE_MINIMAP' }) },
      ],
    },
    {
      id: 'layout',
      icon: '📐',
      label: 'چیدمان',
      items: [
        { icon: '🌳', label: 'ارگانیک', action: () => autoLayout('organic'), active: layout === 'organic' },
        { icon: '→', label: 'درختی راست', action: () => autoLayout('tree-right'), active: layout === 'tree-right' },
        { icon: '←', label: 'درختی چپ', action: () => autoLayout('tree-left'), active: layout === 'tree-left' },
        { icon: '⬇️', label: 'درختی پایین', action: () => autoLayout('tree-down'), active: layout === 'tree-down' },
        { icon: '🎯', label: 'شعاعی', action: () => autoLayout('radial'), active: layout === 'radial' },
        { icon: '📊', label: 'منطقی', action: () => autoLayout('logic'), active: layout === 'logic' },
      ],
    },
  ];

  return (
    <div
      className={`absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg backdrop-blur-sm ${
        isDark
          ? 'bg-gray-800/80 border border-gray-700/50'
          : 'bg-white/80 border border-gray-200/50'
      }`}
      dir="rtl"
    >
      {menuItems.map(menu => (
        <div key={menu.id} className="relative">
          <button
            onClick={() => setShowMenu(showMenu === menu.id ? null : menu.id)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              isDark
                ? 'hover:bg-gray-700/50 text-gray-300'
                : 'hover:bg-gray-100/50 text-gray-600'
            }`}
          >
            <span>{menu.icon}</span>
            <span className="hidden md:inline">{menu.label}</span>
          </button>

          <AnimatePresence>
            {showMenu === menu.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full mt-2 right-0 min-w-[200px] rounded-xl shadow-xl overflow-hidden z-50 ${
                    isDark
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {menu.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!item.disabled) {
                          item.action();
                          setShowMenu(null);
                        }
                      }}
                      disabled={item.disabled}
                      className={`w-full px-4 py-2.5 text-right text-sm transition-colors flex items-center gap-3 ${
                        item.disabled
                          ? isDark
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                          : isDark
                          ? 'text-gray-300 hover:bg-gray-700/50'
                          : 'text-gray-700 hover:bg-gray-100/50'
                      } ${item.active ? (isDark ? 'bg-gray-700/50' : 'bg-gray-100/50') : ''}`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

      <button
        onClick={() => autoLayout()}
        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
          isDark
            ? 'hover:bg-gray-700/50 text-gray-300'
            : 'hover:bg-gray-100/50 text-gray-600'
        }`}
        title="چیدمان خودکار"
      >
        <span>🎨</span>
        <span className="hidden md:inline">چیدمان</span>
      </button>
    </div>
  );
}
