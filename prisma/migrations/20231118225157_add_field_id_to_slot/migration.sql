-- AlterTable
ALTER TABLE `Slot` ADD COLUMN `fieldId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
