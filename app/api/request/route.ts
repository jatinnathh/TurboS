
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const user_CLERK =  await currentUser();
  if (!user_CLERK) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { clerkId: user_CLERK.id },
  });

  const newRequest = await prisma.request.create({
    data: {
      type: body.type,
      title: body.title,
      department: body.department,
      priority: body.priority || "MEDIUM",
      appointmentDate: body.appointmentDate
        ? new Date(body.appointmentDate)
        : undefined,
      testType: body.testType,
      userId: user!.id,
    },
  });

  return Response.json(newRequest);
}