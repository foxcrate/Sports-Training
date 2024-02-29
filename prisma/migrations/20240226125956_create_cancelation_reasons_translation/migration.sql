-- CreateTable
CREATE TABLE `CancellationReasonsTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `language` ENUM('en', 'ar') NULL,
    `CancellationReasonsId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CancellationReasonsTranslation` ADD CONSTRAINT `CancellationReasonsTranslation_CancellationReasonsId_fkey` FOREIGN KEY (`CancellationReasonsId`) REFERENCES `CancellationReasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
