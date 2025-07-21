'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { VisualizationNode, VisualizationEdge } from '@/types/visualization';
import { DimensionReduction, AnalyticsResult } from '@/lib/analytics/dimension-reduction';
import { Play, Pause, RotateCcw, Settings, Layers, Zap } from 'lucide-react';

interface AdvancedCanvasProps {
  data?: {
    nodes: VisualizationNode[];
    edges: VisualizationEdge[];
    metrics: any;
  };
  isLoading?: boolean;
  onNodeClick?: (node: VisualizationNode) => void;
  onNodeHover?: (node: VisualizationNode | null) => void;
}

export function AdvancedCanvas({ data, isLoading, onNodeClick, onNodeHover }: AdvancedCanvasProps) {
  const fgRef = useRef<any>();
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsResult | null>(null);
  const [showClusters, setShowClusters] = useState(true);
  const [showForces, setShowForces] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [dimensionReduction] = useState(new DimensionReduction());
  const [viewMode, setViewMode] = useState<'force' | 'pca' | 'clusters'>('pca');
  const [hoveredNode, setHoveredNode] = useState<VisualizationNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<VisualizationNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Apply PCA and clustering when data changes
  useEffect(() => {
    if (data?.nodes && data.nodes.length > 0) {
      const result = dimensionReduction.applyPCA(data.nodes, 2);
      setAnalyticsResult(result);
    }
  }, [data]);

  // Initialize force simulation when switching modes
  useEffect(() => {
    if (fgRef.current && viewMode === 'force') {
      console.log('Initializing force simulation');
      // Access the force simulation
      const fg = fgRef.current;
      
      // Set up forces
      fg.d3Force('link')
        ?.distance(100)
        ?.strength(0.5);
        
      fg.d3Force('charge')
        ?.strength(-300)
        ?.distanceMax(500);
        
      fg.d3Force('center')
        ?.strength(0.1);
        
      // Reheat the simulation
      fg.d3ReheatSimulation();
      console.log('Force simulation started');
    }
  }, [viewMode]);

  // Handle initial zoom only once when component mounts with data
  useEffect(() => {
    if (fgRef.current && analyticsResult && viewMode === 'pca') {
      // Small delay to ensure the graph is rendered
      const timer = setTimeout(() => {
        fgRef.current?.zoomToFit(800, 50); // Increased padding for better view
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [analyticsResult?.nodes.length]); // Only trigger on initial data load

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleNodeHover = useCallback((node: any) => {
    // Only update state if the hovered node actually changed
    setHoveredNode(prev => {
      if (prev?.id === node?.id) return prev;
      return node;
    });
    onNodeHover?.(node);
  }, [onNodeHover]);

  const resetCamera = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000);
    }
  }, []);

  const toggleAnimation = useCallback(() => {
    if (fgRef.current) {
      const engine = fgRef.current.d3Force('link');
      if (engine) {
        if (showForces) {
          engine.alpha(0);
        } else {
          engine.alpha(0.3).restart();
        }
      }
    }
    setShowForces(!showForces);
  }, [showForces]);

  // Custom node rendering with cluster colors
  const nodeThreeObject = useCallback((node: any) => {
    try {
      // Create base sprite without hover/selection state
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(createNodeTexture(node, false, false)),
          transparent: true,
          alphaTest: 0.1,
        })
      );
      // Scale bubbles for better visibility, with minimum and maximum sizes
      const scaleFactor = 1.5; // Moderate size increase
      const minSize = 8; // Minimum bubble size
      const maxSize = 30; // Maximum bubble size
      const scaledSize = Math.max(minSize, Math.min(maxSize, node.size * scaleFactor));
      sprite.scale.set(scaledSize, scaledSize, 1);
      
      // Store original material for hover effects
      sprite.userData = { 
        originalScale: sprite.scale.clone(),
        nodeId: node.id 
      };
      
      return sprite;
    } catch (error) {
      console.error('Failed to create node sprite:', error);
      // Return a simple mesh as fallback
      const geometry = new THREE.SphereGeometry(node.size || 5);
      const material = new THREE.MeshBasicMaterial({ color: node.color });
      return new THREE.Mesh(geometry, material);
    }
  }, []);

  // Create node texture
  const createNodeTexture = (node: VisualizationNode, isHovered: boolean = false, isSelected: boolean = false) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 64;
    canvas.height = 64;
    
    const radius = 30;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();
    
    // Add border if selected or hovered
    if (isSelected || isHovered) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    // Add type indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const typeIcon = node.type === 'cause' ? '◆' : 
                     node.type === 'initiative' ? '●' : 
                     node.type === 'contributor' ? '▲' : '■';
    
    ctx.fillText(typeIcon, centerX, centerY);
    
    return canvas;
  };

  // Custom link rendering
  const linkThreeObject = useCallback((link: any) => {
    try {
      const line = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      positions[0] = link.source.x || 0;
      positions[1] = link.source.y || 0;
      positions[2] = link.source.z || 0;
      positions[3] = link.target.x || 0;
      positions[4] = link.target.y || 0;
      positions[5] = link.target.z || 0;
      
      line.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: link.color || 0x999999,
        transparent: true,
        opacity: (link.weight || 0.5) * 0.8,
      });
      
      return new THREE.Line(line, material);
    } catch (error) {
      console.error('Failed to create link line:', error);
      return null;
    }
  }, []);

  // Memoize graph data before conditional returns
  const graphData = useMemo(() => {
    if (!analyticsResult?.nodes || !data?.edges) {
      return { nodes: [], links: [] };
    }
    
    // In force mode, remove fixed positions
    const nodes = viewMode === 'force' 
      ? analyticsResult.nodes.map(node => ({
          ...node,
          fx: undefined, // Remove fixed x position
          fy: undefined, // Remove fixed y position
          fz: undefined  // Remove fixed z position
        }))
      : analyticsResult.nodes;
    
    return {
      nodes,
      links: data.edges.map(edge => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      })),
    };
  }, [analyticsResult?.nodes, data?.edges, viewMode]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Processing data with PCA...</p>
        </div>
      </div>
    );
  }

  if (!data || !analyticsResult) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <h3 className="text-xl font-semibold mb-2">No data available</h3>
          <p className="text-gray-300">Load data to see the visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Visualization Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('pca')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'pca' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            PCA View
          </button>
          <button
            onClick={() => setViewMode('clusters')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'clusters' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Clusters
          </button>
          <button
            onClick={() => {
              setViewMode('force');
              // Restart force simulation when switching to force mode
              if (fgRef.current) {
                fgRef.current.d3ReheatSimulation();
              }
            }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'force' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Force
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAnimation}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title={showForces ? 'Pause Animation' : 'Start Animation'}
          >
            {showForces ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={resetCamera}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`p-2 rounded transition-colors ${
              showClusters 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Toggle Clusters"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Analytics Info */}
      <div className="absolute top-4 right-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="font-semibold mb-2">Analytics</h3>
        <div className="space-y-1 text-sm">
          <div>Nodes: {analyticsResult.nodes.length}</div>
          <div>Clusters: {analyticsResult.clusters.length}</div>
          <div>PCA Variance: {(analyticsResult.pcaVariance[0] * 100).toFixed(1)}%</div>
          <div>Mode: {viewMode.toUpperCase()}</div>
        </div>
      </div>

      {/* Cluster Legend */}
      {showClusters && analyticsResult.clusters.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-2">Clusters</h3>
          <div className="space-y-1 text-sm">
            {analyticsResult.clusters.map(cluster => (
              <div key={cluster.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                />
                <span>{cluster.label} ({cluster.size})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <h3 className="font-semibold mb-2">{selectedNode.label}</h3>
          <div className="space-y-1 text-sm">
            <div>Type: {selectedNode.type}</div>
            {selectedNode.data?.stars && (
              <div>Stars: {selectedNode.data.stars.toLocaleString()}</div>
            )}
            {selectedNode.data?.clusterLabel && (
              <div>Cluster: {selectedNode.data.clusterLabel}</div>
            )}
            {selectedNode.data?.description && (
              <div className="mt-2 text-gray-300">
                {selectedNode.data.description.slice(0, 100)}...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Force Graph (configured for 2D PCA) */}
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeThreeObject={nodeThreeObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        enableNodeDrag={viewMode === 'force'}
        enableNavigationControls={true}
        controlType="orbit"
        showNavInfo={false}
        nodeRelSize={1}
        linkWidth={1}
        linkOpacity={0.4}
        d3AlphaMin={viewMode === 'force' ? 0.01 : 0}
        d3AlphaDecay={viewMode === 'force' ? 0.02 : 0}
        d3VelocityDecay={viewMode === 'force' ? 0.4 : 0}
        warmupTicks={viewMode === 'force' ? 100 : 0}
        cooldownTicks={viewMode === 'force' ? 200 : 0}
        cooldownTime={viewMode === 'force' ? 15000 : 0}
        nodeOpacity={0.9}
        enablePointerInteraction={true}
        forceEngine={viewMode === 'force' ? 'd3' : undefined}
      />
    </div>
  );
}