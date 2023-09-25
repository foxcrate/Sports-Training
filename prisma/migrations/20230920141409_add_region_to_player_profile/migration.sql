-- AlterTable
ALTER TABLE `PlayerProfile` ADD COLUMN `regionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PlayerProfile` ADD CONSTRAINT `PlayerProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
