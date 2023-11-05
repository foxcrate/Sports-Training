-- CreateTable
CREATE TABLE `Rate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ratingNumber` INTEGER NULL,
    `feedback` VARCHAR(191) NULL,
    `rateableType` ENUM('trainer', 'field', 'doctorClinic') NOT NULL,
    `fieldId` INTEGER NULL,
    `doctorClinicId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
