-- AlterTable
ALTER TABLE `Message` ADD COLUMN `readerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_readerId_fkey` FOREIGN KEY (`readerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
