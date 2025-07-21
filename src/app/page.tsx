'use client';

import { useState } from 'react';
import { AdvancedCanvas } from '@/components/visualization/advanced-canvas';
import { VisualizationControls } from '@/components/visualization/controls';
import { CauseFilter } from '@/components/shared/cause-filter';
import { ImpactMetrics } from '@/components/shared/impact-metrics';
import { CoordinationPanel } from '@/components/coordination/panel';
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

  const handleNodeHover = (node: any) => {
    // Handle node hover
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <CauseFilter
          selected={selectedCauses}
          onChange={setSelectedCauses}
        />
        <div className="hidden sm:block">
          <ImpactMetrics data={data?.metrics} />
        </div>
      </div>
      
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2 rounded-lg bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
          title="Toggle Controls"
        >
          <Settings className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => setShowCoordinationPanel(!showCoordinationPanel)}
          className="rounded-lg bg-primary/20 backdrop-blur-sm border border-primary/30 px-4 py-2 text-primary-foreground shadow-lg transition-all hover:bg-primary/30"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
            {opportunities?.length || 0} Coordination Opportunities
          </span>
        </button>
      </div>

      {/* Visualization Controls Panel */}
      {showControls && (
        <div className="absolute top-16 right-4 z-30">
          <div className="relative">
            <button
              onClick={() => setShowControls(false)}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <VisualizationControls
              showClusters={showClusters}
              onToggleClusters={() => setShowClusters(!showClusters)}
              showForces={showForces}
              onToggleForces={() => setShowForces(!showForces)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              animationSpeed={animationSpeed}
              onAnimationSpeedChange={setAnimationSpeed}
              nodeSize={nodeSize}
              onNodeSizeChange={setNodeSize}
              linkOpacity={linkOpacity}
              onLinkOpacityChange={setLinkOpacity}
            />
          </div>
        </div>
      )}

      {/* Main Visualization */}
      <AdvancedCanvas
        data={data}
        isLoading={isLoading}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
      />
      
      {/* Coordination Panel */}
      {showCoordinationPanel && (
        <CoordinationPanel
          opportunities={opportunities}
          onClose={() => setShowCoordinationPanel(false)}
        />
      )}

      {/* Welcome Message - Only show when no causes are selected */}
      {!isLoading && selectedCauses.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Find the Others</h2>
            <p className="text-lg mb-6 text-gray-300">
              Select a cause above to discover your community
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Use PCA to reveal hidden patterns in the data</p>
              <p>• Automatic clustering finds related projects</p>
              <p>• Pan, zoom, and rotate to explore in 3D</p>
              <p>• Click nodes to discover coordination opportunities</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Info */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-400">Nodes:</span> {data?.nodes?.length || 0}
          </div>
          <div>
            <span className="text-gray-400">Edges:</span> {data?.edges?.length || 0}
          </div>
          <div>
            <span className="text-gray-400">Mode:</span> {viewMode.toUpperCase()}
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-gray-400">{isLoading ? 'Loading' : 'Ready'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}