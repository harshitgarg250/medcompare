/*
  Warnings:

  - You are about to drop the column `slot` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "slot",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "slotId" INTEGER,
ADD COLUMN     "totalPrice" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."Test"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."Slot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
