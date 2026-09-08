import React, { useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import MindNodeComponent from './MindNodeComponent';
import Connections from './Connections';
import MiniMap from './MiniMap';

export default function MindMapCanvas() {
  const { state, dispatch, setZoom, setPan, addNode, pushHistory } = useMindMap();
  const { nodes, zoom, panX, panY, theme, selectedNodeId, showGrid } = state;
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.2, Math.min(3, zoom + delta));
    setZoom(newZoom);
  }, [zoom, setZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      isPanning.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      dispatch({ type: 'SELECT_NODE', payload: { id: null } });
    }
  }, [dispatch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setPan(panX + dx, panY + dy);
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, [panX, panY, setPan]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - panX) / zoom;
        const y = (e.clientY - rect.top - panY) / zoom;
        pushHistory('افزودن نود');
        addNode(null, 'ایده جدید', x, y);
      }
    }
  }, [panX, panY, zoom, addNode, pushHistory]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          dispatch({ type: 'UNDO' });
        } else if (e.key === 'y') {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        } else if (e.key === '=') {
          e.preventDefault();
          setZoom(Math.min(3, zoom + 0.1));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoom(Math.max(0.2, zoom - 0.1));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoom(1);
          setPan(0, 0);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && selectedNodeId !== state.rootId) {
          e.preventDefault();
          pushHistory('حذف نود');
          dispatch({ type: 'DELETE_NODE', payload: { id: selectedNodeId } });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, zoom, selectedNodeId, state.rootId, setZoom, setPan, pushHistory]);

  const nodeArray = Object.values(nodes);

  return (
    <div
      ref={canvasRef}
      className={`absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing ${
        isPanning.current ? 'cursor-grabbing' : ''
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Transform container */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* Connections */}
        <Connections />

        {/* Nodes */}
        <AnimatePresence>
          {nodeArray.map(node => (
            <MindNodeComponent key={node.id} node={node} />
          ))}
        </AnimatePresence>
      </div>

      {/* Mini Map */}
      <MiniMap />
    </div>
  );
}
