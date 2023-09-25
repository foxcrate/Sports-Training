-- AlterTable
ALTER TABLE `PlayerProfile` ADD COLUMN `level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner';
