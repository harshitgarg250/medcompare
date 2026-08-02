/*
  Warnings:

  - You are about to drop the column `notes` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `slotId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `Booking` table. All the data in the column will be lost.
  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `doctorName` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `healthScore` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportGeneratedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `riskLevel` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `sampleCollectedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `sampleReceivedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `sampleType` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `technicianName` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TestPrice` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `TestPrice` table. All the data in the column will be lost.
  - You are about to drop the column `reportTime` on the `TestPrice` table. All the data in the column will be lost.
  - You are about to drop the `ReportResult` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[testId,hospitalId]` on the table `TestPrice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentDate` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_slotId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_testId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_testId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReportResult" DROP CONSTRAINT "ReportResult_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Slot" DROP CONSTRAINT "Slot_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "TestPrice" DROP CONSTRAINT "TestPrice_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "TestPrice" DROP CONSTRAINT "TestPrice_testId_fkey";

-- DropIndex
DROP INDEX "Booking_slotId_key";

-- DropIndex
DROP INDEX "Report_bookingId_key";

-- DropIndex
DROP INDEX "Report_reportId_key";

-- DropIndex
DROP INDEX "TestPrice_hospitalId_testId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "notes",
DROP COLUMN "slotId",
DROP COLUMN "totalPrice",
ADD COLUMN     "appointmentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slot" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "testId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "homeServiceAvailable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "doctorName",
DROP COLUMN "healthScore",
DROP COLUMN "notes",
DROP COLUMN "reportGeneratedAt",
DROP COLUMN "reportId",
DROP COLUMN "riskLevel",
DROP COLUMN "sampleCollectedAt",
DROP COLUMN "sampleReceivedAt",
DROP COLUMN "sampleType",
DROP COLUMN "technicianName",
DROP COLUMN "testId",
DROP COLUMN "updatedAt",
ADD COLUMN     "reportUrl" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "testId";

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "category",
DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "TestPrice" DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "reportTime",
ADD COLUMN     "testName" TEXT;

-- DropTable
DROP TABLE "ReportResult";

-- DropEnum
DROP TYPE "BookingStatus";

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TestPrice_testId_hospitalId_key" ON "TestPrice"("testId", "hospitalId");

-- AddForeignKey
ALTER TABLE "TestPrice" ADD CONSTRAINT "TestPrice_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPrice" ADD CONSTRAINT "TestPrice_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
