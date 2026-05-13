import { NextRequest } from 'next/server';
import { errorResponse, successResponse, ValidationError } from '@/lib/api-error';
import { refreshToken as refreshTokenService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body?.refreshToken || request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const result = await refreshTokenService(refreshToken);
    const response = successResponse({ token: result.token, user: result.user }, 200);

    response.cookies.set('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
