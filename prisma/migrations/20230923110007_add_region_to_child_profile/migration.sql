-- AlterTable
ALTER TABLE `ChildProfile` ADD COLUMN `regionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ChildProfile` ADD CONSTRAINT `ChildProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
