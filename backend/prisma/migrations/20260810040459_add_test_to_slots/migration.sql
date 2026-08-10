/*
  Warnings:

  - A unique constraint covering the columns `[hospitalId,testId,date,time]` on the table `Slot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `testId` to the `Slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Slot" ADD COLUMN     "testId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Slot_hospitalId_testId_date_time_key" ON "public"."Slot"("hospitalId", "testId", "date", "time");

-- AddForeignKey
ALTER TABLE "public"."Slot" ADD CONSTRAINT "Slot_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
