import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';
import { toast } from 'sonner';

export type MemberDetails = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'paused' | 'deactivated';
  joinedDate: string;
  assignedTrainerId: string | null;
  assignedTrainer: {
    id: string;
    name: string;
    email: string;
  } | null;
  membershipInstances: Array<{
    id: string;
    startDate: string;
    renewalDate: string;
    status: string;
    package: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  fees: Array<{
    id: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    paidDate: string | null;
    paymentMethod: string | null;
    transactionId: string | null;
    membershipInstance?: {
      package?: {
        name: string;
      };
    };
  }>;
};

export function useMember(tenantId: string, memberId: string) {
  return useQuery({
    queryKey: ['member', tenantId, memberId],
    queryFn: async () => {
      const response = await fetchJson<{ success: boolean; data: MemberDetails }>(
        `/api/tenants/${tenantId}/members/${memberId}`
      );
      return response.data;
    },
    enabled: !!tenantId && !!memberId,
  });
}

export function useUpdateMemberStatus(tenantId: string, memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: 'active' | 'paused' | 'deactivated') => {
      return fetchJson(
        `/api/tenants/${tenantId}/members/${memberId}`,
        { status },
        {
          method: 'PATCH',
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', tenantId, memberId] });
      queryClient.invalidateQueries({ queryKey: ['members', tenantId] });
      toast.success('Member status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update member status');
    },
  });
}
