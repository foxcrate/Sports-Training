/*
  Warnings:

  - A unique constraint covering the columns `[parentId,childId]` on the table `ParentsChilds` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ParentsChilds_parentId_childId_key` ON `ParentsChilds`(`parentId`, `childId`);
