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

    // Fetch dashboard metrics
    const [totalMembers, activeMembers, totalFees, paidFees, packages] = await Promise.all([
      prisma.member.count({ where: { tenantId: params.tenantId } }),
      prisma.member.count({ where: { tenantId: params.tenantId, status: 'active' } }),
      prisma.fee.count({ where: { tenantId: params.tenantId } }),
      prisma.fee.count({ where: { tenantId: params.tenantId, status: 'paid' } }),
      prisma.package.findMany({ where: { tenantId: params.tenantId, isActive: true } }),
    ]);

    const dashboard = {
      metrics: {
        totalMembers,
        activeMembers,
        totalFees,
        paidFees,
        pendingFees: totalFees - paidFees,
      },
      packages,
    };

    return successResponse(dashboard);
  } catch (error) {
    console.error('[Dashboard GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch dashboard', 500);
  }
}
