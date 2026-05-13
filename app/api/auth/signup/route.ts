import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { signup } from '@/lib/auth';
import { signupSchema } from '@/lib/validations';
import { errorResponse, successResponse, ValidationError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    const result = await signup({
      gymName: data.gym_name,
      ownerEmail: data.email,
      ownerName: data.owner_name,
      password: data.password,
    });

    const response = successResponse(
      {
        user: result.user,
        tenant: result.tenant,
        token: result.token,
      },
      201
    );

    response.cookies.set('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60,
    });

    if (result.refreshToken) {
      response.cookies.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(new ValidationError('Signup validation failed', error.errors));
    }

    return errorResponse(error);
  }
}
