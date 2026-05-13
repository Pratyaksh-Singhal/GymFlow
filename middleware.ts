import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || 'dev-secret');

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public paths
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return NextResponse.next();
  }

  // Require auth for /dashboard and /api/tenants routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/tenants')) {
    const headerToken = request.headers.get('authorization')?.split(' ')[1];
    const cookieToken = request.cookies.get('authToken')?.value;
    const token = headerToken || cookieToken;

    if (!token) {
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const verified = await jwtVerify(token, SECRET);

      const tenantId = verified.payload.tenant_id as string;
      const userId = verified.payload.sub as string;
      const userRole = verified.payload.user_role as string;

      // Validate tenant_id matches URL param (prevents cross-tenant access)
      const urlTenantId = pathname.split('/')[3]; // /api/tenants/[tenantId]/...
      if (urlTenantId && urlTenantId !== tenantId && userRole !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden: Tenant mismatch' }, { status: 403 });
      }

      // Store in request headers for route handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-id', tenantId);
      requestHeaders.set('x-user-id', userId);
      requestHeaders.set('x-user-role', userRole);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/tenants/:path*'],
};
