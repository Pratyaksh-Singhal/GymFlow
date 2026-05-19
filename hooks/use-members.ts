import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';
import { Member } from '@/components/dashboard/member-table';

interface MembersResponse {
  success: boolean;
  data: Member[];
}

export function useMembers(
  tenantId: string,
  filters?: {
    status?: string;
    trainerId?: string;
    packageId?: string;
    search?: string;
  }
) {
  return useQuery({
    queryKey: ['members', tenantId, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.trainerId) queryParams.append('trainerId', filters.trainerId);
      if (filters?.packageId) queryParams.append('packageId', filters.packageId);
      if (filters?.search) queryParams.append('search', filters.search);

      const url = `/api/tenants/${tenantId}/members?${queryParams.toString()}`;
      const response = await fetchJson<MembersResponse>(url);
      return response.data;
    },
    enabled: !!tenantId,
  });
}
