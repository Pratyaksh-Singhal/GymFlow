import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';
import { toast } from 'sonner';

export type Fee = {
  id: string;
  tenantId: string;
  memberId: string;
  membershipInstanceId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'other' | null;
  transactionId: string | null;
  paidDate: string | null;
  paidByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  member?: {
    name: string;
    email: string;
  };
  membershipInstance?: {
    package: {
      name: string;
    };
  };
};

export function useFees(tenantId: string) {
  return useQuery({
    queryKey: ['fees', tenantId],
    queryFn: async () => {
      const response = await fetchJson<{ success: boolean; data: Fee[] }>(
        `/api/tenants/${tenantId}/fees`
      );
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function useGenerateFees(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return fetchJson<{
        success: boolean;
        data: { message: string; scannedCount: number; generatedCount: number };
      }>(`/api/tenants/${tenantId}/fees/generate`, {}, { method: 'POST' });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['fees', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['member'] }); // Invalidate member details to update ledgers

      const { generatedCount, scannedCount } = response.data;
      if (generatedCount > 0) {
        toast.success(`Billing scan finished: generated ${generatedCount} pending renewal fee(s)!`);
      } else {
        toast.success(`Billing scan finished: all ${scannedCount} active accounts up to date!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to trigger auto-billing generation.');
    },
  });
}

export function useCreateOneOffFee(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      memberId: string;
      amount: number;
      dueDate: string;
      description?: string;
    }) => {
      return fetchJson<{ success: boolean; data: Fee }>(`/api/tenants/${tenantId}/fees`, data, {
        method: 'POST',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fees', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['member', tenantId, variables.memberId] });
      toast.success('Custom charge created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create custom charge');
    },
  });
}

export function useMarkFeeAsPaid(tenantId: string, memberId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      feeId: string;
      status: 'paid';
      payment_method: 'cash' | 'upi' | 'bank_transfer' | 'other';
      transaction_id?: string;
      paid_date?: string;
    }) => {
      return fetchJson<{ success: boolean; data: Fee }>(`/api/tenants/${tenantId}/fees`, data, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees', tenantId] });
      if (memberId) {
        queryClient.invalidateQueries({ queryKey: ['member', tenantId, memberId] });
      }
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}
