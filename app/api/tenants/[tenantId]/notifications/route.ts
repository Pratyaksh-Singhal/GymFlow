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

    const notifications = await prisma.notification.findMany({
      where: { tenantId: params.tenantId },
      include: {
        member: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('[Notifications GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch notifications', 500);
  }
}
