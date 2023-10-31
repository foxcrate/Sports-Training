-- AlterTable
ALTER TABLE `Field` ADD COLUMN `addedByUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Field` ADD CONSTRAINT `Field_addedByUserId_fkey` FOREIGN KEY (`addedByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
