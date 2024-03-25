-- DropForeignKey
ALTER TABLE `ParentsChilds` DROP FOREIGN KEY `ParentsChilds_childId_fkey`;

-- DropForeignKey
ALTER TABLE `ParentsChilds` DROP FOREIGN KEY `ParentsChilds_parentId_fkey`;

-- AddForeignKey
ALTER TABLE `ParentsChilds` ADD CONSTRAINT `ParentsChilds_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentsChilds` ADD CONSTRAINT `ParentsChilds_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
