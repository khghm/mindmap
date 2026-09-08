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
    canUndo,
    canRedo,
  } = useMindMap();

  const { theme, layout, showGrid, showMiniMap, selectedNodeId, rootId } = state;
  const isDark = theme === 'dark';
  const [showMenu, setShowMenu] = useState<string | null>(null);

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
    shortcut?: string;
  }

  const menuItems: { id: string; icon: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'file',
      icon: '📁',
      label: 'فایل',
      items: [
        { icon: '📄', label: 'نقشه جدید', action: handleAddRootNode, shortcut: 'Ctrl+N' },
        { icon: '📥', label: 'وارد کردن', action: handleImport, shortcut: 'Ctrl+O' },
        { icon: '📤', label: 'خروجی JSON', action: handleExport, shortcut: 'Ctrl+S' },
      ],
    },
    {
      id: 'edit',
      icon: '✏️',
      label: 'ویرایش',
      items: [
        { icon: '↩️', label: 'بازگشت', action: undo, disabled: !canUndo, shortcut: 'Ctrl+Z' },
        { icon: '↪️', label: 'جلو', action: redo, disabled: !canRedo, shortcut: 'Ctrl+Y' },
        { icon: '🗑️', label: 'حذف', action: () => {
          if (selectedNodeId && selectedNodeId !== rootId) {
            deleteNode(selectedNodeId);
          }
        }, disabled: !selectedNodeId || selectedNodeId === rootId, shortcut: 'Delete' },
      ],
    },
    {
      id: 'view',
      icon: '👁️',
      label: 'نما',
      items: [
        { icon: isDark ? '☀️' : '🌙', label: isDark ? 'حالت روشن' : 'حالت تاریک', action: toggleTheme, shortcut: 'Ctrl+D' },
        { icon: showGrid ? '✅' : '⬜', label: showGrid ? 'مخفی کردن شبکه' : 'نمایش شبکه', action: () => dispatch({ type: 'TOGGLE_GRID' }), shortcut: 'Ctrl+G' },
        { icon: showMiniMap ? '✅' : '⬜', label: showMiniMap ? 'مخفی کردن نقشه' : 'نمایش نقشه', action: () => dispatch({ type: 'TOGGLE_MINIMAP' }), shortcut: 'Ctrl+M' },
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`absolute top-4 right-4 z-30 flex items-center gap-1 px-2 py-2 rounded-2xl shadow-xl backdrop-blur-xl ${
        isDark
          ? 'glass-dark'
          : 'glass-light'
      }`}
      dir="rtl"
    >
      {menuItems.map(menu => (
        <div key={menu.id} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(showMenu === menu.id ? null : menu.id)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              isDark
                ? 'hover:bg-white/10 text-gray-300'
                : 'hover:bg-black/5 text-gray-700'
            } ${showMenu === menu.id ? (isDark ? 'bg-white/10' : 'bg-black/5') : ''}`}
          >
            <span className="text-base">{menu.icon}</span>
            <span className="hidden md:inline font-medium">{menu.label}</span>
          </motion.button>

          <AnimatePresence>
            {showMenu === menu.id && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full mt-2 right-0 min-w-[240px] rounded-2xl shadow-2xl overflow-hidden z-50 ${
                    isDark
                      ? 'bg-slate-900/95 backdrop-blur-xl border border-white/10'
                      : 'bg-white/95 backdrop-blur-xl border border-gray-200/50'
                  }`}
                >
                  <div className="p-2">
                    {menu.items.map((item, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ x: -4 }}
                        onClick={() => {
                          if (!item.disabled) {
                            item.action();
                            setShowMenu(null);
                          }
                        }}
                        disabled={item.disabled}
                        className={`w-full px-4 py-3 text-right text-sm transition-all flex items-center justify-between rounded-xl ${
                          item.disabled
                            ? isDark
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-400 cursor-not-allowed'
                            : isDark
                            ? 'text-gray-300 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-black/5'
                        } ${item.active ? (isDark ? 'bg-white/10 text-indigo-400' : 'bg-black/5 text-indigo-600') : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.shortcut}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => autoLayout()}
        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
          isDark
            ? 'hover:bg-white/10 text-gray-300'
            : 'hover:bg-black/5 text-gray-700'
        }`}
        title="چیدمان خودکار"
      >
        <span className="text-base">🎨</span>
        <span className="hidden md:inline font-medium">چیدمان</span>
      </motion.button>
    </motion.div>
  );
}
