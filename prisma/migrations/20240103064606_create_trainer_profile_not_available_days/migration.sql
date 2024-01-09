-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `type` ENUM('work', 'override') NOT NULL DEFAULT 'work';

-- CreateTable
CREATE TABLE `TrainerProfileNotAvailableDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayDate` DATETIME(3) NOT NULL,
    `trainerProfileId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrainerProfileNotAvailableDays` ADD CONSTRAINT `TrainerProfileNotAvailableDays_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
