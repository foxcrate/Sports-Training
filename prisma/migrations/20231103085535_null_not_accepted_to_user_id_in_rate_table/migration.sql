/*
  Warnings:

  - Made the column `userId` on table `Rate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Rate` DROP FOREIGN KEY `Rate_userId_fkey`;

-- AlterTable
ALTER TABLE `Rate` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
