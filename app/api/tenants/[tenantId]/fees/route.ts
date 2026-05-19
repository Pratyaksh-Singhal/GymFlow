import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { markFeeAsPaidSchema, createOneOffFeeSchema } from '@/lib/validations';
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
        member: {
          select: {
            name: true,
            email: true,
          },
        },
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

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const body = await request.json();
    const validatedData = createOneOffFeeSchema.parse(body);

    // Find active membership instance for this member
    let membershipInstance = await prisma.membershipInstance.findFirst({
      where: {
        tenantId: params.tenantId,
        memberId: validatedData.memberId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no active instance, fall back to any package assignment
    if (!membershipInstance) {
      membershipInstance = await prisma.membershipInstance.findFirst({
        where: {
          tenantId: params.tenantId,
          memberId: validatedData.memberId,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!membershipInstance) {
      return errorResponse(
        'NOT_FOUND',
        'No membership record found for this member to attach fee to.',
        404
      );
    }

    // Encrypt charge category into transactionId field to avoid database migration
    const encodedDescription = validatedData.description
      ? `manual_charge:${validatedData.description}`
      : 'manual_charge:One-off Fee';

    const newFee = await prisma.fee.create({
      data: {
        tenantId: params.tenantId,
        memberId: validatedData.memberId,
        membershipInstanceId: membershipInstance.id,
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        status: 'pending',
        transactionId: encodedDescription,
      },
      include: {
        member: {
          select: {
            name: true,
            email: true,
          },
        },
        membershipInstance: {
          include: {
            package: true,
          },
        },
      },
    });

    return successResponse(newFee);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid fee data', 400, error.errors);
    }
    console.error('[Fees POST]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to generate custom fee', 500);
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
        member: {
          select: {
            name: true,
            email: true,
          },
        },
        membershipInstance: {
          include: {
            package: true,
          },
        },
      },
    });

    // Simulate sending digital receipt email to the athlete
    if (fee.status === 'paid' && fee.member?.email) {
      console.log(
        `\n[SMTP Simulation] ===================================================` +
          `\n[SMTP Simulation] TO: ${fee.member.email}` +
          `\n[SMTP Simulation] SUBJECT: Digital Payment Receipt - Ref #${fee.id.substring(0, 8).toUpperCase()}` +
          `\n[SMTP Simulation] BODY:` +
          `\n[SMTP Simulation]   Hi ${fee.member.name},` +
          `\n[SMTP Simulation]   Your payment of INR ${Number(fee.amount).toFixed(2)} has been successfully recorded.` +
          `\n[SMTP Simulation]   Cleared Date: ${fee.paidDate ? new Date(fee.paidDate).toLocaleString() : new Date().toLocaleString()}` +
          `\n[SMTP Simulation]   Clearance Method: ${fee.paymentMethod}` +
          `\n[SMTP Simulation]   Transaction Ref: ${fee.transactionId || 'NONE'}` +
          `\n[SMTP Simulation]   Thank you for training with us!` +
          `\n[SMTP Simulation] ===================================================\n`
      );
    }

    return successResponse(fee);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid fee data', 400, error.errors);
    }

    console.error('[Fees PATCH]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update fee', 500);
  }
}
