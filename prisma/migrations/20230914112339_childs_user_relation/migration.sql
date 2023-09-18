/*
  Warnings:

  - You are about to alter the column `gender` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `gender` ENUM('female', 'male') NULL;

-- CreateTable
CREATE TABLE `Child` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `gender` ENUM('female', 'male') NULL,
    `birthday` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Child_email_key`(`email`),
    UNIQUE INDEX `Child_mobileNumber_key`(`mobileNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Child` ADD CONSTRAINT `Child_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
