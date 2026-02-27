import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const doctor = await prisma.doctor.findUnique({
    where: { email },
  });

  if (!doctor) {
    return NextResponse.json({ error: "Invalid email" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, doctor.password);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = jwt.sign(
    { doctorId: doctor.id },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  const response = NextResponse.json({ success: true });

  response.cookies.set("doctor_token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return response;
}