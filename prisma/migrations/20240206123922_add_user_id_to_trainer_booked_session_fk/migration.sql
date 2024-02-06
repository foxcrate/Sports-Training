/*
  Warnings:

  - A unique constraint covering the columns `[date,slotId,userId]` on the table `TrainerBookedSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `TrainerBookedSession_date_slotId_status_key` ON `TrainerBookedSession`;

-- CreateIndex
CREATE UNIQUE INDEX `TrainerBookedSession_date_slotId_userId_key` ON `TrainerBookedSession`(`date`, `slotId`, `userId`);
