/*
  Warnings:

  - Added the required column `updatedAt` to the `PlayerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PlayerProfileSports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Region` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PlayerProfile` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `PlayerProfileSports` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Region` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Sport` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
