/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `DoctorClinic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DoctorClinicNotAvailableDays` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DoctorClinicSpecialization` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DoctorClinicsBookedHours` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FieldNotAvailableDays` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FieldsBookedHours` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PlayerProfileSports` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Sport` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TrainerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TrainerProfileSports` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DoctorClinic` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `DoctorClinicNotAvailableDays` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `DoctorClinicSpecialization` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `DoctorClinicsBookedHours` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Field` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `FieldNotAvailableDays` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `FieldsBookedHours` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `OTP` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `PlayerProfile` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `PlayerProfileSports` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Region` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Sport` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `TrainerProfile` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `TrainerProfileSports` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `updatedAt`;
