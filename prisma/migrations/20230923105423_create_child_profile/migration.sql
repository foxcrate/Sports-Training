-- CreateTable
CREATE TABLE `ChildProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` ENUM('beginner', 'intermediate', 'advanced') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
