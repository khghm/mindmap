import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindNode } from '../types';
import { useMindMap } from '../MindMapContext';

interface Props {
  node: MindNode;
}

export default function MindNodeComponent({ node }: Props) {
  const { state, updateNode, selectNode, deleteNode, addNode, toggleCollapse } = useMindMap();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [isDragging, setIsDragging] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSelected = state.selectedNodeId === node.id;
  const isRoot = state.rootId === node.id;
  const isDark = state.theme === 'dark';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    e.preventDefault();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    });
    selectNode(node.id);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / state.zoom;
      const dy = (e.clientY - dragStart.y) / state.zoom;
      updateNode(node.id, {
        x: dragStart.nodeX + dx,
        y: dragStart.nodeY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditing, node.id, node.x, node.y, state.zoom, selectNode, updateNode, dragStart]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditText(node.text);
    setIsEditing(true);
  }, [node.text]);

  const handleEditSubmit = useCallback(() => {
    if (editText.trim()) {
      updateNode(node.id, { text: editText.trim() });
    }
    setIsEditing(false);
  }, [editText, node.id, updateNode]);

  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
    selectNode(node.id);
  }, [node.id, selectNode]);

  const handleAddChild = useCallback(() => {
    setShowContextMenu(false);
    addNode(node.id, 'زیرموضوع');
  }, [node.id, addNode]);

  const handleDelete = useCallback(() => {
    setShowContextMenu(false);
    deleteNode(node.id);
  }, [node.id, deleteNode]);

  const getShapeClass = () => {
    switch (node.shape) {
      case 'ellipse': return 'rounded-full';
      case 'rectangle': return 'rounded-sm';
      case 'diamond': return 'rounded-sm rotate-0';
      default: return 'rounded-2xl';
    }
  };

  const hasChildren = node.children.length > 0;

  return (
    <>
      <motion.div
        ref={nodeRef}
        className={`absolute select-none ${isDragging ? 'z-50' : 'z-10'}`}
        style={{
          left: node.x,
          top: node.y,
          minWidth: node.width,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: isDragging ? -2 : 0,
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
      >
        {/* Node Container */}
        <div
          className={`
            relative px-5 py-3 cursor-grab active:cursor-grabbing
            transition-all duration-200
            ${getShapeClass()}
            ${isSelected ? 'ring-2 ring-offset-2 scale-105' : 'hover:scale-[1.02]'}
            ${isRoot ? 'shadow-2xl' : 'shadow-lg'}
            ${isDark ? 'ring-offset-gray-900' : 'ring-offset-gray-50'}
          `}
          style={{
            background: isRoot
              ? `linear-gradient(135deg, ${node.color}, ${node.color}dd)`
              : isDark
                ? `linear-gradient(135deg, ${node.color}22, ${node.color}11)`
                : `linear-gradient(135deg, ${node.color}15, ${node.color}08)`,
            border: `2px solid ${node.color}${isDark ? '88' : '66'}`,
            boxShadow: isSelected
              ? `0 0 20px ${node.color}44, 0 8px 32px rgba(0,0,0,0.3)`
              : `0 4px 16px ${node.color}22`,
          }}
        >
          {/* Glow effect for root */}
          {isRoot && (
            <div
              className="absolute inset-0 rounded-2xl opacity-30 blur-xl -z-10"
              style={{ background: node.color }}
            />
          )}

          {/* Content */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSubmit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className={`
                  bg-transparent border-none outline-none text-center w-full
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}
                style={{ fontSize: node.fontSize, fontWeight: isRoot ? 700 : 500 }}
                dir="rtl"
              />
            ) : (
              <span
                className={`
                  whitespace-nowrap text-center block w-full
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}
                style={{ fontSize: node.fontSize, fontWeight: isRoot ? 700 : 500 }}
              >
                {node.icon && <span className="ml-1">{node.icon}</span>}
                {node.text}
              </span>
            )}
          </div>

          {/* Collapse button */}
          {hasChildren && (
            <button
              className={`
                absolute -bottom-3 left-1/2 -translate-x-1/2
                w-6 h-6 rounded-full flex items-center justify-center
                text-xs font-bold transition-all
                ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}
                shadow-md border ${isDark ? 'border-gray-600' : 'border-gray-300'}
              `}
              onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
              style={{ borderColor: node.color }}
            >
              {node.collapsed ? '+' : node.children.length}
            </button>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              className="absolute -inset-1 rounded-2xl border-2 border-dashed pointer-events-none"
              style={{ borderColor: node.color }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Quick add button on hover */}
        <motion.button
          className={`
            absolute -right-3 top-1/2 -translate-y-1/2
            w-7 h-7 rounded-full flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-all
            shadow-lg
          `}
          style={{
            background: node.color,
            opacity: isSelected ? 1 : undefined,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: isSelected ? 1 : 0 }}
          onClick={(e) => { e.stopPropagation(); addNode(node.id, 'زیرموضوع'); }}
        >
          <i className="fas fa-plus text-white text-xs"></i>
        </motion.button>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <div
              className="fixed inset-0 z-[999]"
              onClick={() => setShowContextMenu(false)}
            />
            <motion.div
              className={`
                fixed z-[1000] min-w-[200px] rounded-xl shadow-2xl overflow-hidden
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                left: contextMenuPos.x,
                top: contextMenuPos.y,
              }}
            >
              <button
                className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                onClick={handleAddChild}
              >
                <i className="fas fa-plus-circle text-green-500"></i>
                <span>افزودن زیرموضوع</span>
              </button>
              <button
                className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                onClick={() => { setShowContextMenu(false); setEditText(node.text); setIsEditing(true); }}
              >
                <i className="fas fa-edit text-blue-500"></i>
                <span>ویرایش</span>
              </button>
              <button
                className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                onClick={() => {
                  setShowContextMenu(false);
                  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4', '#3b82f6'];
                  const newColor = colors[Math.floor(Math.random() * colors.length)];
                  updateNode(node.id, { color: newColor });
                }}
              >
                <i className="fas fa-palette text-purple-500"></i>
                <span>تغییر رنگ</span>
              </button>
              <div className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              {!isRoot && (
                <button
                  className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                  onClick={handleDelete}
                >
                  <i className="fas fa-trash-alt"></i>
                  <span>حذف</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
