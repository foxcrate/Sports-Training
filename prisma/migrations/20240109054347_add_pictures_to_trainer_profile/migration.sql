-- AlterTable
ALTER TABLE `Picture` ADD COLUMN `trainerProfileId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Picture` ADD CONSTRAINT `Picture_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
