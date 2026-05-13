import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { login } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { errorResponse, successResponse, ValidationError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const result = await login({
      email: data.email,
      password: data.password,
    });

    const response = successResponse(
      {
        user: result.user,
        token: result.token,
      },
      200
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
      return errorResponse(new ValidationError('Login validation failed', error.errors));
    }

    return errorResponse(error);
  }
}
