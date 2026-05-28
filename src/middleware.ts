import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIX = ["/dashboard", "/editor", "/settings"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const path = nextUrl.pathname;

  // Rutas públicas de la plataforma (landing, auth)
  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isAuthRoute = AUTH_ROUTES.includes(path);
  const isProtectedRoute = PROTECTED_PREFIX.some((prefix) => path.startsWith(prefix));
  const isApiAuthRoute = path.startsWith("/api/auth");
  const isApiRoute = path.startsWith("/api");

  // API de auth siempre pasa
  if (isApiAuthRoute) return NextResponse.next();

  // APIs protegidas
  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Si está logueado y va a login/register → redirigir al dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Si no está logueado e intenta acceder a ruta protegida
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Matcher: todo excepto archivos estáticos y _next
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
