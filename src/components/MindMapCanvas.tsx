import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useMindMap } from '../MindMapContext';
import MindNodeComponent from './MindNodeComponent';
import Connections from './Connections';
import MiniMap from './MiniMap';

export default function MindMapCanvas() {
  const { state, dispatch, selectNode, getVisibleNodes, addNode, pushHistory, autoLayout } = useMindMap();
  const { zoom, panX, panY, showGrid, gridSize, theme, showMiniMap, selectedNodeId, rootId } = state;
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const visibleNodes = getVisibleNodes();

  // Pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      selectNode(null);
    }
  }, [panX, panY, selectNode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      dispatch({
        type: 'SET_PAN',
        payload: { panX: panStart.current.panX + dx, panY: panStart.current.panY + dy },
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, dispatch]);

  // Zoom handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const scale = newZoom / zoom;
      const newPanX = mouseX - (mouseX - panX) * scale;
      const newPanY = mouseY - (mouseY - panY) * scale;
      dispatch({ type: 'SET_ZOOM', payload: { zoom: newZoom } });
      dispatch({ type: 'SET_PAN', payload: { panX: newPanX, panY: newPanY } });
    }
  }, [zoom, panX, panY, dispatch]);

  // Double click to add node
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    
    pushHistory('افزودن نود جدید');
    if (rootId) {
      addNode(rootId, 'ایده جدید', x, y);
    } else {
      addNode(null, '🧠 ایده مرکزی', x, y);
    }
  }, [panX, panY, zoom, rootId, addNode, pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
      }
      
      // Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && selectedNodeId !== rootId) {
        e.preventDefault();
        pushHistory('حذف نود');
        dispatch({ type: 'DELETE_NODE', payload: { id: selectedNodeId } });
      }
      
      // Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        dispatch({ type: 'SET_ZOOM', payload: { zoom: zoom + 0.1 } });
      }
      
      // Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        dispatch({ type: 'SET_ZOOM', payload: { zoom: zoom - 0.1 } });
      }
      
      // Reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        dispatch({ type: 'SET_ZOOM', payload: { zoom: 1 } });
        dispatch({ type: 'SET_PAN', payload: { panX: 0, panY: 0 } });
      }
      
      // Add child node (Tab)
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        const parentNode = state.nodes[selectedNodeId];
        if (parentNode) {
          pushHistory('افزودن فرزند');
          addNode(selectedNodeId, 'ایده جدید', parentNode.x + 250, parentNode.y);
        }
      }
      
      // Add sibling node (Enter)
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        const node = state.nodes[selectedNodeId];
        if (node && node.parentId) {
          pushHistory('افزودن نود هم‌سطح');
          addNode(node.parentId, 'ایده جدید', node.x, node.y + 80);
        }
      }
      
      // Auto layout (Ctrl+L)
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        pushHistory('چیدمان خودکار');
        autoLayout();
      }
      
      // Escape - deselect
      if (e.key === 'Escape') {
        selectNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, rootId, zoom, state.nodes, dispatch, addNode, pushHistory, autoLayout, selectNode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)'
          : 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      {/* Grid */}
      {showGrid && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
          <defs>
            <pattern
              id="grid"
              width={gridSize * zoom}
              height={gridSize * zoom}
              patternUnits="userSpaceOnUse"
              x={panX % (gridSize * zoom)}
              y={panY % (gridSize * zoom)}
            >
              <circle
                cx={gridSize * zoom / 2}
                cy={gridSize * zoom / 2}
                r="1"
                fill={isDark ? '#ffffff22' : '#00000022'}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Transform layer */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* Connections */}
        <Connections />
        
        {/* Nodes */}
        {visibleNodes.map(node => (
          <MindNodeComponent key={node.id} node={node} />
        ))}
      </div>

      {/* Mini Map */}
      {showMiniMap && <MiniMap />}

      {/* Zoom indicator */}
      <div className={`absolute bottom-6 left-6 px-3 py-1.5 rounded-lg text-sm font-mono ${
        isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
      } backdrop-blur-sm`}>
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
