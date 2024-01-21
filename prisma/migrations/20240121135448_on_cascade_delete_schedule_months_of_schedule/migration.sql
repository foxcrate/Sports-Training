-- DropForeignKey
ALTER TABLE `SchedulesMonths` DROP FOREIGN KEY `SchedulesMonths_scheduleId_fkey`;

-- AlterTable
ALTER TABLE `TrainerProfile` MODIFY `hoursPriorToBooking` INTEGER NULL DEFAULT 24;

-- AddForeignKey
ALTER TABLE `SchedulesMonths` ADD CONSTRAINT `SchedulesMonths_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
