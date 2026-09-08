import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function SearchBar() {
  const { state, dispatch, selectNode, searchNodes } = useMindMap();
  const { theme, searchQuery } = state;
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length >= 1 ? searchNodes(query) : [];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (nodeId: string) => {
    selectNode(nodeId);
    // Center view on node
    const node = state.nodes[nodeId];
    if (node) {
      const centerX = window.innerWidth / 2 - node.x * state.zoom - node.width / 2 * state.zoom;
      const centerY = window.innerHeight / 2 - node.y * state.zoom - node.height / 2 * state.zoom;
      dispatch({ type: 'SET_PAN', payload: { panX: centerX, panY: centerY } });
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Search button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 right-4 z-30 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm transition-all flex items-center gap-2 ${
          isDark
            ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700/50'
            : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200/50'
        }`}
      >
        <span>🔍</span>
        <span className="text-xs hidden sm:inline">جستجو (Ctrl+F)</span>
      </button>

      {/* Search modal */}
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
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              dir="rtl"
            >
              {/* Search input */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <span className="text-lg">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو در نقشه ذهنی..."
                  className={`flex-1 bg-transparent outline-none text-sm ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                  }`}
                  dir="rtl"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className={`px-2 py-1 rounded text-xs ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {query.length === 0 ? (
                  <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="text-3xl mb-2">🔍</div>
                    شروع به تایپ کنید...
                  </div>
                ) : results.length === 0 ? (
                  <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="text-3xl mb-2">😕</div>
                    نتیجه‌ای یافت نشد
                  </div>
                ) : (
                  results.map(node => (
                    <button
                      key={node.id}
                      onClick={() => handleSelect(node.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-right ${
                        isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: node.color }}
                      />
                      {node.emoji && <span>{node.emoji}</span>}
                      <span className="flex-1 truncate">{node.text}</span>
                      {node.priority && (
                        <span className="text-xs opacity-50">
                          {node.priority === 'high' ? '🔴' : node.priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
