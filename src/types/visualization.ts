export interface VisualizationNode {
  id: string;
  type: 'initiative' | 'cause' | 'contributor' | 'cluster';
  label: string;
  x?: number;
  y?: number;
  z?: number;
  size: number;
  color: string;
  icon?: string;
  data: any;
  visible: boolean;
  highlighted: boolean;
  opacity: number;
  isOutlier?: boolean;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  label?: string;
  color?: string;
  visible: boolean;
  curved?: boolean;
}

export type EdgeType = 
  | 'collaboration'
  | 'mentorship'
  | 'dependency'
  | 'similarity'
  | 'impact';

export interface VisualizationConfig {
  layout: LayoutType;
  dimensions: '2d' | '3d';
  theme: 'light' | 'dark';
  showLabels: boolean;
  showEdges: boolean;
  animationSpeed: number;
  particleEffects: boolean;
  clustering: ClusteringConfig;
  filters: VisualizationFilter[];
  colorScheme: ColorScheme;
}

export type LayoutType = 
  | 'force-directed'
  | 'hierarchical'
  | 'circular'
  | 'grid'
  | 'geographic';

export interface ClusteringConfig {
  enabled: boolean;
  method: 'cause' | 'impact' | 'collaboration' | 'similarity';
  threshold: number;
  maxClusters: number;
}

export interface VisualizationFilter {
  id: string;
  type: 'cause' | 'impact' | 'activity' | 'contributor' | 'platform';
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
  enabled: boolean;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  causeColors: { [key: string]: string };
  gradients: GradientConfig[];
}

export interface GradientConfig {
  name: string;
  colors: string[];
  stops: number[];
}

export interface ViewState {
  camera: CameraState;
  selection: string[];
  hover?: string;
  zoom: number;
  center: { x: number; y: number; z?: number };
  rotation?: { x: number; y: number; z: number };
}

export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
  fov: number;
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'drag' | 'zoom' | 'pan';
  target?: string;
  position: { x: number; y: number };
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
  timestamp: Date;
}

export interface VisualizationMetrics {
  nodeCount: number;
  edgeCount: number;
  clusterCount: number;
  density: number;
  avgDegree: number;
  maxDegree: number;
  connectedComponents: number;
  renderTime: number;
  fps: number;
}

export interface HeatmapData {
  causes: string[];
  metrics: HeatmapMetric[];
  values: number[][];
  colorScale: ColorScale;
}

export interface HeatmapMetric {
  name: string;
  type: 'activity' | 'impact' | 'growth' | 'collaboration';
  aggregation: 'sum' | 'avg' | 'max' | 'min';
}

export interface ColorScale {
  type: 'sequential' | 'diverging' | 'categorical';
  domain: [number, number];
  range: string[];
  midpoint?: number;
}

export interface TimelineData {
  events: TimelineEvent[];
  periods: TimePeriod[];
  scale: 'hours' | 'days' | 'weeks' | 'months' | 'years';
  startDate: Date;
  endDate: Date;
}

export interface TimelineEvent {
  id: string;
  type: 'milestone' | 'launch' | 'collaboration' | 'achievement';
  title: string;
  description?: string;
  date: Date;
  causeId?: string;
  initiativeId?: string;
  impact?: number;
}

export interface TimePeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  opacity: number;
}