-- AlterTable
ALTER TABLE `Package` ADD COLUMN `status` ENUM('active', 'pending', 'expired') NULL DEFAULT 'pending';
