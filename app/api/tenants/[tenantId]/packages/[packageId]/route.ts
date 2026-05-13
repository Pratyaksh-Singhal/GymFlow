import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { updatePackageSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractTenantContext,
  validateTenantAccess,
} from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string; packageId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const pkg = await prisma.package.findFirst({
      where: {
        id: params.packageId,
        tenantId: params.tenantId,
      },
    });

    if (!pkg) {
      return errorResponse('NOT_FOUND', 'Package not found', 404);
    }

    return successResponse(pkg);
  } catch (error) {
    console.error('[Package GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch package', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenantId: string; packageId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const body = await request.json();
    const data = updatePackageSchema.parse(body);

    const pkg = await prisma.package.update({
      where: { id: params.packageId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price && { price: data.price }),
        ...(data.description && { description: data.description }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
      },
    });

    return successResponse(pkg);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid package data', 400, error.errors);
    }

    console.error('[Package PATCH]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update package', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string; packageId: string } }
) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    await prisma.package.delete({
      where: { id: params.packageId },
    });

    return successResponse({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('[Package DELETE]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete package', 500);
  }
}
