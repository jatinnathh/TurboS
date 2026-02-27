import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DOCTORS = [
  { name: "Dr. Ananya Sharma", specialization: "Internal Medicine", department: "General Medicine", email: "ananya@mediflow.com" },
  { name: "Dr. Rahul Verma", specialization: "Family Medicine", department: "General Medicine", email: "rahul@mediflow.com" },
  { name: "Dr. Priya Nair", specialization: "General Physician", department: "General Medicine", email: "priya@mediflow.com" },
  { name: "Dr. Sarah Mitchell", specialization: "Interventional Cardiology", department: "Cardiology", email: "sarah@mediflow.com" },
  { name: "Dr. Alan Brooks", specialization: "Electrophysiology", department: "Cardiology", email: "alan@mediflow.com" },
  { name: "Dr. James Carter", specialization: "Heart Failure Specialist", department: "Cardiology", email: "james@mediflow.com" },
  { name: "Dr. Vikram Patel", specialization: "Joint Replacement Surgery", department: "Orthopedics", email: "vikram@mediflow.com" },
  { name: "Dr. Emily Wong", specialization: "Sports Medicine", department: "Orthopedics", email: "emily@mediflow.com" },
  { name: "Dr. Michael Torres", specialization: "Spine Surgery", department: "Orthopedics", email: "michael@mediflow.com" },
  { name: "Dr. Mei Lin", specialization: "Clinical Neurophysiology", department: "Neurology", email: "mei@mediflow.com" },
  { name: "Dr. David Kim", specialization: "Stroke Specialist", department: "Neurology", email: "david@mediflow.com" },
  { name: "Dr. Aisha Khan", specialization: "Neuro-oncology", department: "Neurology", email: "aisha@mediflow.com" },
  { name: "Dr. Helen Park", specialization: "Neonatology", department: "Pediatrics", email: "helen@mediflow.com" },
  { name: "Dr. Carlos Rivera", specialization: "Pediatric Cardiology", department: "Pediatrics", email: "carlos@mediflow.com" },
  { name: "Dr. Sonia Das", specialization: "Pediatric Neurology", department: "Pediatrics", email: "sonia@mediflow.com" },
  { name: "Dr. Arjun Reddy", specialization: "Emergency Medicine", department: "Emergency", email: "arjun@mediflow.com" },
  { name: "Dr. Laura Chen", specialization: "Trauma Surgery", department: "Emergency", email: "laura@mediflow.com" },
  { name: "Dr. Omar Farouk", specialization: "Critical Care Medicine", department: "Emergency", email: "omar@mediflow.com" },
];

async function main() {
  console.log("🧹 Cleaning database (except users)...");

  await prisma.requestLog.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.request.deleteMany();
  await prisma.doctor.deleteMany();

  console.log("🌱 Seeding doctors...");

  const hashedPassword = await bcrypt.hash("doctor123", 10);

  for (const doc of DOCTORS) {
    await prisma.doctor.create({
      data: {
        ...doc,
        password: hashedPassword,
      },
    });
  }

  console.log("👤 Finding existing Clerk user...");

  const user = await prisma.user.findFirst({
    where: {
      email: "vishalrawat2612@gmail.com",
    },
  });

  if (!user) {
    throw new Error("User not found. Please login once with Clerk first.");
  }

  console.log("📋 Creating Emergency Request...");

  const emergencyDoctor = await prisma.doctor.findFirst({
    where: { department: "Emergency" },
  });

  const cardioDoctor = await prisma.doctor.findFirst({
    where: { department: "Cardiology" },
  });

  const request = await prisma.request.create({
    data: {
      type: "EMERGENCY",
      title: "Severe Chest Pain",
      description: "Pain radiating to left arm and jaw.",
      department: "Emergency",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      doctorId: emergencyDoctor?.id,
      doctorName: emergencyDoctor?.name,
      userId: user.id,
    },
  });

  console.log("📝 Creating Logs...");

  await prisma.requestLog.createMany({
    data: [
      {
        requestId: request.id,
        department: "Emergency",
        action: "Patient admitted",
        performedBy: emergencyDoctor?.name,
        status: "COMPLETED",
      },
      {
        requestId: request.id,
        department: "Emergency",
        action: "Referred to Cardiology",
        performedBy: emergencyDoctor?.name,
        status: "COMPLETED",
      },
      {
        requestId: request.id,
        department: "Cardiology",
        action: "Cardiac evaluation ongoing",
        performedBy: cardioDoctor?.name,
        status: "IN_PROGRESS",
      },
    ],
  });

  console.log("💊 Creating Prescription...");

  await prisma.prescription.create({
    data: {
      medication: "Aspirin 75mg",
      dosage: "75mg",
      frequency: "Once daily",
      startDate: new Date(),
      notes: "Take after meals",
      doctorId: cardioDoctor!.id,
      userId: user.id,
      requestId: request.id,
    },
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());