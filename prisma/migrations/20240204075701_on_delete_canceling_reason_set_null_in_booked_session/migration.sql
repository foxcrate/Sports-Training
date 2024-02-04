-- DropForeignKey
ALTER TABLE `TrainerBookedSession` DROP FOREIGN KEY `TrainerBookedSession_cancellationReasonsId_fkey`;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_cancellationReasonsId_fkey` FOREIGN KEY (`cancellationReasonsId`) REFERENCES `CancellationReasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
