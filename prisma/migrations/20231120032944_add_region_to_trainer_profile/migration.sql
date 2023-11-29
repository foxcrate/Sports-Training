-- AlterTable
ALTER TABLE `TrainerProfile` ADD COLUMN `regionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TrainerProfile` ADD CONSTRAINT `TrainerProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
