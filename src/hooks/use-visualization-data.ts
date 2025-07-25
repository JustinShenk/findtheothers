import { useQuery } from '@tanstack/react-query';

interface DotVisualizationData {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  url: string;
  cause: string;
}

interface SimpleVisualizationResponse {
  data: DotVisualizationData[];
  metadata: {
    totalCount: number;
    pcaExplainedVariance: number[];
    method: string;
  };
}

interface UseVisualizationDataParams {
  limit?: number;
}

export function useVisualizationData(params: UseVisualizationDataParams = {}) {
  return useQuery({
    queryKey: ['simple-visualization-data', params],
    queryFn: async (): Promise<SimpleVisualizationResponse> => {
      const searchParams = new URLSearchParams();
      if (params.limit) {
        searchParams.append('limit', params.limit.toString());
      }

      const response = await fetch(`/api/visualization/simple?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visualization data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}