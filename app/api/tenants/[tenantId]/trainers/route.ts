import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  extractTenantContext,
  validateTenantAccess,
} from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

const createTrainerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    const trainers = await prisma.user.findMany({
      where: {
        tenantId: params.tenantId,
        role: 'trainer',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assignedMembers: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(trainers);
  } catch (error) {
    console.error('[Trainers GET]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch trainers', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    if (userRole !== 'owner' && userRole !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'Only gym owners can add trainers', 403);
    }

    const body = await request.json();
    const data = createTrainerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId: params.tenantId,
      },
    });

    if (existingUser) {
      return errorResponse('CONFLICT', 'User with this email already exists in the gym', 409);
    }

    const tempPassword = data.password?.trim() || crypto.randomBytes(6).toString('hex') + 'aA1!';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
      },
    });

    if (authError || !authData.user?.id) {
      console.error('[Supabase Admin Error]', authError);
      return errorResponse('INTERNAL_ERROR', `Auth failed: ${authError?.message}`, 500);
    }

    const userId = authData.user.id;

    const newTrainer = await prisma.user.create({
      data: {
        id: userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        tenantId: params.tenantId,
        role: 'trainer',
      },
    });

    return successResponse(
      {
        trainer: newTrainer,
        tempPassword,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('VALIDATION_ERROR', 'Invalid data provided', 400, error.errors);
    }
    console.error('[Trainers POST]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create trainer', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    if (userRole !== 'owner' && userRole !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'Only gym owners can delete trainers', 403);
    }

    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get('trainerId');

    if (!trainerId) {
      return errorResponse('VALIDATION_ERROR', 'Trainer ID is required', 400);
    }

    // Set assignedTrainerId to null for all members assigned to this trainer
    await prisma.member.updateMany({
      where: {
        tenantId: params.tenantId,
        assignedTrainerId: trainerId,
      },
      data: {
        assignedTrainerId: null,
      },
    });

    // Delete trainer user record
    await prisma.user.delete({
      where: {
        id: trainerId,
        tenantId: params.tenantId,
        role: 'trainer',
      },
    });

    // Delete from Supabase Auth pool
    try {
      await supabaseAdmin.auth.admin.deleteUser(trainerId);
    } catch (authErr) {
      console.error('[Supabase Auth Delete Error]', authErr);
    }

    return successResponse({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('[Trainers DELETE]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete trainer', 500);
  }
}
