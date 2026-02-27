import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect("http://localhost:3000/doctor/login");

  response.cookies.set("doctor_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}