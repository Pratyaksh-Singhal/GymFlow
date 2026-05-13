import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { createPackageSchema } from '@/lib/validations';
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

    const packages = await prisma.package.findMany({
      where: { tenantId: params.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(packages);
  } catch (error) {
    console.error('[Packages GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch packages', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const body = await request.json();
    const data = createPackageSchema.parse(body);

    const pkg = await prisma.package.create({
      data: {
        name: data.name,
        durationDays: data.duration_days,
        price: data.price,
        description: data.description || null,
        tenantId: params.tenantId,
        isActive: true,
      },
    });

    return successResponse(pkg, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid package data', 400, error.errors);
    }

    console.error('[Packages POST]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create package', 500);
  }
}
