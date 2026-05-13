import { logout } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-error';

export async function POST() {
  try {
    await logout();
    const response = successResponse({ message: 'Logged out successfully' }, 200);
    response.cookies.delete('refreshToken');
    response.cookies.delete('authToken');
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
