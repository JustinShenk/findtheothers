import { useQuery } from '@tanstack/react-query';
import { VisualizationNode, VisualizationEdge } from '@/types/visualization';

interface VisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  metrics: {
    totalNodes: number;
    totalEdges: number;
    causes: number;
    initiatives: number;
    contributors: number;
  };
}

interface UseVisualizationDataParams {
  causes?: string[];
  limit?: number;
  includeEdges?: boolean;
}

export function useVisualizationData(params: UseVisualizationDataParams = {}) {
  return useQuery({
    queryKey: ['visualization-data', params],
    queryFn: async (): Promise<VisualizationData> => {
      const searchParams = new URLSearchParams();
      if (params.causes?.length) {
        searchParams.append('causes', params.causes.join(','));
      }
      if (params.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params.includeEdges !== undefined) {
        searchParams.append('includeEdges', params.includeEdges.toString());
      }

      const response = await fetch(`/api/visualization/data?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visualization data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}