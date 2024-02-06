/*
  Warnings:

  - A unique constraint covering the columns `[date,slotId,status]` on the table `TrainerBookedSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `TrainerBookedSession_date_slotId_key` ON `TrainerBookedSession`;

-- CreateIndex
CREATE UNIQUE INDEX `TrainerBookedSession_date_slotId_status_key` ON `TrainerBookedSession`(`date`, `slotId`, `status`);
