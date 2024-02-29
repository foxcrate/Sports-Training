/*
  Warnings:

  - You are about to drop the column `weekDayName` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `weekDayNumber` on the `Slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Slot` DROP COLUMN `weekDayName`,
    DROP COLUMN `weekDayNumber`,
    ADD COLUMN `weekDayId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_weekDayId_fkey` FOREIGN KEY (`weekDayId`) REFERENCES `WeekDay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
