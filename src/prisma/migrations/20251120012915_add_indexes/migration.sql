/*
  Warnings:

  - You are about to drop the column `accountId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledFor` on the `Post` table. All the data in the column will be lost.
  - Added the required column `instagramAccountId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_accountId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "accountId",
DROP COLUMN "errorMessage",
DROP COLUMN "scheduledFor",
ADD COLUMN     "error" TEXT,
ADD COLUMN     "instagramAccountId" TEXT NOT NULL,
ADD COLUMN     "scheduledTime" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "InstagramAccount_userId_idx" ON "InstagramAccount"("userId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
