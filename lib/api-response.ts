import { NextResponse } from 'next/server';

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, statusCode = 200, meta?: Record<string, unknown>) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  return NextResponse.json(response, { status: statusCode });
}

export function errorResponse(code: string, message: string, statusCode = 400, details?: unknown) {
  const errorObj: ApiErrorResponse['error'] = {
    code,
    message,
  };

  if (details !== undefined && details !== null) {
    errorObj.details = details;
  }

  const response: ApiErrorResponse = {
    success: false,
    error: errorObj,
  };
  return NextResponse.json(response, { status: statusCode });
}

export function extractTenantContext(headers: Headers) {
  return {
    tenantId: headers.get('x-tenant-id') || '',
    userId: headers.get('x-user-id') || '',
    userRole: headers.get('x-user-role') || '',
  };
}

export function validateTenantAccess(
  tenantId: string,
  userTenantId: string,
  userRole: string
): boolean {
  if (userRole === 'super_admin') {
    return true;
  }
  return tenantId === userTenantId;
}
