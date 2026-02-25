import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});
async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found. Login to the app first, then run seed.");
    return;
  }

  const request = await prisma.request.create({
    data: {
      type: "EMERGENCY",
      title: "Chest pain — urgent evaluation",
      description: "Patient experiencing severe chest pain radiating to left arm.",
      department: "EMERGENCY",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      doctorName: "Dr. Alan Brooks",
      userId: user.id,
    },
  });

  await prisma.requestLog.createMany({
    data: [
      { requestId: request.id, department: "EMERGENCY",  action: "Patient admitted with chest pain",          performedBy: "Dr. Alan Brooks",   status: "COMPLETED",   createdAt: new Date("2025-02-25T06:15:00") },
      { requestId: request.id, department: "EMERGENCY",  action: "Initial assessment — suspected NSTEMI",     performedBy: "Dr. Alan Brooks",   status: "COMPLETED",   createdAt: new Date("2025-02-25T06:45:00") },
      { requestId: request.id, department: "LABORATORY", action: "Troponin and CBC ordered — results normal", performedBy: "Dr. Mei Lin",       status: "COMPLETED",   createdAt: new Date("2025-02-25T07:30:00") },
      { requestId: request.id, department: "RADIOLOGY",  action: "Chest X-ray performed — no acute findings", performedBy: "Dr. Helen Park",    status: "COMPLETED",   createdAt: new Date("2025-02-25T08:00:00") },
      { requestId: request.id, department: "CARDIOLOGY", action: "Medication titration in progress",          performedBy: "Dr. Sarah Mitchell",status: "IN_PROGRESS", createdAt: new Date("2025-02-25T10:30:00") },
      { requestId: request.id, department: "CARDIOLOGY", action: "Schedule cardiac rehabilitation",           performedBy: undefined,           status: "PENDING",     createdAt: new Date("2025-02-25T11:00:00") },
    ],
  });

  console.log("✅ Seed complete! Request ID:", request.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
