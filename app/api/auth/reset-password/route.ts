import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { sendPasswordResetEmail, resetPassword } from '@/lib/auth';
import { newPasswordSchema, resetPasswordSchema } from '@/lib/validations';
import { errorResponse, successResponse, ValidationError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.email) {
      const data = resetPasswordSchema.parse(body);
      const result = await sendPasswordResetEmail(data.email);
      return successResponse(result, 200);
    }

    if (body?.token && body?.password) {
      const data = newPasswordSchema.parse(body);
      await resetPassword({ email: data.email, token: data.token, newPassword: data.password });
      return successResponse({ message: 'Password reset successfully' }, 200);
    }

    throw new ValidationError('Invalid reset-password request');
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(new ValidationError('Reset password validation failed', error.errors));
    }

    return errorResponse(error);
  }
}
