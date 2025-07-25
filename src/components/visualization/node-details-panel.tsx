'use client';

import { VisualizationNode } from '@/types/visualization';
import { X, Star, GitFork, ExternalLink } from 'lucide-react';

interface NodeDetailsPanelProps {
  node: VisualizationNode;
  onClose?: () => void;
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  return (
    <div className="w-80 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 text-white">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{node.label}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: node.color }}
          />
          <span className="text-sm text-gray-300 capitalize">{node.type}</span>
        </div>

        {node.data?.description && (
          <p className="text-sm text-gray-300">{node.data.description}</p>
        )}

        {node.data?.stars && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{node.data.stars.toLocaleString()}</span>
            </div>
            {node.data.forks && (
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4 text-gray-400" />
                <span>{node.data.forks.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {node.data?.languages && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Languages:</p>
            <div className="flex flex-wrap gap-1">
              {node.data.languages.slice(0, 3).map((lang: string) => (
                <span 
                  key={lang}
                  className="px-2 py-1 bg-gray-700 rounded text-xs"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.data?.clusterLabel && (
          <div>
            <p className="text-xs font-medium text-gray-400">Cluster:</p>
            <p className="text-sm">{node.data.clusterLabel}</p>
          </div>
        )}

        {node.data?.url && (
          <a
            href={node.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        )}
      </div>
    </div>
  );
}