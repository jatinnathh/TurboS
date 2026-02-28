import { prisma } from "@/lib/prisma";
import { getDoctorFromToken } from "@/lib/doctorAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const doctor = await getDoctorFromToken();
  if (!doctor)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, department, testType } = await req.json();

  if (!requestId || !department || !testType) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // Find lab doctor by department
  const labDoctor = await prisma.doctor.findFirst({
    where: { department },
  });

  if (!labDoctor) {
    return NextResponse.json(
      { error: "No lab doctor found" },
      { status: 400 }
    );
  }

  // Create lab test
  const labTest = await prisma.labTest.create({
    data: {
      requestId,
      department,
      testType, // ✅ REQUIRED FIX
      labDoctorId: labDoctor.id,
      status: "PENDING",
    },
  });

  // Create timeline log
  await prisma.requestLog.create({
    data: {
      requestId,
      department,
      action: `Lab test ordered: ${testType}`,
      performedBy: doctor.name,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ success: true, labTest });
}