import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
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
    const { tenantId, userRole, userId } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const member = await prisma.member.findUnique({
      where: {
        id: params.memberId,
        tenantId: params.tenantId,
      },
      include: {
        assignedTrainer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        membershipInstances: {
          include: {
            package: true,
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        fees: {
          include: {
            membershipInstance: {
              include: {
                package: true,
              },
            },
          },
          orderBy: {
            dueDate: 'desc',
          },
        },
      },
    });

    if (!member) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    // Role-based access check
    if (userRole === 'trainer' && member.assignedTrainerId !== userId) {
      return errorResponse('FORBIDDEN', 'You are not assigned to this member', 403);
    }
    if (userRole === 'member' && member.userId !== userId) {
      return errorResponse('FORBIDDEN', 'You can only view your own profile', 403);
    }

    return successResponse(member);
  } catch (error) {
    console.error('[Member Details GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch member details', 500);
  }
}

const updateMemberSchema = z.object({
  status: z.enum(['active', 'paused', 'deactivated']).optional(),
  assignedTrainerId: z.string().uuid().nullable().optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenantId: string; memberId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    // Only owners and super admins can update member status/details for now
    if (userRole !== 'owner' && userRole !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'Only gym owners can update member details', 403);
    }

    const body = await request.json();
    const data = updateMemberSchema.parse(body);

    const existingMember = await prisma.member.findUnique({
      where: {
        id: params.memberId,
        tenantId: params.tenantId,
      },
    });

    if (!existingMember) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    // Process status update logic if paused
    if (data.status === 'paused' && existingMember.status === 'active') {
      // Pause all active membership instances
      await prisma.membershipInstance.updateMany({
        where: {
          memberId: params.memberId,
          tenantId: params.tenantId,
          status: 'active',
        },
        data: {
          status: 'paused',
        },
      });
    } else if (data.status === 'active' && existingMember.status === 'paused') {
      // Resume all paused instances
      await prisma.membershipInstance.updateMany({
        where: {
          memberId: params.memberId,
          tenantId: params.tenantId,
          status: 'paused',
        },
        data: {
          status: 'active',
        },
      });
    }

    const updatedMember = await prisma.member.update({
      where: {
        id: params.memberId,
      },
      data,
      include: {
        assignedTrainer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid data provided', 400, error.errors);
    }
    console.error('[Member Details PATCH]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update member', 500);
  }
}
