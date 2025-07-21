'use client';

import { useEffect, useRef } from 'react';
import { VisualizationNode, VisualizationEdge } from '@/types/visualization';
import { Loader2 } from 'lucide-react';

interface VisualizationCanvasProps {
  data?: {
    nodes: VisualizationNode[];
    edges: VisualizationEdge[];
    metrics: any;
  };
  isLoading?: boolean;
  viewMode: '2d' | '3d';
  onNodeClick?: (node: VisualizationNode) => void;
}

export function VisualizationCanvas({
  data,
  isLoading,
  viewMode,
  onNodeClick,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw nodes
    data.nodes.forEach((node) => {
      if (!node.visible) return;

      const x = (node.x || 0) * canvas.width * 0.8 + canvas.width * 0.1;
      const y = (node.y || 0) * canvas.height * 0.8 + canvas.height * 0.1;
      const size = Math.max(4, Math.min(20, node.size));

      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#3b82f6';
      ctx.globalAlpha = node.opacity || 1;
      ctx.fill();

      // Draw label if node is large enough
      if (size > 8) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.min(12, size)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + size + 12);
      }
    });

    // Draw edges
    data.edges.forEach((edge) => {
      if (!edge.visible) return;

      const sourceNode = data.nodes.find((n) => n.id === edge.source);
      const targetNode = data.nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const x1 = (sourceNode.x || 0) * canvas.width * 0.8 + canvas.width * 0.1;
      const y1 = (sourceNode.y || 0) * canvas.height * 0.8 + canvas.height * 0.1;
      const x2 = (targetNode.x || 0) * canvas.width * 0.8 + canvas.width * 0.1;
      const y2 = (targetNode.y || 0) * canvas.height * 0.8 + canvas.height * 0.1;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = edge.color || '#374151';
      ctx.lineWidth = Math.max(1, edge.weight * 3);
      ctx.globalAlpha = 0.6;
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  }, [data, viewMode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data || !canvasRef.current || !onNodeClick) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = data.nodes.find((node) => {
      const nodeX = (node.x || 0) * canvas.width * 0.8 + canvas.width * 0.1;
      const nodeY = (node.y || 0) * canvas.height * 0.8 + canvas.height * 0.1;
      const size = Math.max(4, Math.min(20, node.size));
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      return distance <= size;
    });

    if (clickedNode) {
      onNodeClick(clickedNode);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading visualization...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No initiatives or coordination opportunities found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-pointer"
        onClick={handleCanvasClick}
      />
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur rounded-lg p-3">
        <h3 className="font-medium mb-2">Visualization</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Nodes: {data.nodes.length}</div>
          <div>Edges: {data.edges.length}</div>
          <div>Mode: {viewMode.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}