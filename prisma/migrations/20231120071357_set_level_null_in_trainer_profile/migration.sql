-- AlterTable
ALTER TABLE `TrainerProfile` MODIFY `level` ENUM('beginner', 'intermediate', 'advanced') NULL DEFAULT 'beginner',
    MODIFY `ageGroup` ENUM('kids', 'young_adults', 'adults') NULL DEFAULT 'young_adults';
