/*
  Warnings:

  - You are about to drop the column `ageGroup` on the `TrainerProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `TrainerProfile` DROP COLUMN `ageGroup`,
    ADD COLUMN `ageGroupId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AgeGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrainerProfile` ADD CONSTRAINT `TrainerProfile_ageGroupId_fkey` FOREIGN KEY (`ageGroupId`) REFERENCES `AgeGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
