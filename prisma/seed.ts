import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

const DOCTORS = [
  // General Medicine
  { name: "Dr. Ananya Sharma", specialization: "Internal Medicine", department: "General Medicine", email: "ananya.sharma@mediflow.com" },
  { name: "Dr. Rahul Verma", specialization: "Family Medicine", department: "General Medicine", email: "rahul.verma@mediflow.com" },
  { name: "Dr. Priya Nair", specialization: "General Physician", department: "General Medicine", email: "priya.nair@mediflow.com" },
  // Cardiology
  { name: "Dr. Sarah Mitchell", specialization: "Interventional Cardiology", department: "Cardiology", email: "sarah.mitchell@mediflow.com" },
  { name: "Dr. Alan Brooks", specialization: "Electrophysiology", department: "Cardiology", email: "alan.brooks@mediflow.com" },
  { name: "Dr. James Carter", specialization: "Heart Failure Specialist", department: "Cardiology", email: "james.carter@mediflow.com" },
  // Orthopedics
  { name: "Dr. Vikram Patel", specialization: "Joint Replacement Surgery", department: "Orthopedics", email: "vikram.patel@mediflow.com" },
  { name: "Dr. Emily Wong", specialization: "Sports Medicine", department: "Orthopedics", email: "emily.wong@mediflow.com" },
  { name: "Dr. Michael Torres", specialization: "Spine Surgery", department: "Orthopedics", email: "michael.torres@mediflow.com" },
  // Neurology
  { name: "Dr. Mei Lin", specialization: "Clinical Neurophysiology", department: "Neurology", email: "mei.lin@mediflow.com" },
  { name: "Dr. David Kim", specialization: "Stroke Specialist", department: "Neurology", email: "david.kim@mediflow.com" },
  { name: "Dr. Aisha Khan", specialization: "Neuro-oncology", department: "Neurology", email: "aisha.khan@mediflow.com" },
  // Pediatrics
  { name: "Dr. Helen Park", specialization: "Neonatology", department: "Pediatrics", email: "helen.park@mediflow.com" },
  { name: "Dr. Carlos Rivera", specialization: "Pediatric Cardiology", department: "Pediatrics", email: "carlos.rivera@mediflow.com" },
  { name: "Dr. Sonia Das", specialization: "Pediatric Neurology", department: "Pediatrics", email: "sonia.das@mediflow.com" },
  // Emergency
  { name: "Dr. Arjun Reddy", specialization: "Emergency Medicine", department: "Emergency", email: "arjun.reddy@mediflow.com" },
  { name: "Dr. Laura Chen", specialization: "Trauma Surgery", department: "Emergency", email: "laura.chen@mediflow.com" },
  { name: "Dr. Omar Farouk", specialization: "Critical Care Medicine", department: "Emergency", email: "omar.farouk@mediflow.com" },
];

async function main() {
  // ── Seed Doctors ─────────────────────────────────────────────────────────
  console.log("Seeding doctors...");

  for (const doc of DOCTORS) {
    const docId = doc.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
    await prisma.doctor.upsert({
      where: { id: docId },
      update: { email: doc.email },
      create: {
        id: docId,
        name: doc.name,
        email: doc.email,
        specialization: doc.specialization,
        department: doc.department,
        available: true,
      },
    });
  }

  console.log(`✅ ${DOCTORS.length} doctors seeded.`);

  // ── Seed sample data for first user ──────────────────────────────────────
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found. Login to the app first, then run seed again for sample data.");
    return;
  }

  // Get some doctors for references
  const drAlan = await prisma.doctor.findFirst({ where: { name: "Dr. Alan Brooks" } });
  const drAnanya = await prisma.doctor.findFirst({ where: { name: "Dr. Ananya Sharma" } });

  // ── Sample Emergency Request ─────────────────────────────────────────────
  const existingEmergency = await prisma.request.findFirst({
    where: { userId: user.id, type: "EMERGENCY" },
  });

  if (!existingEmergency) {
    const emergencyReq = await prisma.request.create({
      data: {
        type: "EMERGENCY",
        title: "Chest pain — urgent evaluation",
        description: "Patient experiencing severe chest pain radiating to left arm.",
        department: "Emergency",
        priority: "CRITICAL",
        status: "IN_PROGRESS",
        doctorName: "Dr. Alan Brooks",
        doctorId: drAlan?.id,
        userId: user.id,
      },
    });

    await prisma.requestLog.createMany({
      data: [
        { requestId: emergencyReq.id, department: "EMERGENCY", action: "Patient admitted with chest pain", performedBy: "Dr. Alan Brooks", status: "COMPLETED", createdAt: new Date("2026-02-25T06:15:00") },
        { requestId: emergencyReq.id, department: "EMERGENCY", action: "Initial assessment — suspected NSTEMI", performedBy: "Dr. Alan Brooks", status: "COMPLETED", createdAt: new Date("2026-02-25T06:45:00") },
        { requestId: emergencyReq.id, department: "LABORATORY", action: "Troponin and CBC ordered — results normal", performedBy: "Dr. Mei Lin", status: "COMPLETED", createdAt: new Date("2026-02-25T07:30:00") },
        { requestId: emergencyReq.id, department: "RADIOLOGY", action: "Chest X-ray performed — no acute findings", performedBy: "Dr. Helen Park", status: "COMPLETED", createdAt: new Date("2026-02-25T08:00:00") },
        { requestId: emergencyReq.id, department: "CARDIOLOGY", action: "Medication titration in progress", performedBy: "Dr. Sarah Mitchell", status: "IN_PROGRESS", createdAt: new Date("2026-02-25T10:30:00") },
        { requestId: emergencyReq.id, department: "CARDIOLOGY", action: "Schedule cardiac rehabilitation", performedBy: undefined, status: "PENDING", createdAt: new Date("2026-02-25T11:00:00") },
      ],
    });
    console.log("✅ Emergency request seeded.");
  }

  // ── Sample Appointment Request ───────────────────────────────────────────
  const existingAppointment = await prisma.request.findFirst({
    where: { userId: user.id, type: "APPOINTMENT" },
  });

  if (!existingAppointment && drAnanya) {
    const appointmentReq = await prisma.request.create({
      data: {
        type: "APPOINTMENT",
        title: "Annual health checkup",
        description: "Routine annual physical examination and blood work.",
        department: "General Medicine",
        priority: "LOW",
        status: "APPROVED",
        doctorName: drAnanya.name,
        doctorId: drAnanya.id,
        appointmentDate: new Date("2026-03-05T10:00:00"),
        userId: user.id,
      },
    });

    await prisma.requestLog.createMany({
      data: [
        { requestId: appointmentReq.id, department: "RECEPTION", action: "Appointment request registered", performedBy: "System", status: "COMPLETED", createdAt: new Date("2026-02-24T09:00:00") },
        { requestId: appointmentReq.id, department: "GENERAL MEDICINE", action: "Appointment confirmed for Mar 5th", performedBy: "Dr. Ananya Sharma", status: "COMPLETED", createdAt: new Date("2026-02-24T11:00:00") },
      ],
    });
    console.log("✅ Appointment request seeded.");
  }

  // ── Sample Prescriptions ─────────────────────────────────────────────────
  const existingPrescriptions = await prisma.prescription.count({
    where: { userId: user.id },
  });

  if (existingPrescriptions === 0 && drAnanya && drAlan) {
    await prisma.prescription.createMany({
      data: [
        {
          medication: "Amoxicillin 500mg",
          dosage: "500mg",
          frequency: "3 times daily",
          startDate: new Date("2026-02-20"),
          endDate: new Date("2026-03-02"),
          notes: "Take with food. Complete full course.",
          doctorId: drAnanya.id,
          userId: user.id,
        },
        {
          medication: "Atorvastatin 10mg",
          dosage: "10mg",
          frequency: "Once daily at bedtime",
          startDate: new Date("2026-02-15"),
          endDate: null,
          notes: "Long-term cholesterol management. Do not skip doses.",
          doctorId: drAlan.id,
          userId: user.id,
        },
        {
          medication: "Pantoprazole 40mg",
          dosage: "40mg",
          frequency: "Once daily before breakfast",
          startDate: new Date("2026-02-18"),
          endDate: new Date("2026-03-18"),
          notes: "For acid reflux. Take 30 minutes before meals.",
          doctorId: drAnanya.id,
          userId: user.id,
        },
      ],
    });
    console.log("✅ Prescriptions seeded.");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
