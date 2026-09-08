import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import { LayoutType, Connection } from '../types';

export default function Toolbar() {
  const { state, dispatch, addNode, pushHistory, autoLayout, undo, redo, canUndo, canRedo, exportJSON, importJSON, exportAsImage } = useMindMap();
  const { theme, layout, connectionStyle, showGrid, showMiniMap, zoom } = state;
  const isDark = theme === 'dark';
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleAddRoot = () => {
    if (!state.rootId) {
      pushHistory('افزودن نود ریشه');
      addNode(null, '🧠 ایده مرکزی', 600, 400);
    }
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    dispatch({ type: 'SET_LAYOUT', payload: { layout: newLayout } });
    pushHistory(`تغییر چیدمان به ${newLayout}`);
    autoLayout(newLayout);
    setShowLayoutMenu(false);
  };

  const handleExportJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = ev.target?.result as string;
        pushHistory('وارد کردن نقشه');
        importJSON(json);
      };
      reader.readAsText(file);
    };
    input.click();
    setShowExportMenu(false);
  };

  const layouts: { id: LayoutType; icon: string; label: string }[] = [
    { id: 'organic', icon: '🌿', label: 'ارگانیک' },
    { id: 'radial', icon: '🔵', label: 'شعاعی' },
    { id: 'tree-right', icon: '🌳', label: 'درختی راست' },
    { id: 'tree-down', icon: '🌲', label: 'درختی پایین' },
  ];

  const connStyles: { id: Connection['style']; icon: string; label: string }[] = [
    { id: 'bezier', icon: '〰️', label: 'منحنی' },
    { id: 'straight', icon: '📏', label: 'مستقیم' },
    { id: 'step', icon: '📐', label: 'پلکانی' },
    { id: 'smooth', icon: '🌊', label: 'نرم' },
  ];

  return (
    <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl border ${
      isDark ? 'bg-gray-900/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
    }`}>
      {/* Undo/Redo */}
      <ToolbarButton
        icon="↩️"
        label="بازگشت"
        onClick={undo}
        disabled={!canUndo}
        isDark={isDark}
      />
      <ToolbarButton
        icon="↪️"
        label="جلو"
        onClick={redo}
        disabled={!canRedo}
        isDark={isDark}
      />

      <Divider isDark={isDark} />

      {/* Add node */}
      <ToolbarButton
        icon="➕"
        label="نود ریشه"
        onClick={handleAddRoot}
        isDark={isDark}
        disabled={!!state.rootId}
      />

      <Divider isDark={isDark} />

      {/* Layout */}
      <div className="relative">
        <ToolbarButton
          icon="📐"
          label="چیدمان"
          onClick={() => { setShowLayoutMenu(!showLayoutMenu); setShowExportMenu(false); }}
          isDark={isDark}
          active={showLayoutMenu}
        />
        <AnimatePresence>
          {showLayoutMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl shadow-2xl overflow-hidden min-w-[180px] ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              {layouts.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleLayoutChange(l.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    layout === l.id
                      ? isDark ? 'bg-indigo-600/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{l.icon}</span>
                  <span>{l.label}</span>
                  {layout === l.id && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Style */}
      <div className="relative">
        <ToolbarButton
          icon="🔗"
          label="سبک اتصال"
          onClick={() => {
            const styles: Connection['style'][] = ['bezier', 'straight', 'step', 'smooth'];
            const idx = styles.indexOf(connectionStyle);
            const next = styles[(idx + 1) % styles.length];
            dispatch({ type: 'SET_CONNECTION_STYLE', payload: { style: next } });
          }}
          isDark={isDark}
        />
      </div>

      <Divider isDark={isDark} />

      {/* Grid toggle */}
      <ToolbarButton
        icon="⊞"
        label="شبکه"
        onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
        isDark={isDark}
        active={showGrid}
      />

      {/* MiniMap toggle */}
      <ToolbarButton
        icon="🗺️"
        label="نقشه کوچک"
        onClick={() => dispatch({ type: 'TOGGLE_MINIMAP' })}
        isDark={isDark}
        active={showMiniMap}
      />

      <Divider isDark={isDark} />

      {/* Zoom controls */}
      <ToolbarButton
        icon="🔍"
        label="کوچک‌نمایی"
        onClick={() => dispatch({ type: 'SET_ZOOM', payload: { zoom: zoom - 0.15 } })}
        isDark={isDark}
      />
      <ToolbarButton
        icon="🔎"
        label="بزرگ‌نمایی"
        onClick={() => dispatch({ type: 'SET_ZOOM', payload: { zoom: zoom + 0.15 } })}
        isDark={isDark}
      />
      <ToolbarButton
        icon="1:1"
        label="اندازه واقعی"
        onClick={() => {
          dispatch({ type: 'SET_ZOOM', payload: { zoom: 1 } });
          dispatch({ type: 'SET_PAN', payload: { panX: 0, panY: 0 } });
        }}
        isDark={isDark}
      />

      <Divider isDark={isDark} />

      {/* Theme toggle */}
      <ToolbarButton
        icon={isDark ? '☀️' : '🌙'}
        label="تم"
        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
        isDark={isDark}
      />

      {/* Export/Import */}
      <div className="relative">
        <ToolbarButton
          icon="💾"
          label="ذخیره/بارگذاری"
          onClick={() => { setShowExportMenu(!showExportMenu); setShowLayoutMenu(false); }}
          isDark={isDark}
          active={showExportMenu}
        />
        <AnimatePresence>
          {showExportMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full mt-2 right-0 rounded-xl shadow-2xl overflow-hidden min-w-[180px] ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <button
                onClick={handleExportJSON}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>📤</span>
                <span>خروجی JSON</span>
              </button>
              <button
                onClick={handleImportJSON}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>📥</span>
                <span>وارد کردن JSON</span>
              </button>
              <button
                onClick={() => { exportAsImage(); setShowExportMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>🖼️</span>
                <span>خروجی تصویر</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label, onClick, isDark, disabled, active }: {
  icon: string;
  label: string;
  onClick: () => void;
  isDark: boolean;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`relative px-2.5 py-2 rounded-xl text-sm transition-all duration-200 ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : active
            ? isDark ? 'bg-indigo-600/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
            : isDark ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-base">{icon}</span>
    </button>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return (
    <div className={`w-px h-6 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
  );
}
