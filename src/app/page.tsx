'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DotVisualization } from 'react-dot-visualization';
import { VisualizationControls } from '@/components/visualization/controls';
import { CauseFilter } from '@/components/shared/cause-filter';
import { CoordinationPanel } from '@/components/coordination/panel';
import { NodeDetailsPanel } from '@/components/visualization/node-details-panel';
import { useVisualizationData } from '@/hooks/use-visualization-data';
import { useCoordinationOpportunities } from '@/hooks/use-coordination-opportunities';
import { Settings, X } from 'lucide-react';

export default function HomePage() {
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'force' | 'pca' | 'clusters'>('pca');
  const [showCoordinationPanel, setShowCoordinationPanel] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Visualization controls state
  const [showClusters, setShowClusters] = useState(true);
  const [showForces, setShowForces] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [nodeSize, setNodeSize] = useState(1);
  const [linkOpacity, setLinkOpacity] = useState(0.6);

  const { data, isLoading } = useVisualizationData({
    causes: selectedCauses,
    limit: 1000,
  });

  const { data: opportunities } = useCoordinationOpportunities({
    causes: selectedCauses,
    status: 'open',
  });

  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    // You can add more interaction logic here
  };

  const [hoveredNode, setHoveredNode] = useState<any>(null);

  const handleNodeHover = (node: any) => {
    // Transform data to match NodeDetailsPanel expectations
    const transformedNode = node ? {
      id: node.id,
      label: node.name,
      type: 'initiative',
      color: node.color,
      data: {
        description: node.description,
        stars: node.stars,
        forks: node.forks,
        url: node.url,
        cause: node.cause
      }
    } : null;
    setHoveredNode(transformedNode);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Main Visualization */}
      <div className="w-full h-full">
        <DotVisualization
          data={data?.data || []}
          onClick={handleNodeClick}
          onHover={handleNodeHover}
          onLeave={() => setHoveredNode(null)}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Node Details Panel for Hover */}
      <NodeDetailsPanel 
        node={hoveredNode} 
        onClose={() => setHoveredNode(null)} 
      />

      {/* Coordination Panel */}
      {showCoordinationPanel && (
        <CoordinationPanel
          opportunities={opportunities}
          onClose={() => setShowCoordinationPanel(false)}
        />
      )}
    </div>
  );
}