-- AlterTable
ALTER TABLE `User` MODIFY `userType` ENUM('admin', 'user', 'child') NULL DEFAULT 'user';
