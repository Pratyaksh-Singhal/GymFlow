import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { updateMemberSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractTenantContext,
  validateTenantAccess,
} from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string; memberId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const member = await prisma.member.findFirst({
      where: {
        id: params.memberId,
        tenantId: params.tenantId,
      },
      include: {
        assignedTrainer: true,
        membershipInstances: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!member) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    return successResponse(member);
  } catch (error) {
    console.error('[Member GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch member', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenantId: string; memberId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const body = await request.json();
    const data = updateMemberSchema.parse(body);

    const member = await prisma.member.update({
      where: { id: params.memberId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.status && { status: data.status }),
        ...(data.assigned_trainer_id !== undefined && {
          assignedTrainerId: data.assigned_trainer_id,
        }),
      },
      include: {
        assignedTrainer: true,
        membershipInstances: {
          include: {
            package: true,
          },
        },
      },
    });

    return successResponse(member);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid member data', 400, error.errors);
    }

    console.error('[Member PATCH]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update member', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string; memberId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    await prisma.member.delete({
      where: { id: params.memberId },
    });

    return successResponse({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('[Member DELETE]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete member', 500);
  }
}
