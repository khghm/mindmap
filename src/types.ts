export interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  children: string[];
  color: string;
  shape: 'rounded' | 'rectangle' | 'ellipse' | 'diamond';
  fontSize: number;
  icon?: string;
  note?: string;
  collapsed: boolean;
  width: number;
  height: number;
}

export interface Connection {
  from: string;
  to: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  width: number;
}

export interface MindMapState {
  nodes: Record<string, MindNode>;
  rootId: string | null;
  selectedNodeId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  theme: 'light' | 'dark';
  layout: 'radial' | 'tree-right' | 'tree-left' | 'organic';
}

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
}
