import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
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

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.tenantId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!tenant) {
      return errorResponse('NOT_FOUND', 'Tenant not found', 404);
    }

    return successResponse(tenant);
  } catch (error) {
    console.error('[Tenant Profile GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch tenant profile', 500);
  }
}
