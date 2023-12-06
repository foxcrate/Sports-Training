-- DropForeignKey
ALTER TABLE `Field` DROP FOREIGN KEY `Field_addedByUserId_fkey`;

-- AddForeignKey
ALTER TABLE `Field` ADD CONSTRAINT `Field_addedByUserId_fkey` FOREIGN KEY (`addedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
