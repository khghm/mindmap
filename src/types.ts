export interface MindNode {
  id: string;
  parentId: string | null;
  text: string;
  note?: string;
  emoji?: string;
  color: string;
  textColor?: string;
  shape: 'rounded' | 'pill' | 'rectangle' | 'diamond' | 'hexagon' | 'cloud';
  fontSize: number;
  fontWeight?: 'normal' | 'bold';
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  progress?: number; // 0-100
  link?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  style: 'bezier' | 'straight' | 'step' | 'smooth';
  color: string;
  width: number;
  animated: boolean;
  label?: string;
}

export interface MindMapState {
  nodes: Record<string, MindNode>;
  connections: Connection[];
  rootId: string | null;
  selectedNodeId: string | null;
  multiSelectedIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  theme: 'dark' | 'light';
  layout: 'organic' | 'radial' | 'tree-right' | 'tree-left' | 'tree-down' | 'logic';
  connectionStyle: Connection['style'];
  showGrid: boolean;
  gridSize: number;
  showMiniMap: boolean;
  showProperties: boolean;
  searchQuery: string;
  clipboard: string[];
  history: HistoryEntry[];
  historyIndex: number;
  presentationMode: boolean;
  presentationIndex: number;
}

export interface HistoryEntry {
  nodes: Record<string, MindNode>;
  connections: Connection[];
  timestamp: number;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  nodes: Partial<MindNode>[];
  connections: Partial<Connection>[];
}

export type LayoutType = MindMapState['layout'];
export type ShapeType = MindNode['shape'];
export type ThemeType = MindMapState['theme'];
