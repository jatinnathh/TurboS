import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const doctorId = req.nextUrl.searchParams.get("doctorId");

    // Doctor context: fetch requests where doctor is assigned OR appears in logs
    if (doctorId) {
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) {
            return NextResponse.json({ requests: [] });
        }

        const raw = await prisma.request.findMany({
            where: {
                OR: [
                    { doctorId: doctor.id },
                    { logs: { some: { performedBy: doctor.name } } },
                ],
            },
            orderBy: { createdAt: "desc" },
            include: {
                logs: { orderBy: { createdAt: "asc" } },
                user: { select: { email: true } },
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requests = raw.map((r: any) => ({
            ...r,
            doctorName: r.doctorName ?? doctor.name,
        }));

        return NextResponse.json({ requests });
    }

    // Patient context: use Clerk auth
    const user_clerk = await currentUser();
    if (!user_clerk) {
        return NextResponse.json({ requests: [] });
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: user_clerk.id },
    });

    if (!user) {
        return NextResponse.json({ requests: [] });
    }

    const raw = await prisma.request.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            logs: { orderBy: { createdAt: "asc" } },
            doctor: { select: { name: true, department: true } },
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests = raw.map((r: any) => ({
        ...r,
        doctorName: r.doctorName ?? r.doctor?.name ?? null,
    }));

    return NextResponse.json({ requests });
}
