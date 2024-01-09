-- AlterTable
ALTER TABLE `Rate` ADD COLUMN `trainerProfileId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
