-- DropForeignKey
ALTER TABLE `SessionRequest` DROP FOREIGN KEY `SessionRequest_trainerBookedSessionId_fkey`;

-- AddForeignKey
ALTER TABLE `SessionRequest` ADD CONSTRAINT `SessionRequest_trainerBookedSessionId_fkey` FOREIGN KEY (`trainerBookedSessionId`) REFERENCES `TrainerBookedSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
