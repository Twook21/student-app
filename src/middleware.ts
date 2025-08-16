// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Public routes yang tidak perlu auth
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/api/auth",
      "/auth/error"
    ];

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!token.roles?.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Check teacher routes
    if (pathname.startsWith("/teacher") || pathname.startsWith("/api/teacher")) {
      if (!token.roles?.includes("GURU") && !token.roles?.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Check student routes
    if (pathname.startsWith("/student") || pathname.startsWith("/api/student")) {
      if (!token.roles?.includes("SISWA") && !token.roles?.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Check parent routes
    if (pathname.startsWith("/parent") || pathname.startsWith("/api/parent")) {
      if (!token.roles?.includes("ORANGTUA") && !token.roles?.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without token
        const { pathname } = req.nextUrl;
        const publicRoutes = [
          "/",
          "/login", 
          "/register",
          "/api/auth",
          "/auth/error"
        ];
        
        return publicRoutes.some(route => pathname.startsWith(route)) || !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};