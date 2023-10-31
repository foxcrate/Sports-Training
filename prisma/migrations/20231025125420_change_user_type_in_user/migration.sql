/*
  Warnings:

  - The values [player,trainer,both] on the enum `User_userType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `userType` ENUM('admin', 'user', 'child') NULL;
