/*
  Warnings:

  - You are about to drop the column `rating` on the `Field` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Field` DROP COLUMN `rating`;

-- CreateTable
CREATE TABLE `DoctorClinic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `cost` INTEGER NULL,
    `slotDuration` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `longitude` DECIMAL(65, 30) NULL,
    `latitude` DECIMAL(65, 30) NULL,
    `profileImage` VARCHAR(191) NULL,
    `acceptanceStatus` ENUM('accepted', 'pending', 'declined') NOT NULL DEFAULT 'pending',
    `availableWeekDays` JSON NULL,
    `availableDayHours` JSON NULL,
    `addedByUserId` INTEGER NULL,
    `regionId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorClinicNotAvailableDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayDate` DATETIME(3) NOT NULL,
    `doctorClinicId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorClinicBookedHours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromDateTime` DATETIME(3) NOT NULL,
    `gmt` INTEGER NOT NULL DEFAULT 0,
    `userId` INTEGER NOT NULL,
    `doctorClinicId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorClinic` ADD CONSTRAINT `DoctorClinic_addedByUserId_fkey` FOREIGN KEY (`addedByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinic` ADD CONSTRAINT `DoctorClinic_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicNotAvailableDays` ADD CONSTRAINT `DoctorClinicNotAvailableDays_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicBookedHours` ADD CONSTRAINT `DoctorClinicBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicBookedHours` ADD CONSTRAINT `DoctorClinicBookedHours_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
