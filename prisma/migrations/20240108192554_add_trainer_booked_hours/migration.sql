-- CreateTable
CREATE TABLE `TrainerBookedSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('active', 'notActive') NOT NULL DEFAULT 'active',
    `gmt` INTEGER NOT NULL DEFAULT 0,
    `date` DATE NOT NULL,
    `userId` INTEGER NOT NULL,
    `trainerProfileId` INTEGER NOT NULL,
    `slotId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TrainerBookedSession_date_slotId_key`(`date`, `slotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trainerBookedSessionId` INTEGER NOT NULL,
    `type` ENUM('new', 'change') NOT NULL DEFAULT 'new',
    `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SessionRequest_trainerBookedSessionId_key`(`trainerBookedSessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainerBookedSession` ADD CONSTRAINT `TrainerBookedSession_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `Slot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionRequest` ADD CONSTRAINT `SessionRequest_trainerBookedSessionId_fkey` FOREIGN KEY (`trainerBookedSessionId`) REFERENCES `TrainerBookedSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
