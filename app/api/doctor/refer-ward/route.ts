import { prisma } from "@/lib/prisma";
import { getDoctorFromToken } from "@/lib/doctorAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const doctor = await getDoctorFromToken();
  if (!doctor)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, ward } = await req.json();

  await prisma.request.update({
    where: { id: requestId },
    data: {
      wardType: ward,
      status: "IN_PROGRESS",
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId,
      department: ward,
      action: `Admitted to ${ward}`,
      performedBy: doctor.name,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ success: true });
}