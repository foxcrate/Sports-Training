-- DropForeignKey
ALTER TABLE `AgeGroupTranslation` DROP FOREIGN KEY `AgeGroupTranslation_ageGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `CancellationReasonsTranslation` DROP FOREIGN KEY `CancellationReasonsTranslation_cancellationReasonsId_fkey`;

-- DropForeignKey
ALTER TABLE `DoctorClinicNotAvailableDays` DROP FOREIGN KEY `DoctorClinicNotAvailableDays_doctorClinicId_fkey`;

-- DropForeignKey
ALTER TABLE `DoctorClinicSpecializationTranslation` DROP FOREIGN KEY `DoctorClinicSpecializationTranslation_doctorClinicSpecializ_fkey`;

-- DropForeignKey
ALTER TABLE `DoctorClinicsBookedHours` DROP FOREIGN KEY `DoctorClinicsBookedHours_doctorClinicId_fkey`;

-- DropForeignKey
ALTER TABLE `FeedbackTranslation` DROP FOREIGN KEY `FeedbackTranslation_feedbackId_fkey`;

-- DropForeignKey
ALTER TABLE `FieldNotAvailableDays` DROP FOREIGN KEY `FieldNotAvailableDays_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `FieldsBookedHours` DROP FOREIGN KEY `FieldsBookedHours_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `GenderTranslation` DROP FOREIGN KEY `GenderTranslation_genderId_fkey`;

-- DropForeignKey
ALTER TABLE `LevelTranslation` DROP FOREIGN KEY `LevelTranslation_levelId_fkey`;

-- DropForeignKey
ALTER TABLE `MonthTranslation` DROP FOREIGN KEY `MonthTranslation_monthId_fkey`;

-- DropForeignKey
ALTER TABLE `NotificationContentTranslation` DROP FOREIGN KEY `NotificationContentTranslation_notificationContentId_fkey`;

-- DropForeignKey
ALTER TABLE `PlayerProfile` DROP FOREIGN KEY `PlayerProfile_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `PlayerProfileSports` DROP FOREIGN KEY `PlayerProfileSports_playerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `PlayerProfileSports` DROP FOREIGN KEY `PlayerProfileSports_sportId_fkey`;

-- DropForeignKey
ALTER TABLE `RegionTranslation` DROP FOREIGN KEY `RegionTranslation_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_trainerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `SchedulesMonths` DROP FOREIGN KEY `SchedulesMonths_monthId_fkey`;

-- DropForeignKey
ALTER TABLE `Slot` DROP FOREIGN KEY `Slot_weekDayId_fkey`;

-- DropForeignKey
ALTER TABLE `SportTranslation` DROP FOREIGN KEY `SportTranslation_sportId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerBookedSession` DROP FOREIGN KEY `TrainerBookedSession_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerBookedSession` DROP FOREIGN KEY `TrainerBookedSession_trainerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerProfile` DROP FOREIGN KEY `TrainerProfile_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerProfileFields` DROP FOREIGN KEY `TrainerProfileFields_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerProfileFields` DROP FOREIGN KEY `TrainerProfileFields_trainerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerProfileNotAvailableDays` DROP FOREIGN KEY `TrainerProfileNotAvailableDays_trainerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerProfileSports` DROP FOREIGN KEY `TrainerProfileSports_sportId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerProfileSports` DROP FOREIGN KEY `TrainerProfileSports_trainerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `WeekDayTranslation` DROP FOREIGN KEY `WeekDayTranslation_weekDayId_fkey`;

-- AddForeignKey
ALTER TABLE `GenderTranslation` ADD CONSTRAINT `GenderTranslation_genderId_fkey` FOREIGN KEY (`genderId`) REFERENCES `Gender`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProfile` ADD CONSTRAINT `PlayerProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProfileSports` ADD CONSTRAINT `PlayerProfileSports_playerProfileId_fkey` FOREIGN KEY (`playerProfileId`) REFERENCES `PlayerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProfileSports` ADD CONSTRAINT `PlayerProfileSports_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfile` ADD CONSTRAINT `TrainerProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LevelTranslation` ADD CONSTRAINT `LevelTranslation_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `Level`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgeGroupTranslation` ADD CONSTRAINT `AgeGroupTranslation_ageGroupId_fkey` FOREIGN KEY (`ageGroupId`) REFERENCES `AgeGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_weekDayId_fkey` FOREIGN KEY (`weekDayId`) REFERENCES `WeekDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeekDayTranslation` ADD CONSTRAINT `WeekDayTranslation_weekDayId_fkey` FOREIGN KEY (`weekDayId`) REFERENCES `WeekDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthTranslation` ADD CONSTRAINT `MonthTranslation_monthId_fkey` FOREIGN KEY (`monthId`) REFERENCES `Month`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SchedulesMonths` ADD CONSTRAINT `SchedulesMonths_monthId_fkey` FOREIGN KEY (`monthId`) REFERENCES `Month`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfileSports` ADD CONSTRAINT `TrainerProfileSports_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfileSports` ADD CONSTRAINT `TrainerProfileSports_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfileFields` ADD CONSTRAINT `TrainerProfileFields_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfileFields` ADD CONSTRAINT `TrainerProfileFields_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `Slot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancellationReasonsTranslation` ADD CONSTRAINT `CancellationReasonsTranslation_cancellationReasonsId_fkey` FOREIGN KEY (`cancellationReasonsId`) REFERENCES `CancellationReasons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerProfileNotAvailableDays` ADD CONSTRAINT `TrainerProfileNotAvailableDays_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicSpecializationTranslation` ADD CONSTRAINT `DoctorClinicSpecializationTranslation_doctorClinicSpecializ_fkey` FOREIGN KEY (`doctorClinicSpecializationId`) REFERENCES `DoctorClinicSpecialization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldNotAvailableDays` ADD CONSTRAINT `FieldNotAvailableDays_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicNotAvailableDays` ADD CONSTRAINT `DoctorClinicNotAvailableDays_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldsBookedHours` ADD CONSTRAINT `FieldsBookedHours_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorClinicsBookedHours` ADD CONSTRAINT `DoctorClinicsBookedHours_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SportTranslation` ADD CONSTRAINT `SportTranslation_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegionTranslation` ADD CONSTRAINT `RegionTranslation_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedbackTranslation` ADD CONSTRAINT `FeedbackTranslation_feedbackId_fkey` FOREIGN KEY (`feedbackId`) REFERENCES `Feedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationContentTranslation` ADD CONSTRAINT `NotificationContentTranslation_notificationContentId_fkey` FOREIGN KEY (`notificationContentId`) REFERENCES `NotificationContent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
