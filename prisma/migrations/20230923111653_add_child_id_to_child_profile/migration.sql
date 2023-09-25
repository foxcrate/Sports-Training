/*
  Warnings:

  - A unique constraint covering the columns `[childId]` on the table `ChildProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `childId` to the `ChildProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ChildProfile` ADD COLUMN `childId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ChildProfile_childId_key` ON `ChildProfile`(`childId`);

-- AddForeignKey
ALTER TABLE `ChildProfile` ADD CONSTRAINT `ChildProfile_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
