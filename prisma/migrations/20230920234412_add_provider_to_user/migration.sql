-- AlterTable
ALTER TABLE `User` ADD COLUMN `provider` ENUM('facebook', 'google', 'apple', 'native') NOT NULL DEFAULT 'native';
