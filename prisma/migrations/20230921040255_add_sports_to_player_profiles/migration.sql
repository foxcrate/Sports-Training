-- CreateTable
CREATE TABLE `PlayerProfileSports` (
    `playerProfileId` INTEGER NOT NULL,
    `sportId` INTEGER NOT NULL,

    PRIMARY KEY (`playerProfileId`, `sportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlayerProfileSports` ADD CONSTRAINT `PlayerProfileSports_playerProfileId_fkey` FOREIGN KEY (`playerProfileId`) REFERENCES `PlayerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProfileSports` ADD CONSTRAINT `PlayerProfileSports_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
