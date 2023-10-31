-- AlterTable
ALTER TABLE `Field` ADD COLUMN `acceptanceStatus` ENUM('accepted', 'pending', 'declined') NOT NULL DEFAULT 'pending';
