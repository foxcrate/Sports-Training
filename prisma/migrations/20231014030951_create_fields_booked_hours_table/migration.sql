-- CreateTable
CREATE TABLE `FieldsBookedHours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromDateTime` DATETIME(3) NOT NULL,
    `toDateTime` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `fieldId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FieldsBookedHours` ADD CONSTRAINT `FieldsBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldsBookedHours` ADD CONSTRAINT `FieldsBookedHours_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
