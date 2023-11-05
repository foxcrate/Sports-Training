/*
  Warnings:

  - You are about to drop the column `arName` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `enName` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `arName` on the `Sport` table. All the data in the column will be lost.
  - You are about to drop the column `enName` on the `Sport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DoctorClinic` ADD COLUMN `doctorClinicSpecializationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Region` DROP COLUMN `arName`,
    DROP COLUMN `enName`,
    ADD COLUMN `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Sport` DROP COLUMN `arName`,
    DROP COLUMN `enName`,
    ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `DoctorClinicSpecialization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorClinic` ADD CONSTRAINT `DoctorClinic_doctorClinicSpecializationId_fkey` FOREIGN KEY (`doctorClinicSpecializationId`) REFERENCES `DoctorClinicSpecialization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
