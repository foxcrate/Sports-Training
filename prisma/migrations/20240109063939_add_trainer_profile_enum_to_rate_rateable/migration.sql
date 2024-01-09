/*
  Warnings:

  - The values [trainer] on the enum `Rate_rateableType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Rate` MODIFY `rateableType` ENUM('trainerProfile', 'field', 'doctorClinic') NOT NULL;
