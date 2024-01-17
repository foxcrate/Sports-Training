-- AlterTable
ALTER TABLE `SessionRequest` ADD COLUMN `canceledBy` ENUM('player', 'trainer') NULL,
    ADD COLUMN `cancellationReasonsId` INTEGER NULL,
    MODIFY `status` ENUM('pending', 'accepted', 'rejected', 'canceled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `TrainerProfile` ADD COLUMN `defaultCancellationTime` INTEGER NULL;

-- CreateTable
CREATE TABLE `CancellationReasons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SessionRequest` ADD CONSTRAINT `SessionRequest_cancellationReasonsId_fkey` FOREIGN KEY (`cancellationReasonsId`) REFERENCES `CancellationReasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
