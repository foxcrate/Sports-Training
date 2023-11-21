/*
  Warnings:

  - Added the required column `cost` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Slot` ADD COLUMN `cost` INTEGER NOT NULL,
    ADD COLUMN `from` TIME NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `to` TIME NOT NULL,
    ADD COLUMN `weekDayName` VARCHAR(191) NULL,
    ADD COLUMN `weekDayNumber` INTEGER NULL;
