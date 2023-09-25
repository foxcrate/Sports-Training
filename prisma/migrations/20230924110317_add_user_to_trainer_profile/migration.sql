/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TrainerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `TrainerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TrainerProfile` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TrainerProfile_userId_key` ON `TrainerProfile`(`userId`);

-- AddForeignKey
ALTER TABLE `TrainerProfile` ADD CONSTRAINT `TrainerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
