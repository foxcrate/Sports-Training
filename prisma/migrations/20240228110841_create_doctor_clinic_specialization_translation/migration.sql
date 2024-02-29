-- CreateTable
CREATE TABLE `DoctorClinicSpecializationTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `language` ENUM('en', 'ar') NULL,
    `doctorClinicSpecializationId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DoctorClinicSpecializationTranslation_doctorClinicSpecializa_key`(`doctorClinicSpecializationId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorClinicSpecializationTranslation` ADD CONSTRAINT `DoctorClinicSpecializationTranslation_doctorClinicSpecializ_fkey` FOREIGN KEY (`doctorClinicSpecializationId`) REFERENCES `DoctorClinicSpecialization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
