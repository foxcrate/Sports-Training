-- AlterTable
ALTER TABLE `User` MODIFY `gender` ENUM('Female', 'Male', 'Unknown') NOT NULL DEFAULT 'Unknown';
