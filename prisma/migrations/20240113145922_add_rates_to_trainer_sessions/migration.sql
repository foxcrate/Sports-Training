-- AlterTable
ALTER TABLE `Rate` ADD COLUMN `playerProfileId` INTEGER NULL,
    ADD COLUMN `profileType` ENUM('player', 'trainer') NOT NULL DEFAULT 'player',
    ADD COLUMN `trainerBookedSessionId` INTEGER NULL,
    MODIFY `rateableType` ENUM('trainerProfile', 'playerProfile', 'session', 'field', 'doctorClinic') NOT NULL;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_playerProfileId_fkey` FOREIGN KEY (`playerProfileId`) REFERENCES `PlayerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_trainerBookedSessionId_fkey` FOREIGN KEY (`trainerBookedSessionId`) REFERENCES `TrainerBookedSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
