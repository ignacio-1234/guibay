import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIX = ["/dashboard", "/editor", "/settings"];

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = AUTH_ROUTES.includes(path);
  const isProtectedRoute = PROTECTED_PREFIX.some((prefix) => path.startsWith(prefix));
  const isApiAuthRoute = path.startsWith("/api/auth");
  const isApiRoute = path.startsWith("/api");

  if (isApiAuthRoute) return NextResponse.next();

  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
