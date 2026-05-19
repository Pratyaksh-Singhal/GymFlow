import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';

export type Package = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  isActive: boolean;
};

export function usePackages(tenantId: string) {
  return useQuery({
    queryKey: ['packages', tenantId],
    queryFn: async () => {
      const response = await fetchJson<{ success: boolean; data: Package[] }>(
        `/api/tenants/${tenantId}/packages`
      );
      return response.data;
    },
    enabled: !!tenantId,
  });
}
