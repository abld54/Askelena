import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/profile", "/dashboard", "/listings/new", "/listings/edit"];

// Routes only for hosts
const hostOnlyRoutes = ["/listings/new", "/listings/edit", "/dashboard/listings", "/dashboard"];

// Auth pages — redirect away if already logged in
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!token;
  const userRole = (token?.role as string) ?? "guest";

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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/|api/).*)",
  ],
};
