/*
  Warnings:

  - You are about to drop the column `CancellationReasonsId` on the `CancellationReasonsTranslation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ageGroupId,language]` on the table `AgeGroupTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cancellationReasonsId,language]` on the table `CancellationReasonsTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[feedbackId,language]` on the table `FeedbackTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[monthId,language]` on the table `MonthTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[regionId,language]` on the table `RegionTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sportId,language]` on the table `SportTranslation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `CancellationReasonsTranslation` DROP FOREIGN KEY `CancellationReasonsTranslation_CancellationReasonsId_fkey`;

-- AlterTable
ALTER TABLE `CancellationReasonsTranslation` DROP COLUMN `CancellationReasonsId`,
    ADD COLUMN `cancellationReasonsId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AgeGroupTranslation_ageGroupId_language_key` ON `AgeGroupTranslation`(`ageGroupId`, `language`);

-- CreateIndex
CREATE UNIQUE INDEX `CancellationReasonsTranslation_cancellationReasonsId_languag_key` ON `CancellationReasonsTranslation`(`cancellationReasonsId`, `language`);

-- CreateIndex
CREATE UNIQUE INDEX `FeedbackTranslation_feedbackId_language_key` ON `FeedbackTranslation`(`feedbackId`, `language`);

-- CreateIndex
CREATE UNIQUE INDEX `MonthTranslation_monthId_language_key` ON `MonthTranslation`(`monthId`, `language`);

-- CreateIndex
CREATE UNIQUE INDEX `RegionTranslation_regionId_language_key` ON `RegionTranslation`(`regionId`, `language`);

-- CreateIndex
CREATE UNIQUE INDEX `SportTranslation_sportId_language_key` ON `SportTranslation`(`sportId`, `language`);

-- AddForeignKey
ALTER TABLE `CancellationReasonsTranslation` ADD CONSTRAINT `CancellationReasonsTranslation_cancellationReasonsId_fkey` FOREIGN KEY (`cancellationReasonsId`) REFERENCES `CancellationReasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
