/*
  Warnings:

  - Added the required column `toDateTime` to the `FieldsBookedHours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FieldsBookedHours` ADD COLUMN `toDateTime` DATETIME(3) NOT NULL;
