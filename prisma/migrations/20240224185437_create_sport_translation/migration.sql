/*
  Warnings:

  - You are about to drop the column `name_ar` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `name_ar` on the `Sport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Region` DROP COLUMN `name_ar`;

-- AlterTable
ALTER TABLE `Sport` DROP COLUMN `name_ar`;

-- CreateTable
CREATE TABLE `SportTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `language` ENUM('en', 'ar') NULL,
    `sportId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SportTranslation` ADD CONSTRAINT `SportTranslation_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
