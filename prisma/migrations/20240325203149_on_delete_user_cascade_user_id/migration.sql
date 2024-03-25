-- DropForeignKey
ALTER TABLE `DoctorClinicsBookedHours` DROP FOREIGN KEY `DoctorClinicsBookedHours_userId_fkey`;

-- DropForeignKey
ALTER TABLE `FieldsBookedHours` DROP FOREIGN KEY `FieldsBookedHours_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerBookedSession` DROP FOREIGN KEY `TrainerBookedSession_userId_fkey`;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldsBookedHours` ADD CONSTRAINT `FieldsBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicsBookedHours` ADD CONSTRAINT `DoctorClinicsBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
