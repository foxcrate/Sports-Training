/*
  Warnings:

  - You are about to drop the `DoctorClinicBookedHours` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DoctorClinicBookedHours` DROP FOREIGN KEY `DoctorClinicBookedHours_doctorClinicId_fkey`;

-- DropForeignKey
ALTER TABLE `DoctorClinicBookedHours` DROP FOREIGN KEY `DoctorClinicBookedHours_userId_fkey`;

-- DropTable
DROP TABLE `DoctorClinicBookedHours`;

-- CreateTable
CREATE TABLE `DoctorClinicsBookedHours` (
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
ALTER TABLE `DoctorClinicsBookedHours` ADD CONSTRAINT `DoctorClinicsBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicsBookedHours` ADD CONSTRAINT `DoctorClinicsBookedHours_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
