/*
  Warnings:

  - You are about to drop the column `imagePublicId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imagePublicId",
DROP COLUMN "imageUrl",
ADD COLUMN     "imagePublicIds" TEXT[],
ADD COLUMN     "images" TEXT[];
