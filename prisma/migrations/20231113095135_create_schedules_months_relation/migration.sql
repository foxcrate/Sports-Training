-- CreateTable
CREATE TABLE `SchedulesMonths` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheduleId` INTEGER NOT NULL,
    `monthId` INTEGER NOT NULL,

    UNIQUE INDEX `SchedulesMonths_scheduleId_monthId_key`(`scheduleId`, `monthId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SchedulesMonths` ADD CONSTRAINT `SchedulesMonths_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SchedulesMonths` ADD CONSTRAINT `SchedulesMonths_monthId_fkey` FOREIGN KEY (`monthId`) REFERENCES `Month`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
