import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let assignedDoctor = null;
  let status = "PENDING";

  // 🚨 EMERGENCY AUTO ASSIGN
  if (data.type === "EMERGENCY") {
    assignedDoctor = await prisma.doctor.findFirst({
      where: {
        department: "Emergency",
        available: true,
      },
    });

    if (!assignedDoctor) {
      return NextResponse.json(
        { error: "No emergency doctor available" },
        { status: 400 }
      );
    }

    status = "IN_PROGRESS";
  }

  // 1️⃣ Create request
  const request = await prisma.request.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description,
      department: data.department,
      priority: data.priority ?? "MEDIUM",
      doctorId: assignedDoctor?.id,
      doctorName: assignedDoctor?.name,
      appointmentDate: data.appointmentDate
        ? new Date(data.appointmentDate)
        : null,
        //@ts-ignore
      status,
      userId: dbUser.id,
    },
  });

  // 2️⃣ Timeline log: Request created
  await prisma.requestLog.create({
    data: {
      requestId: request.id,
      department: data.department,
      action:
        data.type === "EMERGENCY"
          ? "Emergency request received"
          : "Request submitted",
      performedBy: dbUser.email,
      status: "COMPLETED",
    },
  });

  // 3️⃣ Timeline log: Doctor assigned (only for emergency)
  if (assignedDoctor) {
    await prisma.requestLog.create({
      data: {
        requestId: request.id,
        department: "Emergency",
        action: `Assigned to ${assignedDoctor.name}`,
        performedBy: "System",
        status: "IN_PROGRESS",
      },
    });
  }

  return NextResponse.json({ success: true });
}