/*
  Warnings:

  - The `newSessionDate` column on the `SessionRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `newSlotId` on the `SessionRequest` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `SessionRequest` DROP COLUMN `newSessionDate`,
    ADD COLUMN `newSessionDate` DATE NULL,
    MODIFY `newSlotId` INTEGER NULL;
