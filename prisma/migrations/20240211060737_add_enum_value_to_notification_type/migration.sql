/*
  Warnings:

  - The values [sessionRequest] on the enum `Notification_about` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notification` MODIFY `about` ENUM('trainerSession', 'clinicSession', 'fieldSession') NULL,
    MODIFY `type` ENUM('request', 'accept', 'reject') NULL;
