/*
  Warnings:

  - You are about to drop the column `canceledBy` on the `SessionRequest` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationReasonsId` on the `SessionRequest` table. All the data in the column will be lost.
  - The values [canceled] on the enum `SessionRequest_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `SessionRequest` DROP FOREIGN KEY `SessionRequest_cancellationReasonsId_fkey`;

-- AlterTable
ALTER TABLE `SessionRequest` DROP COLUMN `canceledBy`,
    DROP COLUMN `cancellationReasonsId`,
    MODIFY `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `TrainerBookedSession` ADD COLUMN `canceledBy` ENUM('player', 'trainer') NULL,
    ADD COLUMN `cancellationReasonsId` INTEGER NULL,
    MODIFY `status` ENUM('active', 'notActive', 'canceled') NOT NULL DEFAULT 'notActive';

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_cancellationReasonsId_fkey` FOREIGN KEY (`cancellationReasonsId`) REFERENCES `CancellationReasons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
