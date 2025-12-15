import { PrismaClient } from "@prisma/client";

// Create a singleton PrismaClient instance
const prisma = new PrismaClient({
  log: ["error", "warn"],
  errorFormat: "pretty",
});

// Handle potential connection issues
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

// Add shutdown hooks
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from database");
});

export default prisma;
