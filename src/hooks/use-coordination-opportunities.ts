import { useQuery } from '@tanstack/react-query';
import { CoordinationOpportunity } from '@/types/coordination';

interface UseCoordinationOpportunitiesParams {
  causes?: string[];
  status?: string;
  type?: string;
  limit?: number;
}

export function useCoordinationOpportunities(params: UseCoordinationOpportunitiesParams = {}) {
  return useQuery({
    queryKey: ['coordination-opportunities', params],
    queryFn: async (): Promise<CoordinationOpportunity[]> => {
      const searchParams = new URLSearchParams();
      if (params.causes?.length) {
        searchParams.append('causes', params.causes.join(','));
      }
      if (params.status) {
        searchParams.append('status', params.status);
      }
      if (params.type) {
        searchParams.append('type', params.type);
      }
      if (params.limit) {
        searchParams.append('limit', params.limit.toString());
      }

      const response = await fetch(`/api/coordination/opportunities?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coordination opportunities');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}