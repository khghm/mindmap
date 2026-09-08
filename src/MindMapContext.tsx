import React, { createContext, useContext, useReducer, useCallback, ReactNode, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MindNode, Connection, MindMapState, HistoryEntry, LayoutType } from './types';

// ============ INITIAL STATE ============
const initialState: MindMapState = {
  nodes: {},
  connections: [],
  rootId: null,
  selectedNodeId: null,
  multiSelectedIds: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  theme: 'dark',
  layout: 'organic',
  connectionStyle: 'bezier',
  showGrid: true,
  gridSize: 20,
  showMiniMap: true,
  showProperties: false,
  searchQuery: '',
  clipboard: [],
  history: [],
  historyIndex: -1,
  presentationMode: false,
  presentationIndex: 0,
};

// ============ ACTIONS ============
type Action =
  | { type: 'SET_STATE'; payload: Partial<MindMapState> }
  | { type: 'ADD_NODE'; payload: { node: MindNode } }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<MindNode> } }
  | { type: 'DELETE_NODE'; payload: { id: string } }
  | { type: 'SELECT_NODE'; payload: { id: string | null } }
  | { type: 'MULTI_SELECT'; payload: { ids: string[] } }
  | { type: 'SET_ZOOM'; payload: { zoom: number } }
  | { type: 'SET_PAN'; payload: { panX: number; panY: number } }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_COLLAPSE'; payload: { id: string } }
  | { type: 'SET_LAYOUT'; payload: { layout: LayoutType } }
  | { type: 'SET_CONNECTION_STYLE'; payload: { style: Connection['style'] } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_MINIMAP' }
  | { type: 'TOGGLE_PROPERTIES' }
  | { type: 'SET_SEARCH'; payload: { query: string } }
  | { type: 'SET_CLIPBOARD'; payload: { ids: string[] } }
  | { type: 'PUSH_HISTORY'; payload: { description: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_PRESENTATION' }
  | { type: 'SET_PRESENTATION_INDEX'; payload: { index: number } }
  | { type: 'ADD_CONNECTION'; payload: { connection: Connection } }
  | { type: 'REMOVE_CONNECTION'; payload: { id: string } }
  | { type: 'LOAD_STATE'; payload: MindMapState }
  | { type: 'BATCH_UPDATE'; payload: { nodes: Record<string, MindNode>; connections: Connection[] } };

// ============ HELPERS ============
function getDescendantIds(nodes: Record<string, MindNode>, nodeId: string): string[] {
  const result: string[] = [];
  const children = Object.values(nodes).filter(n => n.parentId === nodeId);
  children.forEach(child => {
    result.push(child.id);
    result.push(...getDescendantIds(nodes, child.id));
  });
  return result;
}

function saveHistory(state: MindMapState, description: string): MindMapState {
  const entry: HistoryEntry = {
    nodes: JSON.parse(JSON.stringify(state.nodes)),
    connections: JSON.parse(JSON.stringify(state.connections)),
    timestamp: Date.now(),
    description,
  };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entry);
  // Keep max 50 entries
  if (newHistory.length > 50) newHistory.shift();
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

// ============ REDUCER ============
function reducer(state: MindMapState, action: Action): MindMapState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'ADD_NODE': {
      const newNodes = { ...state.nodes, [action.payload.node.id]: action.payload.node };
      return { ...state, nodes: newNodes };
    }

    case 'UPDATE_NODE': {
      const { id, updates } = action.payload;
      if (!state.nodes[id]) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: { ...state.nodes[id], ...updates, updatedAt: Date.now() },
        },
      };
    }

    case 'DELETE_NODE': {
      const { id } = action.payload;
      const descendantIds = getDescendantIds(state.nodes, id);
      const allToDelete = new Set([id, ...descendantIds]);
      
      const newNodes = { ...state.nodes };
      allToDelete.forEach(nid => delete newNodes[nid]);
      
      const newConnections = state.connections.filter(
        c => !allToDelete.has(c.sourceId) && !allToDelete.has(c.targetId)
      );
      
      return {
        ...state,
        nodes: newNodes,
        connections: newConnections,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        rootId: state.rootId === id ? null : state.rootId,
      };
    }

    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload.id, multiSelectedIds: [] };

    case 'MULTI_SELECT':
      return { ...state, multiSelectedIds: action.payload.ids };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(5, action.payload.zoom)) };

    case 'SET_PAN':
      return { ...state, panX: action.payload.panX, panY: action.payload.panY };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    case 'TOGGLE_COLLAPSE': {
      const { id } = action.payload;
      if (!state.nodes[id]) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: { ...state.nodes[id], collapsed: !state.nodes[id].collapsed },
        },
      };
    }

    case 'SET_LAYOUT':
      return { ...state, layout: action.payload.layout };

    case 'SET_CONNECTION_STYLE':
      return { ...state, connectionStyle: action.payload.style };

    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };

    case 'TOGGLE_MINIMAP':
      return { ...state, showMiniMap: !state.showMiniMap };

    case 'TOGGLE_PROPERTIES':
      return { ...state, showProperties: !state.showProperties };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload.query };

    case 'SET_CLIPBOARD':
      return { ...state, clipboard: action.payload.ids };

    case 'PUSH_HISTORY':
      return saveHistory(state, action.payload.description);

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const prevEntry = state.history[state.historyIndex - 1];
      return {
        ...state,
        nodes: JSON.parse(JSON.stringify(prevEntry.nodes)),
        connections: JSON.parse(JSON.stringify(prevEntry.connections)),
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextEntry = state.history[state.historyIndex + 1];
      return {
        ...state,
        nodes: JSON.parse(JSON.stringify(nextEntry.nodes)),
        connections: JSON.parse(JSON.stringify(nextEntry.connections)),
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'TOGGLE_PRESENTATION':
      return { ...state, presentationMode: !state.presentationMode, presentationIndex: 0 };

    case 'SET_PRESENTATION_INDEX':
      return { ...state, presentationIndex: action.payload.index };

    case 'ADD_CONNECTION':
      return { ...state, connections: [...state.connections, action.payload.connection] };

    case 'REMOVE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(c => c.id !== action.payload.id),
      };

    case 'LOAD_STATE':
      return { ...action.payload };

    case 'BATCH_UPDATE':
      return { ...state, nodes: action.payload.nodes, connections: action.payload.connections };

    default:
      return state;
  }
}

// ============ CONTEXT ============
interface MindMapContextType {
  state: MindMapState;
  dispatch: React.Dispatch<Action>;
  addNode: (parentId: string | null, text?: string, x?: number, y?: number, emoji?: string) => string;
  deleteNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<MindNode>) => void;
  selectNode: (id: string | null) => void;
  toggleCollapse: (id: string) => void;
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  autoLayout: (layout?: LayoutType) => void;
  getChildren: (parentId: string) => MindNode[];
  getDescendants: (parentId: string) => MindNode[];
  getVisibleNodes: () => MindNode[];
  exportJSON: () => string;
  importJSON: (json: string) => void;
  exportAsImage: () => void;
  duplicateNode: (id: string) => void;
  findNode: (id: string) => MindNode | undefined;
  searchNodes: (query: string) => MindNode[];
  toggleTheme: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const MindMapContext = createContext<MindMapContextType | null>(null);

export function useMindMap(): MindMapContextType {
  const ctx = useContext(MindMapContext);
  if (!ctx) throw new Error('useMindMap must be used within MindMapProvider');
  return ctx;
}

// ============ PROVIDER ============
export function MindMapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const layoutApplied = useRef(false);

  const addNode = useCallback((parentId: string | null, text = 'ایده جدید', x?: number, y?: number, emoji?: string): string => {
    const id = uuidv4();
    const node: MindNode = {
      id,
      parentId,
      text,
      emoji,
      color: parentId ? '#6366f1' : '#8b5cf6',
      shape: parentId ? 'rounded' : 'pill',
      fontSize: parentId ? 14 : 18,
      fontWeight: parentId ? 'normal' : 'bold',
      x: x ?? (Math.random() * 400 + 200),
      y: y ?? (Math.random() * 300 + 200),
      width: parentId ? 160 : 200,
      height: parentId ? 50 : 60,
      collapsed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_NODE', payload: { node } });
    if (!parentId) {
      dispatch({ type: 'SET_STATE', payload: { rootId: id, selectedNodeId: id } });
    }
    return id;
  }, []);

  const deleteNode = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: { id } });
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<MindNode>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
  }, []);

  const selectNode = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: { id } });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_COLLAPSE', payload: { id } });
  }, []);

  const pushHistory = useCallback((description: string) => {
    dispatch({ type: 'PUSH_HISTORY', payload: { description } });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const getChildren = useCallback((parentId: string): MindNode[] => {
    return Object.values(state.nodes).filter(n => n.parentId === parentId);
  }, [state.nodes]);

  const getDescendants = useCallback((parentId: string): MindNode[] => {
    const result: MindNode[] = [];
    const children = getChildren(parentId);
    children.forEach(child => {
      result.push(child);
      result.push(...getDescendants(child.id));
    });
    return result;
  }, [getChildren]);

  const getVisibleNodes = useCallback((): MindNode[] => {
    const collapsedParents = new Set<string>();
    const allNodes = Object.values(state.nodes);
    
    // Find all collapsed nodes
    allNodes.forEach(n => {
      if (n.collapsed) collapsedParents.add(n.id);
    });
    
    // Filter out hidden nodes
    return allNodes.filter(node => {
      if (!node.parentId) return true;
      // Check if any ancestor is collapsed
      let current = node;
      while (current.parentId) {
        if (collapsedParents.has(current.parentId)) return false;
        current = state.nodes[current.parentId];
        if (!current) return false;
      }
      return true;
    });
  }, [state.nodes]);

  const autoLayout = useCallback((layoutType?: LayoutType) => {
    const type = layoutType || state.layout;
    const nodes = Object.values(state.nodes);
    if (nodes.length === 0) return;

    const root = nodes.find(n => n.parentId === null);
    if (!root) return;

    const newNodes = { ...state.nodes };
    const centerX = 600;
    const centerY = 400;

    if (type === 'radial') {
      newNodes[root.id] = { ...newNodes[root.id], x: centerX, y: centerY };
      const children = nodes.filter(n => n.parentId === root.id);
      const angleStep = (2 * Math.PI) / Math.max(children.length, 1);
      
      children.forEach((child, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const radius = 220;
        const cx = centerX + Math.cos(angle) * radius;
        const cy = centerY + Math.sin(angle) * radius;
        newNodes[child.id] = { ...newNodes[child.id], x: cx - child.width / 2, y: cy - child.height / 2 };
        
        // Grandchildren
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        const gcAngleStep = Math.PI * 0.6 / Math.max(grandChildren.length - 1, 1);
        const gcStartAngle = angle - Math.PI * 0.3;
        
        grandChildren.forEach((gc, j) => {
          const gcAngle = grandChildren.length === 1 ? angle : gcStartAngle + gcAngleStep * j;
          const gcRadius = 180;
          const gcx = cx + Math.cos(gcAngle) * gcRadius;
          const gcy = cy + Math.sin(gcAngle) * gcRadius;
          newNodes[gc.id] = { ...newNodes[gc.id], x: gcx - gc.width / 2, y: gcy - gc.height / 2 };
        });
      });
    } else if (type === 'tree-right') {
      newNodes[root.id] = { ...newNodes[root.id], x: centerX - 300, y: centerY };
      const children = nodes.filter(n => n.parentId === root.id);
      const leftChildren = children.slice(0, Math.ceil(children.length / 2));
      const rightChildren = children.slice(Math.ceil(children.length / 2));
      
      rightChildren.forEach((child, i) => {
        const cy = centerY + (i - (rightChildren.length - 1) / 2) * 100;
        newNodes[child.id] = { ...newNodes[child.id], x: centerX, y: cy - child.height / 2 };
        
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        grandChildren.forEach((gc, j) => {
          const gcy = cy + (j - (grandChildren.length - 1) / 2) * 60;
          newNodes[gc.id] = { ...newNodes[gc.id], x: centerX + 250, y: gcy - gc.height / 2 };
        });
      });
      
      leftChildren.forEach((child, i) => {
        const cy = centerY + (i - (leftChildren.length - 1) / 2) * 100;
        newNodes[child.id] = { ...newNodes[child.id], x: centerX - 500, y: cy - child.height / 2 };
        
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        grandChildren.forEach((gc, j) => {
          const gcy = cy + (j - (grandChildren.length - 1) / 2) * 60;
          newNodes[gc.id] = { ...newNodes[gc.id], x: centerX - 750, y: gcy - gc.height / 2 };
        });
      });
    } else if (type === 'tree-down') {
      newNodes[root.id] = { ...newNodes[root.id], x: centerX, y: centerY - 200 };
      const children = nodes.filter(n => n.parentId === root.id);
      
      children.forEach((child, i) => {
        const cx = centerX + (i - (children.length - 1) / 2) * 220;
        newNodes[child.id] = { ...newNodes[child.id], x: cx - child.width / 2, y: centerY };
        
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        grandChildren.forEach((gc, j) => {
          const gcx = cx + (j - (grandChildren.length - 1) / 2) * 160;
          newNodes[gc.id] = { ...newNodes[gc.id], x: gcx - gc.width / 2, y: centerY + 150 };
        });
      });
    } else if (type === 'logic') {
      // Logic layout - root on left, children branching right
      newNodes[root.id] = { ...newNodes[root.id], x: centerX - 300, y: centerY };
      const children = nodes.filter(n => n.parentId === root.id);
      
      children.forEach((child, i) => {
        const cy = centerY + (i - (children.length - 1) / 2) * 100;
        newNodes[child.id] = { ...newNodes[child.id], x: centerX, y: cy - child.height / 2 };
        
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        grandChildren.forEach((gc, j) => {
          const gcy = cy + (j - (grandChildren.length - 1) / 2) * 60;
          newNodes[gc.id] = { ...newNodes[gc.id], x: centerX + 250, y: gcy - gc.height / 2 };
        });
      });
    } else {
      // Organic layout
      newNodes[root.id] = { ...newNodes[root.id], x: centerX, y: centerY };
      const children = nodes.filter(n => n.parentId === root.id);
      const rightSide = children.filter((_, i) => i % 2 === 0);
      const leftSide = children.filter((_, i) => i % 2 !== 0);
      
      rightSide.forEach((child, i) => {
        const spread = (i - (rightSide.length - 1) / 2) * 110;
        newNodes[child.id] = { ...newNodes[child.id], x: centerX + 250, y: centerY + spread - child.height / 2 };
        
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        grandChildren.forEach((gc, j) => {
          const gcSpread = spread + (j - (grandChildren.length - 1) / 2) * 70;
          newNodes[gc.id] = { ...newNodes[gc.id], x: centerX + 500, y: centerY + gcSpread - gc.height / 2 };
        });
      });
      
      leftSide.forEach((child, i) => {
        const spread = (i - (leftSide.length - 1) / 2) * 110;
        newNodes[child.id] = { ...newNodes[child.id], x: centerX - 410, y: centerY + spread - child.height / 2 };
        
        const grandChildren = nodes.filter(n => n.parentId === child.id);
        grandChildren.forEach((gc, j) => {
          const gcSpread = spread + (j - (grandChildren.length - 1) / 2) * 70;
          newNodes[gc.id] = { ...newNodes[gc.id], x: centerX - 660, y: centerY + gcSpread - gc.height / 2 };
        });
      });
    }

    dispatch({ type: 'BATCH_UPDATE', payload: { nodes: newNodes, connections: state.connections } });
  }, [state.nodes, state.connections, state.layout]);

  const exportJSON = useCallback((): string => {
    return JSON.stringify({ nodes: state.nodes, connections: state.connections }, null, 2);
  }, [state.nodes, state.connections]);

  const importJSON = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes) {
        const rootId = Object.values(data.nodes as Record<string, MindNode>).find(n => !n.parentId)?.id || null;
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ...initialState,
            nodes: data.nodes,
            connections: data.connections || [],
            rootId,
          },
        });
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const exportAsImage = useCallback(() => {
    // Will be implemented in canvas component
    const event = new CustomEvent('export-image');
    window.dispatchEvent(event);
  }, []);

  const duplicateNode = useCallback((id: string) => {
    const node = state.nodes[id];
    if (!node) return;
    const newId = uuidv4();
    const newNode: MindNode = {
      ...node,
      id: newId,
      x: node.x + 30,
      y: node.y + 30,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_NODE', payload: { node: newNode } });
  }, [state.nodes]);

  const findNode = useCallback((id: string): MindNode | undefined => {
    return state.nodes[id];
  }, [state.nodes]);

  const searchNodes = useCallback((query: string): MindNode[] => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return Object.values(state.nodes).filter(
      n => n.text.toLowerCase().includes(lower) || (n.note && n.note.toLowerCase().includes(lower))
    );
  }, [state.nodes]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Auto-layout on first load
  React.useEffect(() => {
    if (!layoutApplied.current && state.rootId && Object.keys(state.nodes).length > 1) {
      layoutApplied.current = true;
      setTimeout(() => autoLayout(), 100);
    }
  }, [state.rootId, state.nodes, autoLayout]);

  const value: MindMapContextType = {
    state,
    dispatch,
    addNode,
    deleteNode,
    updateNode,
    selectNode,
    toggleCollapse,
    pushHistory,
    undo,
    redo,
    autoLayout,
    getChildren,
    getDescendants,
    getVisibleNodes,
    exportJSON,
    importJSON,
    exportAsImage,
    duplicateNode,
    findNode,
    searchNodes,
    toggleTheme,
    canUndo,
    canRedo,
  };

  return <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>;
}
