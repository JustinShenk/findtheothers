'use client';

import React from 'react';
import { Settings, Sliders, Eye, EyeOff, Zap, BarChart3 } from 'lucide-react';

interface VisualizationControlsProps {
  showClusters: boolean;
  onToggleClusters: () => void;
  showForces: boolean;
  onToggleForces: () => void;
  viewMode: 'force' | 'pca' | 'clusters';
  onViewModeChange: (mode: 'force' | 'pca' | 'clusters') => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  nodeSize: number;
  onNodeSizeChange: (size: number) => void;
  linkOpacity: number;
  onLinkOpacityChange: (opacity: number) => void;
}

export function VisualizationControls({
  showClusters,
  onToggleClusters,
  showForces,
  onToggleForces,
  viewMode,
  onViewModeChange,
  animationSpeed,
  onAnimationSpeedChange,
  nodeSize,
  onNodeSizeChange,
  linkOpacity,
  onLinkOpacityChange,
}: VisualizationControlsProps) {
  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-4 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-5 w-5" />
        <h3 className="font-semibold">Visualization Controls</h3>
      </div>

      {/* View Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">View Mode</label>
        <div className="flex gap-1">
          <button
            onClick={() => onViewModeChange('pca')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'pca' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            PCA
          </button>
          <button
            onClick={() => onViewModeChange('clusters')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'clusters' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-1" />
            Clusters
          </button>
          <button
            onClick={() => onViewModeChange('force')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'force' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Zap className="h-4 w-4 inline mr-1" />
            Force
          </button>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Clusters</label>
          <button
            onClick={onToggleClusters}
            className={`p-2 rounded transition-colors ${
              showClusters 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {showClusters ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Animation</label>
          <button
            onClick={onToggleForces}
            className={`p-2 rounded transition-colors ${
              showForces 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Animation Speed</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => onAnimationSpeedChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
              {animationSpeed.toFixed(1)}x
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Node Size</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={nodeSize}
              onChange={(e) => onNodeSizeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
              {nodeSize.toFixed(1)}x
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Link Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={linkOpacity}
              onChange={(e) => onLinkOpacityChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
              {Math.round(linkOpacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-3 border-t border-gray-600">
        <h4 className="text-sm font-medium mb-2">Controls</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Mouse: Rotate camera</div>
          <div>• Scroll: Zoom in/out</div>
          <div>• Right-click: Pan</div>
          <div>• Click nodes: Select</div>
          <div>• Drag nodes: Reposition</div>
        </div>
      </div>
    </div>
  );
}