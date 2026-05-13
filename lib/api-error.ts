import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public message: string,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any[]) {
    super('VALIDATION_ERROR', 400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', 401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', 403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', 404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super('CONFLICT', 409, message);
    this.name = 'ConflictError';
  }
}

export class InternalError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', 500, message);
    this.name = 'InternalError';
  }
}

export function errorResponse(error: any, requestId?: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
        requestId,
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      requestId,
    },
    { status: 500 }
  );
}

export function successResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}
