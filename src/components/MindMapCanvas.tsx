import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMindMap } from '../MindMapContext';
import MindNodeComponent from './MindNodeComponent';
import Connections from './Connections';
import MiniMap from './MiniMap';

export default function MindMapCanvas() {
  const { state, dispatch, setZoom, setPan, addNode, pushHistory } = useMindMap();
  const { nodes, zoom, panX, panY, theme, selectedNodeId, rootId } = state;
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  
  // Use refs for zoom/pan to avoid re-attaching listeners
  const zoomRef = useRef(zoom);
  const panXRef = useRef(panX);
  const panYRef = useRef(panY);
  
  useEffect(() => {
    zoomRef.current = zoom;
    panXRef.current = panX;
    panYRef.current = panY;
  }, [zoom, panX, panY]);

  // Wheel zoom - attach once with refs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const currentZoom = zoomRef.current;
      const currentPanX = panXRef.current;
      const currentPanY = panYRef.current;
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.2, Math.min(3, currentZoom * delta));
      
      // Zoom towards mouse position
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomRatio = newZoom / currentZoom;
      const newPanX = mouseX - (mouseX - currentPanX) * zoomRatio;
      const newPanY = mouseY - (mouseY - currentPanY) * zoomRatio;
      
      setZoom(newZoom);
      setPan(newPanX, newPanY);
    };

    // Use capture phase to ensure we get the event first
    canvas.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => canvas.removeEventListener('wheel', handleWheel, { capture: true });
  }, [setZoom, setPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan if clicking on canvas background (not on nodes)
    const target = e.target as HTMLElement;
    const isCanvas = target === canvasRef.current || target.tagName === 'svg';
    
    if (isCanvas) {
      setIsPanning(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
      dispatch({ type: 'SELECT_NODE', payload: { id: null } });
    }
  }, [dispatch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setPan(panXRef.current + dx, panYRef.current + dy);
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, [isPanning, setPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvas = target === canvasRef.current || target.tagName === 'svg';
    
    if (isCanvas) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - panXRef.current) / zoomRef.current;
        const y = (e.clientY - rect.top - panYRef.current) / zoomRef.current;
        pushHistory('افزودن نود');
        addNode(null, 'ایده جدید', x, y);
      }
    }
  }, [addNode, pushHistory]);

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
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom(Math.min(3, zoomRef.current + 0.1));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoom(Math.max(0.2, zoomRef.current - 0.1));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoom(1);
          setPan(0, 0);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedNodeId && state.selectedNodeId !== state.rootId) {
          e.preventDefault();
          pushHistory('حذف نود');
          dispatch({ type: 'DELETE_NODE', payload: { id: state.selectedNodeId } });
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (state.selectedNodeId) {
          const node = state.nodes[state.selectedNodeId];
          if (node) {
            pushHistory('افزودن فرزند');
            addNode(state.selectedNodeId, 'ایده جدید', node.x + 200, node.y);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, state.selectedNodeId, state.rootId, state.nodes, setZoom, setPan, pushHistory, addNode]);

  const nodeArray = Object.values(nodes);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0"
      style={{ 
        overflow: 'hidden', 
        cursor: isPanning ? 'grabbing' : 'grab',
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Transform container */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: '10000px',
          height: '10000px',
          transformOrigin: '0 0',
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
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
