import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { createMemberSchema } from '@/lib/validations';
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

    const members = await prisma.member.findMany({
      where: {
        tenantId: params.tenantId,
      },
      include: {
        membershipInstances: {
          include: {
            package: true,
          },
        },
        assignedTrainer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(members);
  } catch (error) {
    console.error('[Members GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch members', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const body = await request.json();
    const data = createMemberSchema.parse(body);

    // Verify package exists
    const packageExists = await prisma.package.findFirst({
      where: {
        id: data.package_id,
        tenantId: params.tenantId,
      },
    });

    if (!packageExists) {
      return errorResponse('NOT_FOUND', 'Package not found', 404);
    }

    // Verify trainer if provided
    if (data.assigned_trainer_id) {
      const trainerExists = await prisma.user.findFirst({
        where: {
          id: data.assigned_trainer_id,
          tenantId: params.tenantId,
          role: 'trainer',
        },
      });

      if (!trainerExists) {
        return errorResponse('NOT_FOUND', 'Trainer not found', 404);
      }
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        assignedTrainerId: data.assigned_trainer_id,
        tenantId: params.tenantId,
        status: 'active',
      },
    });

    // Calculate renewal date
    const startDate = new Date();

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + packageExists.durationDays);

    // Create membership instance
    const membershipInstance = await prisma.membershipInstance.create({
      data: {
        tenantId: params.tenantId,
        memberId: member.id,
        packageId: data.package_id,
        startDate,
        renewalDate,
        status: 'active',
      },
      include: {
        package: true,
      },
    });

    // Fetch full member details
    const fullMember = await prisma.member.findUnique({
      where: {
        id: member.id,
      },
      include: {
        membershipInstances: {
          include: {
            package: true,
          },
        },
        assignedTrainer: true,
      },
    });

    return successResponse(
      {
        ...fullMember,
        currentMembership: membershipInstance,
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid member data', 400, error.errors);
    }

    console.error('[Members POST]', error);

    return errorResponse('INTERNAL_ERROR', 'Failed to create member', 500);
  }
}
