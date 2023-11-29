-- AlterTable
ALTER TABLE `TrainerProfile` ADD COLUMN `ageGroup` ENUM('kids', 'young_adults', 'adults') NOT NULL DEFAULT 'young_adults';

-- CreateTable
CREATE TABLE `TrainerProfileFields` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trainerProfileId` INTEGER NOT NULL,
    `fieldId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TrainerProfileFields_trainerProfileId_fieldId_key`(`trainerProfileId`, `fieldId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrainerProfileFields` ADD CONSTRAINT `TrainerProfileFields_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfileFields` ADD CONSTRAINT `TrainerProfileFields_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
