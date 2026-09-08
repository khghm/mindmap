import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMindMap } from '../MindMapContext';
import MindNodeComponent from './MindNodeComponent';
import Connections from './Connections';
import MiniMap from './MiniMap';
import { PanState } from '../types';

export default function MindMapCanvas() {
  const { state, setZoom, setPan, selectNode, addNode } = useMindMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const [panState, setPanState] = useState<PanState>({
    isPanning: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(state.zoom + delta);
  }, [state.zoom, setZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      setPanState({
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        startPanX: state.panX,
        startPanY: state.panY,
      });
      selectNode(null);
    }
  }, [state.panX, state.panY, selectNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (panState.isPanning) {
      const dx = e.clientX - panState.startX;
      const dy = e.clientY - panState.startY;
      setPan(panState.startPanX + dx, panState.startPanY + dy);
    }
  }, [panState, setPan]);

  const handleMouseUp = useCallback(() => {
    setPanState(prev => ({ ...prev, isPanning: false }));
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.canvas-bg')) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - state.panX) / state.zoom;
        const y = (e.clientY - rect.top - state.panY) / state.zoom;
        addNode(null, 'ایده جدید', x, y);
      }
    }
  }, [state.panX, state.panY, state.zoom, addNode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        setZoom(1);
        setPan(0, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setZoom, setPan]);

  const isDark = state.theme === 'dark';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={{ cursor: panState.isPanning ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Grid Background */}
      <div className="canvas-bg absolute inset-0" style={{
        backgroundImage: isDark
          ? 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize: `${30 * state.zoom}px ${30 * state.zoom}px`,
        backgroundPosition: `${state.panX}px ${state.panY}px`,
      }} />

      {/* Transform Container */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`,
          transition: panState.isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* SVG Connections */}
        <Connections />

        {/* Nodes */}
        {Object.values(state.nodes).map(node => (
          <MindNodeComponent key={node.id} node={node} />
        ))}
      </div>

      {/* Mini Map */}
      <MiniMap />

      {/* Zoom Controls */}
      <div className={`absolute bottom-6 left-6 flex flex-col gap-2 rounded-xl p-2 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setZoom(state.zoom + 0.2)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <i className="fas fa-plus text-sm"></i>
        </button>
        <span className={`text-xs text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {Math.round(state.zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(state.zoom - 0.2)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <i className="fas fa-minus text-sm"></i>
        </button>
        <div className={`w-full h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <button
          onClick={() => { setZoom(1); setPan(0, 0); }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          title="بازنشانی نما"
        >
          <i className="fas fa-crosshairs text-sm"></i>
        </button>
      </div>
    </div>
  );
}
