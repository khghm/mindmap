import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindNode } from '../types';
import { useMindMap } from '../MindMapContext';

interface Props {
  node: MindNode;
}

const EMOJI_OPTIONS = ['💡', '🎯', '📌', '⭐', '🔥', '💎', '🚀', '🎨', '📊', '🔧', '✅', '❌', '⚡', '🌟', '🎪', '📝', '🧠', '💪', '🏆', '🎁'];

export default function MindNodeComponent({ node }: Props) {
  const { state, updateNode, selectNode, deleteNode, addNode, toggleCollapse, pushHistory } = useMindMap();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, nodeX: 0, nodeY: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSelected = state.selectedNodeId === node.id;
  const isRoot = state.rootId === node.id;
  const isDark = state.theme === 'dark';
  const children = Object.values(state.nodes).filter(n => n.parentId === node.id);
  const hasChildren = children.length > 0;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(node.text);
  }, [node.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editText.trim() && editText !== node.text) {
      pushHistory('ویرایش متن');
      updateNode(node.id, { text: editText.trim() });
    }
  }, [editText, node.text, node.id, updateNode, pushHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.text);
    }
  }, [handleBlur, node.text]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    e.preventDefault();
    
    selectNode(node.id);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - dragRef.current.startX) / state.zoom;
      const dy = (ev.clientY - dragRef.current.startY) / state.zoom;
      updateNode(node.id, {
        x: dragRef.current.nodeX + dx,
        y: dragRef.current.nodeY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      pushHistory('جابجایی نود');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isEditing, node.id, node.x, node.y, state.zoom, selectNode, updateNode, pushHistory]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectNode(node.id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  }, [node.id, selectNode]);

  const handleAddChild = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200;
    const nx = node.x + Math.cos(angle) * dist;
    const ny = node.y + Math.sin(angle) * dist;
    pushHistory('افزودن نود فرزند');
    addNode(node.id, 'ایده جدید', nx, ny);
    setShowContextMenu(false);
  }, [node, addNode, pushHistory]);

  const handleDelete = useCallback(() => {
    if (isRoot) return;
    pushHistory('حذف نود');
    deleteNode(node.id);
    setShowContextMenu(false);
  }, [node.id, isRoot, deleteNode, pushHistory]);

  const handleToggleCollapse = useCallback(() => {
    toggleCollapse(node.id);
    setShowContextMenu(false);
  }, [node.id, toggleCollapse]);

  const handleSetEmoji = useCallback((emoji: string) => {
    updateNode(node.id, { emoji });
    setShowEmojiPicker(false);
  }, [node.id, updateNode]);

  const handleSetPriority = useCallback((priority: MindNode['priority']) => {
    updateNode(node.id, { priority });
    setShowContextMenu(false);
  }, [node.id, updateNode]);

  // Shape styles
  const getShapeStyle = (): React.CSSProperties => {
    switch (node.shape) {
      case 'pill':
        return { borderRadius: '50px' };
      case 'rectangle':
        return { borderRadius: '4px' };
      case 'diamond':
        return { borderRadius: '4px', transform: 'rotate(0deg)' };
      case 'hexagon':
        return { borderRadius: '12px', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
      case 'cloud':
        return { borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%' };
      default:
        return { borderRadius: '16px' };
    }
  };

  const priorityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };

  return (
    <>
      <motion.div
        ref={nodeRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`absolute cursor-move select-none group ${isDragging ? 'z-50' : 'z-10'}`}
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          minHeight: node.height,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Node body */}
        <motion.div
          className={`relative w-full h-full flex items-center justify-center px-5 py-4 transition-all duration-300 ${
            isSelected ? 'ring-2 ring-offset-4 ring-indigo-500/50' : ''
          } ${isDark ? 'ring-offset-slate-950' : 'ring-offset-white'}`}
          style={{
            background: isRoot
              ? `linear-gradient(135deg, ${node.color}, ${node.color}dd)`
              : isDark
              ? `linear-gradient(135deg, ${node.color}20, ${node.color}10)`
              : `linear-gradient(135deg, ${node.color}15, ${node.color}08)`,
            border: `2px solid ${node.color}${isDark ? '60' : '40'}`,
            ...getShapeStyle(),
            boxShadow: isSelected
              ? `0 0 40px ${node.color}44, 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
              : isRoot
              ? `0 10px 40px ${node.color}33, 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`
              : `0 4px 20px ${node.color}22, 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Glow effect for root */}
          {isRoot && (
            <div
              className="absolute inset-0 rounded-[inherit] opacity-30 blur-xl -z-10 animate-pulse-slow"
              style={{ background: node.color }}
            />
          )}

          {/* Priority indicator */}
          {node.priority && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white/50 shadow-lg"
              style={{ backgroundColor: priorityColors[node.priority] }}
              title={`اولویت: ${node.priority}`}
            />
          )}

          {/* Progress bar */}
          {node.progress !== undefined && node.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-[inherit] overflow-hidden bg-black/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-white/60 to-white/40"
              />
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-center text-white outline-none border-b-2 border-white/50 font-medium"
              style={{ fontSize: node.fontSize }}
              dir="rtl"
            />
          ) : (
            <div className="flex items-center gap-2 text-white text-center" dir="rtl">
              {node.emoji && <motion.span className="text-xl" whileHover={{ scale: 1.2 }}>{node.emoji}</motion.span>}
              <span
                className="font-medium leading-tight break-words"
                style={{ fontSize: node.fontSize, fontWeight: node.fontWeight || 'normal' }}
              >
                {node.text}
              </span>
            </div>
          )}

          {/* Collapse button */}
          {hasChildren && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleToggleCollapse(); }}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                isDark ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-white text-gray-600 hover:bg-gray-50'
              } border-2`}
              style={{ borderColor: node.color }}
            >
              {node.collapsed ? '+' : '−'}
            </motion.button>
          )}

          {/* Add child button (on hover) */}
          {!isEditing && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleAddChild(); }}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              +
            </motion.button>
          )}
        </motion.div>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -10 }}
              className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 z-50 ${
                isDark ? 'bg-slate-900/95 backdrop-blur-xl border border-white/10' : 'bg-white/95 backdrop-blur-xl border border-gray-200/50'
              }`}
            >
              {EMOJI_OPTIONS.map(emoji => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleSetEmoji(emoji); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-xl"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowContextMenu(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`fixed z-50 rounded-2xl shadow-2xl overflow-hidden min-w-[220px] ${
                isDark ? 'bg-slate-900/95 backdrop-blur-xl border border-white/10' : 'bg-white/95 backdrop-blur-xl border border-gray-200/50'
              }`}
              style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
            >
              <div className="p-2">
                <ContextMenuItem icon="✏️" label="ویرایش" onClick={() => { setIsEditing(true); setShowContextMenu(false); }} isDark={isDark} />
                <ContextMenuItem icon="➕" label="افزودن فرزند" onClick={handleAddChild} isDark={isDark} />
                <ContextMenuItem icon="📋" label="تکرار" onClick={() => { pushHistory('تکرار نود'); updateNode(node.id, {}); setShowContextMenu(false); }} isDark={isDark} />
                <ContextMenuItem icon="🎭" label="انتخاب ایموجی" onClick={() => { setShowEmojiPicker(true); setShowContextMenu(false); }} isDark={isDark} />
                
                <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'}`} />
                
                <div className={`px-4 py-2 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>اولویت:</div>
                <ContextMenuItem icon="🟢" label="کم" onClick={() => handleSetPriority('low')} isDark={isDark} />
                <ContextMenuItem icon="🟡" label="متوسط" onClick={() => handleSetPriority('medium')} isDark={isDark} />
                <ContextMenuItem icon="🔴" label="بالا" onClick={() => handleSetPriority('high')} isDark={isDark} />
                <ContextMenuItem icon="⚫" label="بحرانی" onClick={() => handleSetPriority('critical')} isDark={isDark} />
                
                {hasChildren && (
                  <>
                    <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'}`} />
                    <ContextMenuItem
                      icon={node.collapsed ? '📂' : '📁'}
                      label={node.collapsed ? 'باز کردن شاخه' : 'بستن شاخه'}
                      onClick={handleToggleCollapse}
                      isDark={isDark}
                    />
                  </>
                )}
                
                {!isRoot && (
                  <>
                    <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'}`} />
                    <ContextMenuItem icon="🗑️" label="حذف" onClick={handleDelete} isDark={isDark} danger />
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ContextMenuItem({ icon, label, onClick, isDark, danger }: {
  icon: string; label: string; onClick: () => void; isDark: boolean; danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: -4 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-right ${
        danger
          ? isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
          : isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-black/5'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}
