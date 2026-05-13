import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { markFeeAsPaidSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractTenantContext,
  validateTenantAccess,
} from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const fees = await prisma.fee.findMany({
      where: { tenantId: params.tenantId },
      include: {
        membershipInstance: {
          include: {
            package: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(fees);
  } catch (error) {
    console.error('[Fees GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch fees', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const body = await request.json();
    const { feeId, ...data } = body;

    if (!feeId) {
      return errorResponse('VALIDATION_ERROR', 'Fee ID is required', 400);
    }

    const validatedData = markFeeAsPaidSchema.parse(data);

    const fee = await prisma.fee.update({
      where: { id: feeId },
      data: {
        status: validatedData.status,
        paymentMethod: validatedData.payment_method || null,
        transactionId: validatedData.transaction_id || null,
        paidDate: validatedData.paid_date ? new Date(validatedData.paid_date) : null,
      },
      include: {
        membershipInstance: {
          include: {
            package: true,
          },
        },
      },
    });

    return successResponse(fee);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid fee data', 400, error.errors);
    }

    console.error('[Fees PATCH]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update fee', 500);
  }
}
