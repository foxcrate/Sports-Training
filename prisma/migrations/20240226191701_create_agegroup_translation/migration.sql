-- CreateTable
CREATE TABLE `AgeGroupTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `language` ENUM('en', 'ar') NULL,
    `ageGroupId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monthName` VARCHAR(191) NULL,
    `language` ENUM('en', 'ar') NULL,
    `monthId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AgeGroupTranslation` ADD CONSTRAINT `AgeGroupTranslation_ageGroupId_fkey` FOREIGN KEY (`ageGroupId`) REFERENCES `AgeGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthTranslation` ADD CONSTRAINT `MonthTranslation_monthId_fkey` FOREIGN KEY (`monthId`) REFERENCES `Month`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
