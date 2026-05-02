import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = ["/login", "/api/auth", "/api/seed", "/mnu-logo.png"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p));
}

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    // If logged in and trying to access /login, redirect to dashboard
    if (pathname.startsWith("/login")) {
      const token = await getToken({ req });
      if (token) {
        const role = token.role as string;
        if (role === "admin" || role === "student_affairs") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        if (role === "student") {
          return NextResponse.redirect(new URL("/student/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  }

  // For protected paths, check authentication
  const token = await getToken({ req });
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
