// middleware.ts (in root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Public routes - allow access
  const publicRoutes = ['/login', '/'];
  if (publicRoutes.includes(pathname)) {
    // If logged in, redirect to dashboard
    if (token) {
      const payload = await verifyAuth(token);
      if (payload) {
        const role = payload.role as string;
        const dashboardPath = role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard';
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }
    return NextResponse.next();
  }

  // API routes - allow access
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyAuth(token);
  
  if (!payload) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  const role = payload.role as string;

  // Role-based access control
  if (pathname.startsWith('/buyer')) {
    if (role !== 'buyer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/farmer')) {
    if (role !== 'farmer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Add user info to headers for server components
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.id as string);
  response.headers.set('x-user-role', role);
  response.headers.set('x-user-phone', payload.phone as string);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};