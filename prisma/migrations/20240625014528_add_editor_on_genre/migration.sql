-- AlterTable
ALTER TABLE `Genre` ADD COLUMN `editorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Genre` ADD CONSTRAINT `Genre_editorId_fkey` FOREIGN KEY (`editorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
