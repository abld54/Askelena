import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/profile", "/dashboard", "/listings/new", "/listings/edit"];

// Routes only for hosts
const hostOnlyRoutes = ["/listings/new", "/listings/edit", "/dashboard/listings"];

// Auth pages — redirect away if already logged in
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role ?? "guest";

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect authenticated-only routes
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect host-only routes
  const isHostOnly = hostOnlyRoutes.some((r) => pathname.startsWith(r));
  if (isHostOnly && userRole !== "host") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/).*)",
  ],
};
