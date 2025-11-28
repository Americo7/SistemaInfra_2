/*
  Warnings:

  - A unique constraint covering the columns `[identity_key]` on the table `clusters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identity_key` to the `clusters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registro"."clusters" ADD COLUMN     "identity_key" VARCHAR(200) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clusters_identity_key_key" ON "registro"."clusters"("identity_key");
