/*
  Warnings:

  - The values [clinicSession,fieldSession] on the enum `Notification_about` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `trainerBookedSessionId` INTEGER NULL,
    MODIFY `about` ENUM('trainerSession') NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_trainerBookedSessionId_fkey` FOREIGN KEY (`trainerBookedSessionId`) REFERENCES `TrainerBookedSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
