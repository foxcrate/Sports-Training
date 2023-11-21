/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `TrainerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TrainerProfileSports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `TrainerProfile` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `TrainerProfileSports` DROP COLUMN `updatedAt`;
