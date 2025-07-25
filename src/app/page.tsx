'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DotVisualization } from 'react-dot-visualization';
import { VisualizationControls } from '@/components/visualization/controls';
import { CauseFilter } from '@/components/shared/cause-filter';
import { CoordinationPanel } from '@/components/coordination/panel';
import { NodeDetailsPanel } from '@/components/visualization/node-details-panel';
import { useVisualizationData } from '@/hooks/use-visualization-data';
import { useCoordinationOpportunities } from '@/hooks/use-coordination-opportunities';
import { Settings } from 'lucide-react';

function HomePageContent() {
  const searchParams = useSearchParams();
  const [selectedCause, setSelectedCause] = useState<string>('');
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
        causes: selectedCause ? [selectedCause] : undefined,
    dimReduction: searchParams.get('dimreduction') as 'pca' | 'trunc' | null || undefined,
  });

  const { data: opportunities } = useCoordinationOpportunities({
    causes: selectedCause ? [selectedCause] : [],
    status: 'open',
  });

  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [pinnedNodes, setPinnedNodes] = useState<any[]>([]);

  const transformNode = (node: any) => node ? {
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

  const handleNodeHover = (node: any) => {
    setHoveredNode(transformNode(node));
  };

  const handleNodeClick = (node: any) => {
    const transformedNode = transformNode(node);
    if (!transformedNode) return;

    // Don't add if already pinned
    if (pinnedNodes.some(pinned => pinned.id === transformedNode.id)) return;

    // Add to pinned nodes (max 3)
    setPinnedNodes(prev => {
      if (prev.length >= 3) {
        // Replace the oldest (first) with the new one
        return [...prev.slice(1), transformedNode];
      }
      return [...prev, transformedNode];
    });
  };

  const handleRemovePinned = (nodeId: string) => {
    setPinnedNodes(prev => prev.filter(node => node.id !== nodeId));
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

      {/* Pinned and Hover Panels */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-3">
        {/* Pinned Panels */}
        {pinnedNodes.map((node) => (
          <NodeDetailsPanel
            key={node.id}
            node={node}
            onClose={() => handleRemovePinned(node.id)}
          />
        ))}
        
        {/* Hover Preview Panel */}
        {hoveredNode && !pinnedNodes.some(pinned => pinned.id === hoveredNode.id) && (
          <NodeDetailsPanel
            node={hoveredNode}
            onClose={() => setHoveredNode(null)}
          />
        )}
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-30 flex gap-3">
        <CauseFilter
          selected={selectedCause}
          onChange={setSelectedCause}
        />
      </div>

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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <HomePageContent />
    </Suspense>
  );
}