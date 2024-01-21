-- AlterTable
ALTER TABLE `TrainerProfile` ADD COLUMN `hoursPriorToBooking` INTEGER NULL DEFAULT 8,
    MODIFY `cost` INTEGER NULL DEFAULT 200;
