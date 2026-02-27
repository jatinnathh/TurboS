import { prisma } from "@/lib/prisma";
import { getDoctorFromToken } from "@/lib/doctorAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const doctor = await getDoctorFromToken();

  if (!doctor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, medication, dosage, frequency } = await req.json();

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // 🔐 Ensure doctor is assigned to this request
  if (request.doctorId !== doctor.id) {
    return NextResponse.json(
      { error: "You are not assigned to this case" },
      { status: 403 }
    );
  }

  // Create prescription properly linked
  await prisma.prescription.create({
    data: {
      medication,
      dosage,
      frequency,
      startDate: new Date(),
      doctorId: doctor.id,
      userId: request.userId,
      requestId: request.id,
    },
  });

  // Add log
  await prisma.requestLog.create({
    data: {
      requestId: request.id,
      department: request.department || "",
      action: `Prescription added: ${medication}`,
      performedBy: doctor.name,
      status: "COMPLETED",
    },
  });

  return NextResponse.json({ success: true });
}