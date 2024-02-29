-- CreateTable
CREATE TABLE `WeekDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayNumber` INTEGER NULL,
    `dayName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeekDayTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayName` VARCHAR(191) NULL,
    `language` ENUM('en', 'ar') NULL,
    `weekDayId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WeekDayTranslation_weekDayId_language_key`(`weekDayId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WeekDayTranslation` ADD CONSTRAINT `WeekDayTranslation_weekDayId_fkey` FOREIGN KEY (`weekDayId`) REFERENCES `WeekDay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
