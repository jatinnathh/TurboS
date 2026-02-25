import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
    const user_clerk = await currentUser();
    if (!user_clerk) return new Response("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
        where: { clerkId: user_clerk.id },
    });

    if (!user) return new Response("User not found", { status: 404 });

    const prescriptions = await prisma.prescription.findMany({
        where: { userId: user.id },
        include: { doctor: true },
        orderBy: { createdAt: "desc" },
    });

    return Response.json(prescriptions);
}
