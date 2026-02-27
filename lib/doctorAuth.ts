import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getDoctorFromToken() {
  const cookieStore = await cookies(); // ✅ FIX: add await
  const token = cookieStore.get("doctor_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      doctorId: string;
    };

    const doctor = await prisma.doctor.findUnique({
      where: { id: decoded.doctorId },
    });

    return doctor;
  } catch {
    return null;
  }
}