-- CreateTable
CREATE TABLE `ChildProfileSports` (
    `childProfileId` INTEGER NOT NULL,
    `sportId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`childProfileId`, `sportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChildProfileSports` ADD CONSTRAINT `ChildProfileSports_childProfileId_fkey` FOREIGN KEY (`childProfileId`) REFERENCES `ChildProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildProfileSports` ADD CONSTRAINT `ChildProfileSports_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
