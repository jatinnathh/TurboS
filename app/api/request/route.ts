
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const user_CLERK = await currentUser();
  if (!user_CLERK) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { clerkId: user_CLERK.id },
  });

  if (!user) return new Response("User not found", { status: 404 });

  // Look up doctor name if doctorId provided
  let doctorName = body.doctorName;
  if (body.doctorId && !doctorName) {
    const doctor = await prisma.doctor.findUnique({ where: { id: body.doctorId } });
    if (doctor) doctorName = doctor.name;
  }

  const newRequest = await prisma.request.create({
    data: {
      type: body.type,
      title: body.title,
      description: body.description,
      department: body.department,
      priority: body.priority || "MEDIUM",
      appointmentDate: body.appointmentDate
        ? new Date(body.appointmentDate)
        : undefined,
      testType: body.testType,
      doctorName: doctorName,
      doctorId: body.doctorId || undefined,
      userId: user.id,
    },
  });

  // Auto-create the first log entry
  await prisma.requestLog.create({
    data: {
      requestId: newRequest.id,
      department: body.department || "RECEPTION",
      action: body.type === "EMERGENCY"
        ? "Emergency request registered — awaiting triage"
        : "Request registered successfully",
      performedBy: "System",
      status: "COMPLETED",
    },
  });

  return Response.json(newRequest);
}