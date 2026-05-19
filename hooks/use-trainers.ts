import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';
import { toast } from 'sonner';

export type Trainer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: string;
  _count?: {
    assignedMembers: number;
  };
};

export function useTrainers(tenantId: string) {
  return useQuery({
    queryKey: ['trainers', tenantId],
    queryFn: async () => {
      const response = await fetchJson<{ success: boolean; data: Trainer[] }>(
        `/api/tenants/${tenantId}/trainers`
      );
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function useDeleteTrainer(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trainerId: string) => {
      return fetchJson(`/api/tenants/${tenantId}/trainers?trainerId=${trainerId}`, undefined, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers', tenantId] });
      toast.success('Coach removed successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove coach.');
    },
  });
}
