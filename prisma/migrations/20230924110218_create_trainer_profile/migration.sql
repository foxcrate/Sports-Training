-- CreateTable
CREATE TABLE `TrainerProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
