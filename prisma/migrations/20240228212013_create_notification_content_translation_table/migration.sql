/*
  Warnings:

  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Notification` DROP COLUMN `content`,
    ADD COLUMN `notificationContentId` INTEGER NULL;

-- CreateTable
CREATE TABLE `NotificationContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationContentTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NULL,
    `language` ENUM('en', 'ar') NULL,
    `notificationContentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `NotificationContentTranslation_notificationContentId_languag_key`(`notificationContentId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_notificationContentId_fkey` FOREIGN KEY (`notificationContentId`) REFERENCES `NotificationContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationContentTranslation` ADD CONSTRAINT `NotificationContentTranslation_notificationContentId_fkey` FOREIGN KEY (`notificationContentId`) REFERENCES `NotificationContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
