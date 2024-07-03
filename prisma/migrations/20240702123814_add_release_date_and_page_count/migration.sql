/*
  Warnings:

  - You are about to drop the column `publishedDate` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Book` DROP COLUMN `publishedDate`,
    ADD COLUMN `pages` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `releaseDate` DATETIME(3) NULL;
