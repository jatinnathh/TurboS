import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that DO NOT require Clerk authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/doctor(.*)",       // doctor system uses JWT, not Clerk
  "/api/doctor(.*)",
  "/api/lab(.*)",   // doctor APIs use JWT
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If logged in patient and visiting root → go to patient dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect everything except public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};