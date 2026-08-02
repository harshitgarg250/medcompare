const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
    process.exit(1);
  }
}

module.exports = {
  prisma,
  connectDB,
};