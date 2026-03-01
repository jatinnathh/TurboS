import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const doctorId = req.nextUrl.searchParams.get("doctorId");

    // Doctor context: fetch logs for requests where doctor is assigned OR appears in logs
    if (doctorId) {
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) {
            return NextResponse.json({ logs: [] });
        }

        const logs = await prisma.requestLog.findMany({
            where: {
                request: {
                    OR: [
                        { doctorId: doctor.id },
                        { logs: { some: { performedBy: doctor.name } } },
                    ],
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                request: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                        priority: true,
                        department: true,
                    },
                },
            },
        });

        return NextResponse.json({ logs });
    }

    // Patient context: use Clerk auth
    const user_clerk = await currentUser();
    if (!user_clerk) {
        return NextResponse.json({ logs: [] });
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: user_clerk.id },
    });

    if (!user) {
        return NextResponse.json({ logs: [] });
    }

    const logs = await prisma.requestLog.findMany({
        where: { request: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        include: {
            request: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    priority: true,
                    department: true,
                },
            },
        },
    });

    return NextResponse.json({ logs });
}
