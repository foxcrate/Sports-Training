/*
  Warnings:

  - You are about to drop the column `from` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Slot` table. All the data in the column will be lost.
  - Added the required column `fromTime` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toTime` to the `Slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Slot` DROP COLUMN `from`,
    DROP COLUMN `to`,
    ADD COLUMN `fromTime` TIME NOT NULL,
    ADD COLUMN `toTime` TIME NOT NULL;
