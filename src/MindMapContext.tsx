import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { MindNode, MindMapState } from './types';
import { v4 as uuidv4 } from 'uuid';

const NODE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

const initialState: MindMapState = {
  nodes: {},
  rootId: null,
  selectedNodeId: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  theme: 'dark',
  layout: 'organic',
};

type Action =
  | { type: 'ADD_NODE'; payload: { parentId: string | null; text?: string; x?: number; y?: number } }
  | { type: 'DELETE_NODE'; payload: { nodeId: string } }
  | { type: 'UPDATE_NODE'; payload: { nodeId: string; updates: Partial<MindNode> } }
  | { type: 'SELECT_NODE'; payload: { nodeId: string | null } }
  | { type: 'SET_ZOOM'; payload: { zoom: number } }
  | { type: 'SET_PAN'; payload: { panX: number; panY: number } }
  | { type: 'SET_THEME'; payload: { theme: 'light' | 'dark' } }
  | { type: 'SET_LAYOUT'; payload: { layout: MindMapState['layout'] } }
  | { type: 'TOGGLE_COLLAPSE'; payload: { nodeId: string } }
  | { type: 'LOAD_STATE'; payload: MindMapState }
  | { type: 'AUTO_LAYOUT' };

function getDescendants(nodeId: string, nodes: Record<string, MindNode>): string[] {
  const result: string[] = [];
  const node = nodes[nodeId];
  if (!node) return result;
  for (const childId of node.children) {
    result.push(childId);
    result.push(...getDescendants(childId, nodes));
  }
  return result;
}

function reducer(state: MindMapState, action: Action): MindMapState {
  switch (action.type) {
    case 'ADD_NODE': {
      const { parentId, text = 'ایده جدید', x, y } = action.payload;
      const id = uuidv4();
      const color = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
      
      const newNode: MindNode = {
        id,
        text,
        x: x ?? (parentId && state.nodes[parentId] ? state.nodes[parentId].x + 200 : 400),
        y: y ?? (parentId && state.nodes[parentId] ? state.nodes[parentId].y + (Math.random() - 0.5) * 100 : 300),
        parentId,
        children: [],
        color,
        shape: 'rounded',
        fontSize: parentId ? 14 : 18,
        collapsed: false,
        width: 180,
        height: 50,
      };

      const newNodes = { ...state.nodes, [id]: newNode };
      
      if (parentId && newNodes[parentId]) {
        newNodes[parentId] = {
          ...newNodes[parentId],
          children: [...newNodes[parentId].children, id],
        };
      }

      const rootId = state.rootId ?? id;
      return { ...state, nodes: newNodes, rootId, selectedNodeId: id };
    }

    case 'DELETE_NODE': {
      const { nodeId } = action.payload;
      if (nodeId === state.rootId) return state;
      
      const descendants = getDescendants(nodeId, state.nodes);
      const toDelete = new Set([nodeId, ...descendants]);
      
      const newNodes: Record<string, MindNode> = {};
      for (const [id, node] of Object.entries(state.nodes)) {
        if (!toDelete.has(id)) {
          newNodes[id] = {
            ...node,
            children: node.children.filter(c => !toDelete.has(c)),
          };
        }
      }

      return {
        ...state,
        nodes: newNodes,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      };
    }

    case 'UPDATE_NODE': {
      const { nodeId, updates } = action.payload;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [nodeId]: { ...state.nodes[nodeId], ...updates },
        },
      };
    }

    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload.nodeId };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.2, Math.min(3, action.payload.zoom)) };

    case 'SET_PAN':
      return { ...state, panX: action.payload.panX, panY: action.payload.panY };

    case 'SET_THEME':
      return { ...state, theme: action.payload.theme };

    case 'SET_LAYOUT':
      return { ...state, layout: action.payload.layout };

    case 'TOGGLE_COLLAPSE': {
      const { nodeId } = action.payload;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [nodeId]: { ...state.nodes[nodeId], collapsed: !state.nodes[nodeId].collapsed },
        },
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    case 'AUTO_LAYOUT': {
      if (!state.rootId) return state;
      const newNodes = { ...state.nodes };
      
      function layoutTree(nodeId: string, x: number, y: number, level: number) {
        const node = newNodes[nodeId];
        if (!node) return;
        
        newNodes[nodeId] = { ...node, x, y };
        
        const visibleChildren = node.children.filter(id => newNodes[id]);
        const totalHeight = visibleChildren.length * 100;
        let currentY = y - totalHeight / 2 + 50;
        
        for (const childId of visibleChildren) {
          layoutTree(childId, x + 250, currentY, level + 1);
          currentY += 100;
        }
      }
      
      layoutTree(state.rootId, 200, 400, 0);
      return { ...state, nodes: newNodes, panX: 0, panY: 0, zoom: 1 };
    }

    default:
      return state;
  }
}

interface MindMapContextType {
  state: MindMapState;
  dispatch: React.Dispatch<Action>;
  addNode: (parentId: string | null, text?: string, x?: number, y?: number) => void;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  selectNode: (nodeId: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  toggleTheme: () => void;
  toggleCollapse: (nodeId: string) => void;
  autoLayout: () => void;
  setLayout: (layout: MindMapState['layout']) => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  exportAsJSON: () => string;
  importFromJSON: (json: string) => void;
}

const MindMapContext = createContext<MindMapContextType | null>(null);

export function MindMapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addNode = useCallback((parentId: string | null, text?: string, x?: number, y?: number) => {
    dispatch({ type: 'ADD_NODE', payload: { parentId, text, x, y } });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    dispatch({ type: 'DELETE_NODE', payload: { nodeId } });
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<MindNode>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { nodeId, updates } });
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: { nodeId } });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: { zoom } });
  }, []);

  const setPan = useCallback((panX: number, panY: number) => {
    dispatch({ type: 'SET_PAN', payload: { panX, panY } });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: { theme: state.theme === 'dark' ? 'light' : 'dark' } });
  }, [state.theme]);

  const toggleCollapse = useCallback((nodeId: string) => {
    dispatch({ type: 'TOGGLE_COLLAPSE', payload: { nodeId } });
  }, []);

  const autoLayout = useCallback(() => {
    dispatch({ type: 'AUTO_LAYOUT' });
  }, []);

  const setLayout = useCallback((layout: MindMapState['layout']) => {
    dispatch({ type: 'SET_LAYOUT', payload: { layout } });
  }, []);

  const saveToStorage = useCallback(() => {
    localStorage.setItem('mindmap-state', JSON.stringify(state));
  }, [state]);

  const loadFromStorage = useCallback(() => {
    const saved = localStorage.getItem('mindmap-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  const exportAsJSON = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importFromJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      dispatch({ type: 'LOAD_STATE', payload: parsed });
    } catch (e) {
      console.error('Failed to import state:', e);
    }
  }, []);

  return (
    <MindMapContext.Provider value={{
      state,
      dispatch,
      addNode,
      deleteNode,
      updateNode,
      selectNode,
      setZoom,
      setPan,
      toggleTheme,
      toggleCollapse,
      autoLayout,
      setLayout,
      saveToStorage,
      loadFromStorage,
      exportAsJSON,
      importFromJSON,
    }}>
      {children}
    </MindMapContext.Provider>
  );
}

export function useMindMap() {
  const context = useContext(MindMapContext);
  if (!context) throw new Error('useMindMap must be used within MindMapProvider');
  return context;
}
