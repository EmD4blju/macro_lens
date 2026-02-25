import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

interface HealthResponse {
  status: string;
  message: string;
}

export const useHealth = () => {
  return useQuery<HealthResponse>({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      const response = await api.get('/api/health-check');
      return response.data;
    },
    refetchInterval: 30000, 
  });
};