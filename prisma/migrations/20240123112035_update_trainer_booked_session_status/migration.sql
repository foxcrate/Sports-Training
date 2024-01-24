/*
  Warnings:

  - You are about to alter the column `status` on the `TrainerBookedSession` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(6))`.

*/
-- AlterTable
ALTER TABLE `TrainerBookedSession` MODIFY `status` ENUM('upcoming', 'completed', 'canceled') NOT NULL DEFAULT 'upcoming';
