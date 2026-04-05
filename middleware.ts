import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/copy-rapida", "/copy-completa"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const authCookie = req.cookies.get("copy_ai_auth")?.value;

  if (authCookie === "ok") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/copy-rapida/:path*", "/copy-completa/:path*"],
};