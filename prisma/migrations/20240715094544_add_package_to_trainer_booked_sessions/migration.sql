-- AlterTable
ALTER TABLE `TrainerBookedSession` ADD COLUMN `packageId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
