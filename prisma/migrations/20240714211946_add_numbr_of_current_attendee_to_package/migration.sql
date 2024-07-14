-- AlterTable
ALTER TABLE `Package` ADD COLUMN `currentAttendeesNumber` INTEGER NULL;

-- AlterTable
ALTER TABLE `PlayerProfilePackages` ADD COLUMN `sessionsTaken` INTEGER NOT NULL DEFAULT 0;
