import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';

export default function SearchBar() {
  const { state, dispatch, selectNode } = useMindMap();
  const { theme, searchQuery } = state;
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        dispatch({ type: 'SET_SEARCH', payload: { query: '' } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    dispatch({ type: 'SET_SEARCH', payload: { query } });
  }, [query, dispatch]);

  const results = query.trim()
    ? Object.values(state.nodes).filter(n =>
        n.text.toLowerCase().includes(query.toLowerCase()) ||
        (n.note && n.note.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelect = (nodeId: string) => {
    selectNode(nodeId);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Search button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 left-4 z-30 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl transition-all flex items-center gap-2 ${
          isDark
            ? 'glass-dark text-gray-300 hover:bg-white/10'
            : 'glass-light text-gray-600 hover:bg-white/80'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">جستجو</span>
        <kbd className={`text-xs px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
          Ctrl+F
        </kbd>
      </motion.button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => { setIsOpen(false); setQuery(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-slate-900/95 backdrop-blur-xl border border-white/10' : 'bg-white/95 backdrop-blur-xl border border-gray-200/50'
              }`}
              dir="rtl"
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجو در نودها..."
                    className={`flex-1 bg-transparent outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
                    dir="rtl"
                  />
                  <button
                    onClick={() => { setIsOpen(false); setQuery(''); }}
                    className={`px-3 py-1 rounded-xl text-sm ${isDark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    Esc
                  </button>
                </div>
              </div>

              {query.trim() && (
                <div className={`border-t max-h-96 overflow-y-auto ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
                  {results.length === 0 ? (
                    <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div className="text-4xl mb-2">🔍</div>
                      <div className="text-sm">نتیجه‌ای یافت نشد</div>
                    </div>
                  ) : (
                    <div className="p-2">
                      {results.map(node => (
                        <motion.button
                          key={node.id}
                          whileHover={{ x: -4 }}
                          onClick={() => handleSelect(node.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-right transition-all ${
                            isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-black/5'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                            style={{ backgroundColor: node.color }}
                          >
                            {node.emoji || '📌'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{node.text}</div>
                            {node.note && (
                              <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {node.note.slice(0, 50)}...
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
