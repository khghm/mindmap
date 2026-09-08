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
    const newId = addNode(node.id, 'ایده جدید', nx, ny);
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
        return { borderRadius: '12px' };
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
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Node body */}
        <div
          className={`relative w-full h-full flex items-center justify-center px-4 py-3 transition-all duration-200 ${
            isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
          } ${isDark ? 'ring-offset-gray-900' : 'ring-offset-white'}`}
          style={{
            background: `linear-gradient(135deg, ${node.color}, ${node.color}dd)`,
            ...getShapeStyle(),
            boxShadow: isSelected
              ? `0 0 30px ${node.color}66, 0 8px 32px rgba(0,0,0,0.3)`
              : `0 4px 20px ${node.color}33, 0 2px 8px rgba(0,0,0,0.2)`,
          }}
        >
          {/* Priority indicator */}
          {node.priority && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white/50"
              style={{ backgroundColor: priorityColors[node.priority] }}
              title={`اولویت: ${node.priority}`}
            />
          )}

          {/* Progress bar */}
          {node.progress !== undefined && node.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full overflow-hidden bg-black/20">
              <div
                className="h-full bg-white/60 transition-all duration-500"
                style={{ width: `${node.progress}%` }}
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
              className="w-full bg-transparent text-center text-white outline-none border-b border-white/50"
              style={{ fontSize: node.fontSize }}
              dir="rtl"
            />
          ) : (
            <div className="flex items-center gap-2 text-white text-center" dir="rtl">
              {node.emoji && <span className="text-lg">{node.emoji}</span>}
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
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleCollapse(); }}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}
                shadow-md border ${isDark ? 'border-gray-600' : 'border-gray-200'}
              `}
            >
              {node.collapsed ? '+' : '−'}
            </button>
          )}

          {/* Add child button (on hover) */}
          {!isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAddChild(); }}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-green-400"
            >
              +
            </button>
          )}
        </div>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 p-2 rounded-xl shadow-2xl grid grid-cols-5 gap-1 z-50 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => { e.stopPropagation(); handleSetEmoji(emoji); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowContextMenu(false)} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`fixed z-50 rounded-xl shadow-2xl overflow-hidden min-w-[200px] ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
            >
              <div className="p-1">
                <ContextMenuItem icon="✏️" label="ویرایش" onClick={() => { setIsEditing(true); setShowContextMenu(false); }} isDark={isDark} />
                <ContextMenuItem icon="➕" label="افزودن فرزند" onClick={handleAddChild} isDark={isDark} />
                <ContextMenuItem icon="📋" label="تکرار" onClick={() => { pushHistory('تکرار نود'); updateNode(node.id, {}); setShowContextMenu(false); }} isDark={isDark} />
                <ContextMenuItem icon="🎭" label="انتخاب ایموجی" onClick={() => { setShowEmojiPicker(true); setShowContextMenu(false); }} isDark={isDark} />
                
                <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                
                <div className={`px-3 py-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>اولویت:</div>
                <ContextMenuItem icon="🟢" label="کم" onClick={() => handleSetPriority('low')} isDark={isDark} />
                <ContextMenuItem icon="🟡" label="متوسط" onClick={() => handleSetPriority('medium')} isDark={isDark} />
                <ContextMenuItem icon="🔴" label="بالا" onClick={() => handleSetPriority('high')} isDark={isDark} />
                <ContextMenuItem icon="⚫" label="بحرانی" onClick={() => handleSetPriority('critical')} isDark={isDark} />
                
                {hasChildren && (
                  <>
                    <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
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
                    <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
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
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-right ${
        danger
          ? isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
          : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
