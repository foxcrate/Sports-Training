-- CreateTable
CREATE TABLE `FieldNotAvailableDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayDate` DATETIME(3) NOT NULL,
    `fieldId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FieldNotAvailableDays` ADD CONSTRAINT `FieldNotAvailableDays_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
