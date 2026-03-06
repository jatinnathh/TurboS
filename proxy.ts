import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/doctor(.*)",
  "/api/doctor(.*)",
  "/api/lab(.*)",
  "/api/request/flow",
  "/api/request/activity",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If logged-in patient visits root → redirect to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next(); // important
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};