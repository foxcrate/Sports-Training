-- AlterTable
ALTER TABLE `SessionRequest` ADD COLUMN `declineReasonId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SessionRequest` ADD CONSTRAINT `SessionRequest_declineReasonId_fkey` FOREIGN KEY (`declineReasonId`) REFERENCES `CancellationReasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
