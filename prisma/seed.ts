import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("lab123", 10);

  // Radiology
  await prisma.doctor.upsert({
    where: { email: "radiology@hospital.com" },
    update: {},
    create: {
      name: "Dr. Arjun Mehta",
      email: "radiology@hospital.com",
      password,
      specialization: "Radiologist",
      department: "Radiology",
      available: true,
    },
  });

  // Pathology
  await prisma.doctor.upsert({
    where: { email: "pathology@hospital.com" },
    update: {},
    create: {
      name: "Dr. Sneha Rao",
      email: "pathology@hospital.com",
      password,
      specialization: "Pathologist",
      department: "Pathology",
      available: true,
    },
  });

  // Blood Lab
  await prisma.doctor.upsert({
    where: { email: "bloodlab@hospital.com" },
    update: {},
    create: {
      name: "Dr. Vikram Singh",
      email: "bloodlab@hospital.com",
      password,
      specialization: "Hematologist",
      department: "Blood Lab",
      available: true,
    },
  });

  // Cardiac Lab
  await prisma.doctor.upsert({
    where: { email: "cardiaclab@hospital.com" },
    update: {},
    create: {
      name: "Dr. Priya Nair",
      email: "cardiaclab@hospital.com",
      password,
      specialization: "Cardiac Diagnostics",
      department: "Cardiac Lab",
      available: true,
    },
  });

  console.log("✅ Lab doctors seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });