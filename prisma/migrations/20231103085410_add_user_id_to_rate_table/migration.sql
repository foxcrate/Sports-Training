-- AlterTable
ALTER TABLE `Rate` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
