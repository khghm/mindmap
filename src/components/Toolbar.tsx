import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function Toolbar() {
  const { state, addNode, deleteNode, autoLayout, toggleTheme, saveToStorage, loadFromStorage, exportAsJSON, importFromJSON, setLayout } = useMindMap();
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = state.theme === 'dark';

  const handleExport = () => {
    const json = exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        importFromJSON(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImportText = () => {
    if (importText.trim()) {
      importFromJSON(importText);
      setImportText('');
      setShowImport(false);
    }
  };

  const handleSave = () => {
    saveToStorage();
  };

  const handleLoad = () => {
    loadFromStorage();
  };

  const btnClass = `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
    isDark 
      ? 'hover:bg-gray-700/50 text-gray-300' 
      : 'hover:bg-gray-100 text-gray-700'
  }`;

  return (
    <>
      <motion.div
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl border ${
          isDark 
            ? 'bg-gray-800/95 border-gray-700 backdrop-blur-md' 
            : 'bg-white/95 border-gray-200 backdrop-blur-md'
        }`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-600/30 ml-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <i className="fas fa-brain text-white text-sm"></i>
          </div>
          <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            MindFlow
          </span>
        </div>

        {/* Add Node */}
        <button
          className={btnClass}
          onClick={() => addNode(state.selectedNodeId, 'ایده جدید')}
          title="افزودن نود (Ctrl+N)"
        >
          <i className="fas fa-plus text-green-500"></i>
          <span className="hidden md:inline">افزودن</span>
        </button>

        {/* Delete */}
        {state.selectedNodeId && state.selectedNodeId !== state.rootId && (
          <button
            className={btnClass}
            onClick={() => deleteNode(state.selectedNodeId!)}
            title="حذف (Delete)"
          >
            <i className="fas fa-trash text-red-500"></i>
            <span className="hidden md:inline">حذف</span>
          </button>
        )}

        {/* Divider */}
        <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

        {/* Auto Layout */}
        <div className="relative">
          <button
            className={btnClass}
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            title="چیدمان خودکار"
          >
            <i className="fas fa-sitemap text-blue-500"></i>
            <span className="hidden md:inline">چیدمان</span>
          </button>
          <AnimatePresence>
            {showLayoutMenu && (
              <motion.div
                className={`absolute top-full mt-2 right-0 min-w-[160px] rounded-xl shadow-xl border overflow-hidden ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {[
                  { key: 'organic', label: 'ارگانیک', icon: 'fa-circle-nodes' },
                  { key: 'tree-right', label: 'درختی (راست)', icon: 'fa-arrow-right' },
                  { key: 'tree-left', label: 'درختی (چپ)', icon: 'fa-arrow-left' },
                  { key: 'radial', label: 'شعاعی', icon: 'fa-bullseye' },
                ].map(item => (
                  <button
                    key={item.key}
                    className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                    } ${state.layout === item.key ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                    onClick={() => {
                      setLayout(item.key as any);
                      autoLayout();
                      setShowLayoutMenu(false);
                    }}
                  >
                    <i className={`fas ${item.icon} text-indigo-500`}></i>
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

        {/* Save */}
        <button className={btnClass} onClick={handleSave} title="ذخیره">
          <i className="fas fa-save text-emerald-500"></i>
          <span className="hidden md:inline">ذخیره</span>
        </button>

        {/* Load */}
        <button className={btnClass} onClick={handleLoad} title="بارگذاری">
          <i className="fas fa-folder-open text-amber-500"></i>
          <span className="hidden md:inline">بارگذاری</span>
        </button>

        {/* Export */}
        <button className={btnClass} onClick={() => setShowExport(true)} title="خروجی">
          <i className="fas fa-download text-cyan-500"></i>
          <span className="hidden md:inline">خروجی</span>
        </button>

        {/* Import */}
        <button className={btnClass} onClick={() => setShowImport(true)} title="ورودی">
          <i className="fas fa-upload text-violet-500"></i>
          <span className="hidden md:inline">ورودی</span>
        </button>

        {/* Divider */}
        <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

        {/* Theme Toggle */}
        <button className={btnClass} onClick={toggleTheme} title="تغییر تم">
          <i className={`fas ${isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'}`}></i>
        </button>
      </motion.div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <Modal isDark={isDark} onClose={() => setShowExport(false)} title="خروجی گرفتن">
            <div className="space-y-3">
              <button
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={handleExport}
              >
                <i className="fas fa-file-export"></i>
                دانلود فایل JSON
              </button>
              <button
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => {
                  navigator.clipboard.writeText(exportAsJSON());
                  setShowExport(false);
                }}
              >
                <i className="fas fa-copy"></i>
                کپی در کلیپبورد
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <Modal isDark={isDark} onClose={() => setShowImport(false)} title="وارد کردن نقشه">
            <div className="space-y-3">
              <button
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fas fa-file-import"></i>
                انتخاب فایل JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
              <div className="relative">
                <textarea
                  className={`w-full h-32 rounded-xl p-3 text-sm resize-none border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  placeholder="یا JSON را اینجا پیست کنید..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  dir="ltr"
                />
              </div>
              <button
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
                onClick={handleImportText}
                disabled={!importText.trim()}
              >
                وارد کردن
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>Ctrl+Click</kbd> افزودن</span>
        <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>DblClick</kbd> ویرایش</span>
        <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>RightClick</kbd> منو</span>
        <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>Scroll</kbd> زوم</span>
      </div>
    </>
  );
}

function Modal({ children, isDark, onClose, title }: { children: React.ReactNode; isDark: boolean; onClose: () => void; title: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
