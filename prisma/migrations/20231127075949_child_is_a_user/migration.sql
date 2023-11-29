/*
  Warnings:

  - You are about to drop the `Child` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChildProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChildProfileSports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Child` DROP FOREIGN KEY `Child_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ChildProfile` DROP FOREIGN KEY `ChildProfile_childId_fkey`;

-- DropForeignKey
ALTER TABLE `ChildProfile` DROP FOREIGN KEY `ChildProfile_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `ChildProfileSports` DROP FOREIGN KEY `ChildProfileSports_childProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `ChildProfileSports` DROP FOREIGN KEY `ChildProfileSports_sportId_fkey`;

-- DropTable
DROP TABLE `Child`;

-- DropTable
DROP TABLE `ChildProfile`;

-- DropTable
DROP TABLE `ChildProfileSports`;

-- CreateTable
CREATE TABLE `ParentsChilds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentId` INTEGER NOT NULL,
    `childId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ParentsChilds` ADD CONSTRAINT `ParentsChilds_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentsChilds` ADD CONSTRAINT `ParentsChilds_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
