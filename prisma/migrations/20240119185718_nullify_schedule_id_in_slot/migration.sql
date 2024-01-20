-- DropForeignKey
ALTER TABLE `Slot` DROP FOREIGN KEY `Slot_scheduleId_fkey`;

-- AlterTable
ALTER TABLE `Slot` MODIFY `scheduleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
