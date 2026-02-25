import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const department = req.nextUrl.searchParams.get("department");

    const doctors = await prisma.doctor.findMany({
        where: department ? { department, available: true } : { available: true },
        orderBy: { name: "asc" },
    });

    return Response.json(doctors);
}
