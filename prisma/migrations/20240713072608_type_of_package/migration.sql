-- AlterTable
ALTER TABLE `Package` ADD COLUMN `secondaryFieldId` INTEGER NULL,
    ADD COLUMN `type` ENUM('flexible', 'schedule') NULL;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_secondaryFieldId_fkey` FOREIGN KEY (`secondaryFieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
